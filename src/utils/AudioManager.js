/**
 * ^AudioManager
 * Author: Luis Arturo Parra - Telmo AI
 * Created: 2025-01-26
 * Usage: Captura y procesamiento de audio para Nova Sonic
 * Business Context: Convierte audio del micrófono a formato PCM16 base64
 * Relations: useNovaAudio hook, VoiceAssistant component
 * Reminders: Basado en ejemplos AWS amazon-nova-samples, 16kHz mono PCM16
 */

class AudioManager {
  constructor() {
    this.audioContext = null
    this.mediaStream = null
    this.audioWorkletNode = null
    this.isRecording = false
    this.isInitialized = false
    
    // Configuración AWS Nova Sonic oficial
    this.config = {
      sampleRate: 16000,      // Nova Sonic input requirement
      channelCount: 1,        // Mono
      bitDepth: 16,           // PCM16
      chunkSize: 1024,        // ~64ms chunks at 16kHz
      bufferSize: 4096        // AudioWorklet buffer
    }
    
    // Callbacks
    this.onAudioData = null
    this.onError = null
    this.onStatusChange = null
    
    console.log('🎤 [AudioManager] Initialized with config:', this.config)
  }

  /**
   * Inicializar AudioContext y configuración WebAudio
   */
  async initialize() {
    try {
      console.log('🎤 [AudioManager] Starting initialization...')

      // Crear AudioContext con sample rate correcto
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: this.config.sampleRate
      })

      // Verificar sample rate
      if (this.audioContext.sampleRate !== this.config.sampleRate) {
        console.warn(`🎤 [AudioManager] Sample rate mismatch: ${this.audioContext.sampleRate} vs ${this.config.sampleRate}`)
      }

      this.isInitialized = true
      console.log('✅ [AudioManager] Initialized successfully')
      
      this.onStatusChange?.('initialized')
      return true
    } catch (error) {
      console.error('❌ [AudioManager] Initialization failed:', error)
      this.onError?.(error)
      return false
    }
  }

  /**
   * Iniciar captura de audio del micrófono
   */
  async startRecording() {
    try {
      console.log('🎤 [AudioManager] Starting recording...')

      if (!this.isInitialized) {
        await this.initialize()
      }

      // Solicitar acceso al micrófono
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: this.config.channelCount,
          sampleRate: this.config.sampleRate,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      // Crear MediaStreamSource
      const source = this.audioContext.createMediaStreamSource(this.mediaStream)

      // Crear AudioWorklet para procesamiento continuo
      await this.audioContext.audioWorklet.addModule(this.createAudioWorkletProcessor())
      
      this.audioWorkletNode = new AudioWorkletNode(this.audioContext, 'audio-processor', {
        processorOptions: {
          chunkSize: this.config.chunkSize,
          sampleRate: this.config.sampleRate
        }
      })

      // Conectar pipeline: source → worklet
      source.connect(this.audioWorkletNode)

      // Escuchar datos del AudioWorklet
      this.audioWorkletNode.port.onmessage = (event) => {
        if (event.data.type === 'audioData') {
          this.processAudioChunk(event.data.audioData)
        }
      }

      this.isRecording = true
      console.log('✅ [AudioManager] Recording started')
      this.onStatusChange?.('recording')

      return true
    } catch (error) {
      console.error('❌ [AudioManager] Failed to start recording:', error)
      this.onError?.(error)
      return false
    }
  }

  /**
   * Detener captura de audio
   */
  stopRecording() {
    try {
      console.log('🎤 [AudioManager] Stopping recording...')

      if (this.audioWorkletNode) {
        this.audioWorkletNode.disconnect()
        this.audioWorkletNode = null
      }

      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => track.stop())
        this.mediaStream = null
      }

      this.isRecording = false
      console.log('✅ [AudioManager] Recording stopped')
      this.onStatusChange?.('stopped')
    } catch (error) {
      console.error('❌ [AudioManager] Failed to stop recording:', error)
      this.onError?.(error)
    }
  }

  /**
   * Procesar chunk de audio y convertir a PCM16 base64
   * Basado en amazon-nova-samples/speech-to-speech/
   */
  processAudioChunk(float32Array) {
    try {
      // Convertir Float32 a PCM16 (signed 16-bit integers)
      const pcm16Array = new Int16Array(float32Array.length)
      
      for (let i = 0; i < float32Array.length; i++) {
        // Clamp to [-1, 1] range y convertir a 16-bit
        const sample = Math.max(-1, Math.min(1, float32Array[i]))
        pcm16Array[i] = Math.round(sample * 0x7FFF)
      }

      // Convertir a buffer de bytes (little-endian)
      const buffer = new ArrayBuffer(pcm16Array.length * 2)
      const view = new DataView(buffer)
      
      for (let i = 0; i < pcm16Array.length; i++) {
        view.setInt16(i * 2, pcm16Array[i], true) // little-endian
      }

      // Convertir a base64 (compatible con Nova Sonic)
      const base64 = this.arrayBufferToBase64(buffer)

      // Enviar chunk procesado
      if (this.onAudioData && base64.length > 0) {
        this.onAudioData({
          data: base64,
          format: 'PCM16',
          sampleRate: this.config.sampleRate,
          channels: this.config.channelCount,
          size: buffer.byteLength
        })
      }

      console.log(`📊 [AudioManager] Processed chunk: ${buffer.byteLength} bytes → ${base64.length} base64 chars`)
    } catch (error) {
      console.error('❌ [AudioManager] Failed to process audio chunk:', error)
      this.onError?.(error)
    }
  }

  /**
   * Convertir ArrayBuffer a base64
   */
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer)
    const chunkSize = 8192 // Evitar stack overflow
    let result = ''
    
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.slice(i, i + chunkSize)
      result += String.fromCharCode.apply(null, chunk)
    }
    
    return btoa(result)
  }

  /**
   * Crear AudioWorklet processor como blob URL
   */
  createAudioWorkletProcessor() {
    const processorCode = `
      class AudioProcessor extends AudioWorkletProcessor {
        constructor(options) {
          super()
          this.chunkSize = options.processorOptions.chunkSize || 1024
          this.buffer = new Float32Array(0)
        }

        process(inputs, outputs, parameters) {
          const input = inputs[0]
          if (!input || !input[0]) return true

          // Acumular audio en buffer
          const inputData = input[0] // Canal 0 (mono)
          const newBuffer = new Float32Array(this.buffer.length + inputData.length)
          newBuffer.set(this.buffer)
          newBuffer.set(inputData, this.buffer.length)
          this.buffer = newBuffer

          // Enviar chunks cuando tengamos suficiente data
          while (this.buffer.length >= this.chunkSize) {
            const chunk = this.buffer.slice(0, this.chunkSize)
            this.buffer = this.buffer.slice(this.chunkSize)

            // Enviar a main thread
            this.port.postMessage({
              type: 'audioData',
              audioData: chunk
            })
          }

          return true
        }
      }

      registerProcessor('audio-processor', AudioProcessor)
    `

    const blob = new Blob([processorCode], { type: 'application/javascript' })
    return URL.createObjectURL(blob)
  }

  /**
   * Limpiar recursos
   */
  cleanup() {
    this.stopRecording()
    
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
    
    this.isInitialized = false
    console.log('🧹 [AudioManager] Cleanup completed')
  }

  /**
   * Configurar callbacks
   */
  setCallbacks({ onAudioData, onError, onStatusChange }) {
    this.onAudioData = onAudioData
    this.onError = onError
    this.onStatusChange = onStatusChange
  }

  /**
   * Obtener estado actual
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      isRecording: this.isRecording,
      sampleRate: this.audioContext?.sampleRate,
      config: this.config
    }
  }
}

export default AudioManager
