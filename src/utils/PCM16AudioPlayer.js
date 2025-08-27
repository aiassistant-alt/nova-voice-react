/**
 * ^PCM16AudioPlayer
 * Author: Luis Arturo Parra - Telmo AI
 * Created: 2025-01-28
 * Usage: Reproductor de audio PCM16 para respuestas Nova Sonic
 * Business Context: Convierte base64 PCM16 24kHz de Nova Sonic a audio reproducible
 * Relations: useNovaAudio hook, basado en ejemplos AWS oficiales
 * Reminders: Patrón EXACTO de amazon-nova-samples/speech-to-speech/sample-codes/websocket-nodejs
 */

/**
 * Convierte base64 PCM16 de Nova Sonic a Float32Array reproducible
 * Basado en: amazon-nova-samples/speech-to-speech/sample-codes/websocket-nodejs/public/src/main.js línea 458
 * @param {string} base64 - Audio en formato base64 PCM16 de Nova Sonic
 * @returns {Float32Array} - Array de audio reproducible
 */
export function base64ToFloat32Array(base64) {
  try {
    // Decodificar base64 a binary string
    const binaryString = atob(base64)
    
    // Crear array buffer from binary string
    const arrayBuffer = new ArrayBuffer(binaryString.length)
    const uint8View = new Uint8Array(arrayBuffer)
    
    for (let i = 0; i < binaryString.length; i++) {
      uint8View[i] = binaryString.charCodeAt(i)
    }
    
    // Convertir bytes a Int16Array (PCM16 little-endian)
    const int16View = new Int16Array(arrayBuffer)
    
    // Convertir Int16 a Float32 (rango -1.0 a 1.0)
    const float32Array = new Float32Array(int16View.length)
    for (let i = 0; i < int16View.length; i++) {
      float32Array[i] = int16View[i] / 32768.0  // Normalizar de 16-bit a float
    }
    
    console.log(`🔊 [PCM16AudioPlayer] Converted ${base64.length} base64 chars → ${float32Array.length} samples`)
    return float32Array
  } catch (error) {
    console.error('❌ [PCM16AudioPlayer] Error converting base64 to Float32Array:', error)
    return new Float32Array(0)
  }
}

/**
 * AudioWorklet Processor para reproducción continua de audio
 * Basado en: amazon-nova-samples AudioPlayerProcessor.worklet.js
 */
const AudioPlayerWorkletCode = `
class AudioPlayerProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this.audioQueue = []
    this.currentBuffer = null
    this.currentPosition = 0
    this.isPlaying = false
    
    console.log('🔊 [AudioPlayerProcessor] Initialized')
    
    this.port.onmessage = (event) => {
      if (event.data.type === 'audio') {
        this.audioQueue.push(event.data.audioData)
        this.isPlaying = true
        console.log('📥 [AudioPlayerProcessor] Received audio data, queue length:', this.audioQueue.length)
      } else if (event.data.type === 'stop') {
        this.audioQueue = []
        this.currentBuffer = null
        this.currentPosition = 0
        this.isPlaying = false
        console.log('🛑 [AudioPlayerProcessor] Stopped playback')
      }
    }
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0]
    if (!output || !output[0]) return true

    const outputChannel = output[0]
    const bufferLength = outputChannel.length

    // Llenar buffer de salida
    for (let i = 0; i < bufferLength; i++) {
      let sample = 0

      // Si no tenemos buffer actual, tomar del queue
      if (!this.currentBuffer && this.audioQueue.length > 0) {
        this.currentBuffer = this.audioQueue.shift()
        this.currentPosition = 0
        console.log('▶️ [AudioPlayerProcessor] Started new buffer, remaining in queue:', this.audioQueue.length)
      }

      // Si tenemos buffer, obtener sample
      if (this.currentBuffer && this.currentPosition < this.currentBuffer.length) {
        sample = this.currentBuffer[this.currentPosition]
        this.currentPosition++

        // Si terminamos el buffer actual, limpiarlo
        if (this.currentPosition >= this.currentBuffer.length) {
          console.log('✅ [AudioPlayerProcessor] Finished buffer')
          this.currentBuffer = null
          this.currentPosition = 0
          
          // Si no hay más audio en queue, notificar fin
          if (this.audioQueue.length === 0) {
            this.isPlaying = false
            this.port.postMessage({ type: 'playbackComplete' })
            console.log('🏁 [AudioPlayerProcessor] Playback complete')
          }
        }
      }

      outputChannel[i] = sample
    }

    return true
  }
}

registerProcessor('audio-player-processor', AudioPlayerProcessor)
`

/**
 * PCM16AudioPlayer - Reproductor principal
 * Basado en: amazon-nova-samples AudioPlayer.js patrón oficial
 */
export class PCM16AudioPlayer {
  constructor() {
    this.audioContext = null
    this.workletNode = null
    this.initialized = false
    this.isPlaying = false
    
    // Callbacks
    this.onPlaybackComplete = null
    this.onError = null
    
    console.log('🔊 [PCM16AudioPlayer] Constructor initialized')
  }

  /**
   * Inicializar AudioContext y AudioWorklet
   * Configurado para sample rate de Nova Sonic (24kHz output)
   */
  async initialize() {
    try {
      console.log('🔊 [PCM16AudioPlayer] Starting initialization...')

      // Crear AudioContext con sample rate específico para Nova Sonic
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 24000  // Nova Sonic output rate según memorias AWS
      })

      // Verificar sample rate
      console.log(`🔊 [PCM16AudioPlayer] AudioContext sample rate: ${this.audioContext.sampleRate}Hz`)

      // Crear AudioWorklet processor
      const workletBlob = new Blob([AudioPlayerWorkletCode], { type: 'application/javascript' })
      const workletUrl = URL.createObjectURL(workletBlob)

      await this.audioContext.audioWorklet.addModule(workletUrl)

      // Crear AudioWorklet node
      this.workletNode = new AudioWorkletNode(this.audioContext, 'audio-player-processor')

      // Configurar eventos del worklet
      this.workletNode.port.onmessage = (event) => {
        if (event.data.type === 'playbackComplete') {
          console.log('✅ [PCM16AudioPlayer] Playback completed')
          this.isPlaying = false
          this.onPlaybackComplete?.()
        }
      }

      // Conectar a salida de audio
      this.workletNode.connect(this.audioContext.destination)

      this.initialized = true
      console.log('✅ [PCM16AudioPlayer] Initialized successfully')

      // Limpiar URL
      URL.revokeObjectURL(workletUrl)

      return true
    } catch (error) {
      console.error('❌ [PCM16AudioPlayer] Initialization failed:', error)
      this.onError?.(error)
      return false
    }
  }

  /**
   * Reproducir audio Float32Array
   * Patrón EXACTO AWS: audioPlayer.playAudio(audioData)
   * @param {Float32Array} samples - Audio samples to play
   */
  async playAudio(samples) {
    try {
      // Verificar inicialización
      if (!this.initialized) {
        console.warn('⚠️ [PCM16AudioPlayer] Not initialized, initializing now...')
        const success = await this.initialize()
        if (!success) {
          throw new Error('Failed to initialize audio player')
        }
      }

      // Verificar AudioContext state
      if (this.audioContext.state === 'suspended') {
        console.log('🔊 [PCM16AudioPlayer] Resuming AudioContext...')
        await this.audioContext.resume()
      }

      console.log(`🔊 [PCM16AudioPlayer] Playing audio: ${samples.length} samples`)

      // Enviar audio al worklet (patrón AWS oficial)
      this.workletNode.port.postMessage({
        type: 'audio',
        audioData: samples
      })

      this.isPlaying = true
      return true
    } catch (error) {
      console.error('❌ [PCM16AudioPlayer] Playback failed:', error)
      this.onError?.(error)
      return false
    }
  }

  /**
   * Detener reproducción
   */
  stop() {
    if (this.workletNode) {
      console.log('🛑 [PCM16AudioPlayer] Stopping playback...')
      this.workletNode.port.postMessage({ type: 'stop' })
      this.isPlaying = false
    }
  }

  /**
   * Configurar callbacks
   */
  setCallbacks({ onPlaybackComplete, onError }) {
    this.onPlaybackComplete = onPlaybackComplete
    this.onError = onError
  }

  /**
   * Obtener estado
   */
  getStatus() {
    return {
      initialized: this.initialized,
      isPlaying: this.isPlaying,
      audioContextState: this.audioContext?.state,
      sampleRate: this.audioContext?.sampleRate
    }
  }

  /**
   * Limpiar recursos
   */
  cleanup() {
    console.log('🧹 [PCM16AudioPlayer] Cleaning up...')
    
    this.stop()
    
    if (this.workletNode) {
      this.workletNode.disconnect()
      this.workletNode = null
    }
    
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
    
    this.initialized = false
  }
}

export default PCM16AudioPlayer
