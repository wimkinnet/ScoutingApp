import { io } from 'socket.io-client';

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// 2. Bepaal dynamisch de juiste backend URL
const SOCKET_URL = isLocalhost
  ? 'https://voice-control-9k4v.onrender.com' // DEV Render adres
  : 'https://scoutingapp-e1oh.onrender.com';  // PROD render adres

const socket = io(SOCKET_URL, {
  transports: ['websocket'], 
  upgrade: false, // Schakel HTTP-upgrades uit
  withCredentials: true,
  autoConnect: false, // CRUCIAL: Maak NIET automatisch verbinding bij het laden van de pagina!
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
});


socket.on('connect', () => {
  console.log('Connected to WebSocket server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from WebSocket server');
});

socket.on('connect_error', (error) => {
  console.error('WebSocket connection error:', error);
});

export default socket;