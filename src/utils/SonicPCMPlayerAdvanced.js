/**
 * ^SonicPCMPlayerAdvanced  
 * Author: Luis Arturo Parra - Telmo AI
 * Created: 2025-01-27
 * Usage: Advanced PCM audio player with continuous buffering for Nova Sonic
 * Business Context: Soluciona trabazón de audio implementando sistema continuo como AWS oficial
 * Relations: Reemplaza sistema de múltiples Audio elements en VoiceAssistant
 * Reminders: Basado en AudioPlayer.js de ejemplos oficiales AWS Nova Sonic
 */

export class SonicPCMPlayerAdvanced {
  constructor() {
    this.audioContext = null;
    this.workletNode = null;
    this.analyser = null;
    this.initialized = false;
    this.jitterBuffer = [];
    this.JITTER_BUFFER_SIZE = 8; // ✅ AWS style jitter buffer
    this.isBuffering = true;
    this.onStatusListeners = [];
  }

  async initialize() {
    try {
      // ✅ Use 24kHz sample rate like AWS official examples
      this.audioContext = new AudioContext({ sampleRate: 24000 });
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 512;

      // Load AudioWorklet processor
      const workletUrl = '/audio-processor.worklet.js';
      await this.audioContext.audioWorklet.addModule(workletUrl);
      
      this.workletNode = new AudioWorkletNode(this.audioContext, 'sonic-audio-processor');
      this.workletNode.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);

      // Listen for status updates from worklet
      this.workletNode.port.onmessage = (event) => {
        if (event.data.type === 'status-response') {
          this.onStatusListeners.forEach(listener => listener(event.data.status));
        }
      };

      this.initialized = true;
      console.log('✅ [SonicPCMPlayerAdvanced] Initialized with continuous buffer system');
    } catch (error) {
      console.error('❌ [SonicPCMPlayerAdvanced] Initialization failed:', error);
      throw error;
    }
  }

  playPCM16(base64Data) {
    if (!this.initialized || !this.workletNode) {
      console.error('❌ [SonicPCMPlayerAdvanced] Not initialized');
      return;
    }

    try {
      // Convert base64 to PCM16 (AWS pattern)
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Convert to Float32Array for AudioWorklet
      const pcm16Array = new Int16Array(bytes.buffer);
      const float32Array = new Float32Array(pcm16Array.length);
      
      // Normalize PCM16 to Float32 (AWS pattern)
      for (let i = 0; i < pcm16Array.length; i++) {
        float32Array[i] = pcm16Array[i] / 32768.0;
      }

      // ✅ Add to jitter buffer first (like AWS ExpandableBuffer)
      this.jitterBuffer.push(float32Array);
      
      // Process jitter buffer in batches
      if (this.jitterBuffer.length >= 2 || !this.isBuffering) {
        this.flushJitterBuffer();
      }
      
      // Mark as not buffering after first chunks
      if (this.jitterBuffer.length >= 3) {
        this.isBuffering = false;
      }

    } catch (error) {
      console.error('❌ [SonicPCMPlayerAdvanced] Error processing PCM16:', error);
    }
  }

  flushJitterBuffer() {
    while (this.jitterBuffer.length > 0) {
      const chunk = this.jitterBuffer.shift();
      if (chunk && this.workletNode) {
        // Send to continuous audio processor
        this.workletNode.port.postMessage({
          type: 'audio',
          audioData: chunk
        });
      }
    }
  }

  bargeIn() {
    if (this.workletNode) {
      // Clear buffer for immediate response (AWS pattern)
      this.workletNode.port.postMessage({ type: 'clear' });
      this.jitterBuffer = [];
      this.isBuffering = true;
      console.log('🔄 [SonicPCMPlayerAdvanced] Barge-in executed - buffer cleared');
    }
  }

  getBufferStatus() {
    if (this.workletNode) {
      this.workletNode.port.postMessage({ type: 'status' });
    }
  }

  onStatus(callback) {
    this.onStatusListeners.push(callback);
  }

  getVolume() {
    if (!this.initialized || !this.analyser) return 0;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteTimeDomainData(dataArray);
    
    // Calculate RMS like AWS examples
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const sample = (dataArray[i] / 128.0) - 1.0;
      sum += sample * sample;
    }
    return Math.sqrt(sum / dataArray.length);
  }

  stop() {
    try {
      if (this.audioContext) {
        this.audioContext.close();
      }
      if (this.analyser) {
        this.analyser.disconnect();
      }
      if (this.workletNode) {
        this.workletNode.disconnect();
      }
      
      this.jitterBuffer = [];
      this.initialized = false;
      this.audioContext = null;
      this.analyser = null;
      this.workletNode = null;
      
      console.log('✅ [SonicPCMPlayerAdvanced] Stopped and cleaned up');
    } catch (error) {
      console.error('❌ [SonicPCMPlayerAdvanced] Error during stop:', error);
    }
  }
}

