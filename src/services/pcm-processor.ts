declare class AudioWorkletProcessor {
  readonly port: MessagePort;
}
declare function registerProcessor(name: string, ctor: any): void;

class PcmProcessor extends AudioWorkletProcessor {
  process(inputs: Float32Array[][]) {
    const input = inputs[0];
    if (!input || !input[0]) return true; // Vangnet voor lege audio-inputs

    const inputData = input[0]; // Kanaal 0 (Mono)
    
    // Converteer Float32 naar Int16 PCM
    const pcmData = new Int16Array(inputData.length);
    for (let i = 0; i < inputData.length; i++) {
      pcmData[i] = Math.min(1, Math.max(-1, inputData[i])) * 0x7FFF;
    }
    
    // Post de buffer terug naar de hoofdthread
    this.port.postMessage(pcmData.buffer, [pcmData.buffer]);
    return true;
  }
}

registerProcessor('pcm-processor', PcmProcessor);