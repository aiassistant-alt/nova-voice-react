/**
 * ^AzureRealtimeClient
 * Author: Luis Arturo Parra - Telmo AI
 * Created: 2025-01-23
 * Usage: Cliente WebSocket para Azure OpenAI Realtime API
 * Business Context: Implementación oficial según documentación de Azure
 * Relations: useNovaAudio.js, VoiceAssistant.jsx
 * Reminders: Usa WebSocket directo a Azure OpenAI, no WebRTC
 */

class AzureRealtimeClient {
  constructor() {
    this.websocket = null
    this.isConnected = false
    this.audioContext = null
    this.mediaRecorder = null
    this.isRecording = false
    
    // ✅ CONFIGURACIÓN AZURE OPENAI - SEGÚN DOCUMENTACIÓN OFICIAL
    this.RESOURCE_NAME = "aiass-mf33a6qd-eastus2.cognitiveservices.azure.com"
    this.DEPLOYMENT = "gpt-4o-audio-preview-2"
    this.API_VERSION = "2024-10-01-preview"
    this.API_KEY = import.meta.env.VITE_AZURE_OPENAI_API_KEY || "YOUR_API_KEY_HERE"
    
    // URL WebSocket para Azure OpenAI Realtime
    this.WS_URL = `wss://${this.RESOURCE_NAME}/openai/deployments/${this.DEPLOYMENT}/realtime?api-version=${this.API_VERSION}`
    
    // Callbacks
    this.onConnected = null
    this.onDisconnected = null
    this.onError = null
    this.onAudioReceived = null
    this.onTextReceived = null
    
    console.log('🚀 [AzureRealtimeClient] Initialized for Azure OpenAI Realtime API')
  }

  /**
   * Conectar a Azure OpenAI Realtime API
   */
  async connect() {
    try {
      console.log('🔌 [AzureRealtimeClient] Connecting to Azure OpenAI...')
      console.log('🔧 [AzureRealtimeClient] Using API key:', this.API_KEY ? `${this.API_KEY.substring(0, 10)}...` : 'NOT_FOUND')
      console.log('🔧 [AzureRealtimeClient] WebSocket URL:', this.WS_URL)
      
      // Crear conexión WebSocket con headers de Azure
      this.websocket = new WebSocket(this.WS_URL)
      
      // Agregar headers después de crear el WebSocket (limitación del browser)
      // Los headers se envían en el primer mensaje
      
      return new Promise((resolve, reject) => {
        this.websocket.onopen = () => {
          console.log('✅ [AzureRealtimeClient] Connected to Azure OpenAI')
          this.isConnected = true
          
          // Enviar configuración inicial con API key
          this.sendConfiguration()
          this.setupEventHandlers()
          
          this.onConnected?.()
          resolve(true)
        }

        this.websocket.onerror = (error) => {
          console.error('❌ [AzureRealtimeClient] Connection error:', error)
          this.onError?.(error)
          reject(error)
        }

        this.websocket.onclose = (event) => {
          console.log('🔌 [AzureRealtimeClient] Connection closed:', event.code, event.reason)
          this.isConnected = false
          this.onDisconnected?.(event.reason)
        }
      })
      
    } catch (error) {
      console.error('❌ [AzureRealtimeClient] Connection failed:', error)
      this.onError?.(error)
      throw error
    }
  }

  /**
   * Configurar la sesión inicial
   */
  sendConfiguration() {
    const config = {
      type: "session.update",
      session: {
        instructions: "Eres Nova, un asistente de voz inteligente. Responde en español de manera natural y amigable.",
        voice: "alloy",
        input_audio_format: "pcm16",
        output_audio_format: "pcm16",
        turn_detection: {
          type: "server_vad",
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 200
        },
        temperature: 0.7,
        max_response_output_tokens: 300
      }
    }
    
    this.send(config)
    console.log('📤 [AzureRealtimeClient] Session configuration sent')
  }

  /**
   * Configurar manejadores de eventos WebSocket
   */
  setupEventHandlers() {
    this.websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        this.handleRealtimeEvent(data)
      } catch (error) {
        console.error('❌ [AzureRealtimeClient] Message parsing error:', error)
      }
    }
  }

  /**
   * Manejar eventos de la API Realtime
   */
  handleRealtimeEvent(event) {
    console.log('📥 [AzureRealtimeClient] Event received:', event.type)
    
    switch (event.type) {
      case 'session.created':
        console.log('✅ [AzureRealtimeClient] Session created')
        break
        
      case 'session.updated':
        console.log('✅ [AzureRealtimeClient] Session updated')
        break
        
      case 'response.audio.delta':
        console.log('🔊 [AzureRealtimeClient] Audio received')
        this.handleAudioDelta(event.delta)
        break
        
      case 'response.text.delta':
        console.log('💬 [AzureRealtimeClient] Text received:', event.delta)
        this.onTextReceived?.(event.delta)
        break
        
      case 'response.done':
        console.log('🏁 [AzureRealtimeClient] Response completed')
        break
        
      case 'error':
        console.error('❌ [AzureRealtimeClient] API error:', event.error)
        this.onError?.(event.error)
        break
        
      default:
        console.log('📋 [AzureRealtimeClient] Unknown event:', event.type)
    }
  }

  /**
   * Procesar audio delta
   */
  handleAudioDelta(audioData) {
    if (audioData && this.onAudioReceived) {
      // Convertir base64 a audio
      const audioBuffer = atob(audioData)
      this.onAudioReceived(audioBuffer)
    }
  }

  /**
   * Enviar mensaje por WebSocket
   */
  send(data) {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(data))
    } else {
      console.warn('⚠️ [AzureRealtimeClient] WebSocket not ready')
    }
  }

  /**
   * Iniciar grabación de audio
   */
  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      })
      
      this.mediaRecorder = new MediaRecorder(stream)
      this.isRecording = true
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.sendAudioData(event.data)
        }
      }
      
      this.mediaRecorder.start(100) // Enviar datos cada 100ms
      console.log('🎤 [AzureRealtimeClient] Recording started')
      
    } catch (error) {
      console.error('❌ [AzureRealtimeClient] Recording failed:', error)
      throw error
    }
  }

  /**
   * Detener grabación
   */
  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop()
      this.isRecording = false
      console.log('🛑 [AzureRealtimeClient] Recording stopped')
    }
  }

  /**
   * Enviar datos de audio
   */
  async sendAudioData(audioBlob) {
    try {
      const arrayBuffer = await audioBlob.arrayBuffer()
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
      
      const audioEvent = {
        type: "input_audio_buffer.append",
        audio: base64Audio
      }
      
      this.send(audioEvent)
    } catch (error) {
      console.error('❌ [AzureRealtimeClient] Audio send error:', error)
    }
  }

  /**
   * Crear respuesta
   */
  createResponse() {
    const responseEvent = {
      type: "response.create",
      response: {
        modalities: ["audio", "text"],
        instructions: "Responde de manera amigable en español"
      }
    }
    
    this.send(responseEvent)
    console.log('📤 [AzureRealtimeClient] Response requested')
  }

  /**
   * Desconectar
   */
  disconnect() {
    try {
      this.stopRecording()
      
      if (this.websocket) {
        this.websocket.close()
        this.websocket = null
      }
      
      this.isConnected = false
      console.log('✅ [AzureRealtimeClient] Disconnected')
      
    } catch (error) {
      console.error('❌ [AzureRealtimeClient] Disconnect error:', error)
    }
  }

  /**
   * Configurar callbacks
   */
  setCallbacks({ onConnected, onDisconnected, onError, onAudioReceived, onTextReceived }) {
    this.onConnected = onConnected
    this.onDisconnected = onDisconnected
    this.onError = onError
    this.onAudioReceived = onAudioReceived
    this.onTextReceived = onTextReceived
  }

  /**
   * Obtener estado de conexión
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      websocketState: this.websocket?.readyState || 'none',
      isRecording: this.isRecording
    }
  }
}

export default AzureRealtimeClient
