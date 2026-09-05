import { Server } from 'socket.io';
import WebSocket from 'ws';

let io: Server | null = null;

export const initSocket = (server: any) => {

  const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
  const allowedOrigins = CLIENT_ORIGIN.split(',');

  io = new Server(server, {
    cors: {
      // 1. Geef expliciet je allowed origins mee in plaats van '*' om credentials te ondersteunen
      origin: allowedOrigins,
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true
    },
    // 2. Voorkom timeouts op de proxy van Render
    pingTimeout: 60000,
    pingInterval: 25000
  });

  io.on('connection', (socket) => {
    console.log('A client connected:', socket.id);

    let openAiWs: WebSocket | null = null;

    // 1. Wanneer de gebruiker de spraakknop ingedrukt houdt in React
    socket.on('start-speech-stream', () => {
      console.log(`Live Speech-to-Text gestart voor client: ${socket.id}`);

      if (!process.env.OPENAI_API_KEY) {
        console.error("CRITISCHE FOUT: process.env.OPENAI_API_KEY is leeg of niet gevonden op Render!");
        socket.emit('speech-error', 'API key configuratiefout op de server.');
        return;
      }

      // HIER STAAT NU DE JUISTE MODEL-URL INGEVULD
      const url = "wss://api.openai.com/v1/realtime?intent=transcription";
      
      try {
        openAiWs = new WebSocket(url, {
          headers: {
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          },
        });

        // Belangrijk: Luister DIRECT naar fouten van de OpenAI websocket zelf
        openAiWs.addEventListener('error', (err: any) => {
          console.error('⚠️ Directe OpenAI WebSocket Fout opgevangen:', err.message || err);
          socket.emit('speech-error', 'Verbinding met OpenAI mislukt.');
        });

        openAiWs.addEventListener('open', () => {
          console.log("🟢 Succesvol een beveiligde pijp geopend naar OpenAI Realtime API!");
          
          const sessionUpdate = {
            type: "session.update",
            session: {
              type: "transcription", // Dwingt pure live Speech-to-Text af
              audio: {
                input: {
                  format: {
                    type: "audio/pcm",
                    rate: 24000
                  },
                  transcription: {
                    model: "gpt-4o-mini-transcribe" // Het officiële real-time STT model van OpenAI
                  }
                }
              }
            }
          };
          
          if (openAiWs && openAiWs.readyState === WebSocket.OPEN) {
            openAiWs.send(JSON.stringify(sessionUpdate));
          }
        });

        openAiWs.addEventListener('message', (event) => {
          try {
            const openAiEvent = JSON.parse(event.data.toString());
            console.log("OpenAI Event Type:", openAiEvent.type);

            if (openAiEvent.type === 'conversation.item.input_audio_transcription.delta' && openAiEvent.delta) {
              socket.emit('speech-text-delta', openAiEvent.delta);
            } 
            else if (openAiEvent.type === 'error' && openAiEvent.error) {
              console.error("❌ OpenAI API inhoudelijke fout:", openAiEvent.error.message);
              socket.emit('speech-error', openAiEvent.error.message);
            }
          } catch (err) {
            console.error('Fout bij parsen van OpenAI bericht:', err);
          }
        });

        // Als OpenAI de verbinding onverwacht sluit
        openAiWs.addEventListener('close', (event) => {
          console.log(`🔴 OpenAI verbinding gesloten (Code: ${event.code}, Reden: ${event.reason || 'Geen'})`);
        });

      } catch (error) {
        console.error('💥 Fatale fout tijdens initialisatie van OpenAI verbinding:', error);
        socket.emit('speech-error', 'Server kon de spraak-service niet starten.');
      }
    });


    // 2. Event dat continu de audio-chunks ontvangt vanuit de React-microfoon
    socket.on('audio-chunk', (audioBuffer: Buffer) => {
      console.log(`Ontvangen audio-chunk van client ${socket.id}, grootte: ${audioBuffer.length} bytes`);
      if (openAiWs && openAiWs.readyState === WebSocket.OPEN) {
        // De server zet de binaire buffer om naar Base64
        const base64AudioString = Buffer.from(audioBuffer).toString('base64');
    
        openAiWs.send(JSON.stringify({
          type: "input_audio_buffer.append",
          audio: base64AudioString
        }));
      }
    });

    // 3. Wanneer de gebruiker de knop weer loslaat in React
    socket.on('stop-speech-stream', () => {
      console.log(`Live Speech-to-Text gestopt voor client: ${socket.id}`);
      if (openAiWs) {
        openAiWs.close();
        openAiWs = null;
        console.log(`Live Speech-to-Text gesloten voor client: ${socket.id}`);
      }
    });

    socket.on('disconnect', () => {
      if (openAiWs) {
        openAiWs.close();
        openAiWs = null;
      }
      console.log('A client disconnected:', socket.id);
    });
  });

  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initSocket first.');
  }
  return io;
};