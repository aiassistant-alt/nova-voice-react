/**
 * ^NovaSocketClient
 * Author: Luis Arturo Parra - Telmo AI
 * Created: 2025-01-26
 * Usage: Cliente WebSocket para conexión con Nova Sonic Backend
 * Business Context: Conecta frontend con backend Nova Sonic (puerto 8080)
 * Relations: useNovaAudio hook, AudioManager, backend nova_sonic_server_official.js
 * Reminders: Backend ya funciona al 98%, maneja eventos AWS oficiales
 */

import { io } from 'socket.io-client'

class NovaSocketClient {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.sessionId = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    
    // Backend URLs - CONECTAR DIRECTO A AWS ECS como solicita el usuario
    // TEMPORALMENTE usando URL genérica - usuario debe verificar su ALB real
    this.backendUrl = 'http://nova-voice-backend-alb.us-east-1.elb.amazonaws.com:8080' // AWS ECS Nova Sonic Backend
    
    console.warn('⚠️ [NovaSocketClient] USAR URL ALB REAL - verificar en AWS Console')

    // Callbacks para eventos
    this.onConnected = null
    this.onDisconnected = null
    this.onError = null
    this.onAudioOutput = null
    this.onTextOutput = null
    this.onContentEnd = null
    this.onSessionReady = null

    console.log('🔌 [NovaSocketClient] Initialized for backend:', this.backendUrl)
  }

  /**
   * Conectar al backend Nova Sonic
   */
  async connect() {
    try {
      console.log('🔌 [NovaSocketClient] Connecting to Nova Sonic backend...')

      this.socket = io(this.backendUrl, {
        transports: ['websocket'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 2000
      })

      // Event listeners
      this.setupEventHandlers()

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'))
        }, 10000)

        this.socket.on('connect', () => {
          clearTimeout(timeout)
          resolve(true)
        })

        this.socket.on('connect_error', (error) => {
          clearTimeout(timeout)
          reject(error)
        })
      })

    } catch (error) {
      console.error('❌ [NovaSocketClient] Connection failed:', error)
      this.onError?.(error)
      throw error
    }
  }

  /**
   * Configurar event handlers para comunicación bidireccional
   */
  setupEventHandlers() {
    // Eventos de conexión
    this.socket.on('connect', () => {
      console.log('✅ [NovaSocketClient] Connected to Nova Sonic backend')
      this.isConnected = true
      this.sessionId = this.socket.id
      this.reconnectAttempts = 0
      this.onConnected?.(this.sessionId)
    })

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 [NovaSocketClient] Disconnected:', reason)
      this.isConnected = false
      this.onDisconnected?.(reason)
    })

    // Eventos de Nova Sonic (basados en backend funcional)
    this.socket.on('sessionReady', (data) => {
      console.log('✅ [NovaSocketClient] Session ready:', data)
      this.onSessionReady?.(data)
    })

    this.socket.on('audioOutput', (data) => {
      console.log('🔊 [NovaSocketClient] Audio output received:', data.content?.length || 0, 'chars')
      this.onAudioOutput?.(data)
    })

    this.socket.on('textOutput', (data) => {
      console.log('💬 [NovaSocketClient] Text output received:', data.text?.substring(0, 50) + '...')
      this.onTextOutput?.(data)
    })

    this.socket.on('contentEnd', (data) => {
      console.log('🏁 [NovaSocketClient] Content ended:', data)
      this.onContentEnd?.(data)
    })

    this.socket.on('novaError', (error) => {
      console.error('❌ [NovaSocketClient] Nova Sonic error:', error)
      this.onError?.(error)
    })

    // Eventos de reconexión
    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 [NovaSocketClient] Reconnected after', attemptNumber, 'attempts')
      this.reconnectAttempts = attemptNumber
    })

    this.socket.on('reconnect_failed', () => {
      console.error('❌ [NovaSocketClient] Reconnection failed after', this.maxReconnectAttempts, 'attempts')
      this.onError?.(new Error('Reconnection failed'))
    })
  }

  /**
   * Iniciar sesión de audio con Nova Sonic
   * Basado en backend nova_sonic_server_official.js
   */
  startAudioSession() {
    if (!this.isConnected) {
      throw new Error('Not connected to backend')
    }

    console.log('🚀 [NovaSocketClient] Starting Nova Sonic audio session...')
    
    // Evento que maneja nuestro backend (línea 567 en nova_sonic_server_official.js)
    this.socket.emit('startAudioSession', {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      config: {
        inputFormat: 'PCM16',
        inputSampleRate: 16000,
        outputFormat: 'PCM16', 
        outputSampleRate: 24000,
        channels: 1
      }
    })
  }

  /**
   * Enviar chunk de audio a Nova Sonic
   * Compatible con backend existente (audioInput event)
   */
  sendAudioChunk(audioData) {
    if (!this.isConnected || !audioData.data) {
      console.warn('⚠️ [NovaSocketClient] Cannot send audio - not connected or no data')
      return
    }

    // Formato compatible con backend Nova Sonic
    const audioEvent = {
      sessionId: this.sessionId,
      audio: audioData.data,        // Base64 PCM16
      format: audioData.format,     // 'PCM16'
      sampleRate: audioData.sampleRate, // 16000
      channels: audioData.channels, // 1
      size: audioData.size,         // Buffer size
      timestamp: Date.now()
    }

    this.socket.emit('audioInput', audioEvent)
    console.log(`📤 [NovaSocketClient] Sent audio chunk: ${audioData.size} bytes`)
  }

  /**
   * Finalizar entrada de audio
   */
  endAudioInput() {
    if (!this.isConnected) return

    console.log('🏁 [NovaSocketClient] Ending audio input...')
    this.socket.emit('audioEnd', {
      sessionId: this.sessionId,
      timestamp: Date.now()
    })
  }

  /**
   * Desconectar del backend
   */
  disconnect() {
    if (this.socket) {
      console.log('🔌 [NovaSocketClient] Disconnecting...')
      this.socket.disconnect()
      this.socket = null
    }
    this.isConnected = false
    this.sessionId = null
  }

  /**
   * Configurar callbacks para eventos
   */
  setCallbacks({
    onConnected,
    onDisconnected,
    onError,
    onAudioOutput,
    onTextOutput,
    onContentEnd,
    onSessionReady
  }) {
    this.onConnected = onConnected
    this.onDisconnected = onDisconnected
    this.onError = onError
    this.onAudioOutput = onAudioOutput
    this.onTextOutput = onTextOutput
    this.onContentEnd = onContentEnd
    this.onSessionReady = onSessionReady
  }

  /**
   * Obtener estado de conexión
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      sessionId: this.sessionId,
      backendUrl: this.backendUrl,
      reconnectAttempts: this.reconnectAttempts,
      socketId: this.socket?.id
    }
  }

  /**
   * Test de conexión al backend
   */
  async testConnection() {
    try {
      if (!this.isConnected) {
        throw new Error('Not connected')
      }

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Ping timeout'))
        }, 5000)

        this.socket.emit('ping', { timestamp: Date.now() }, (response) => {
          clearTimeout(timeout)
          console.log('🏓 [NovaSocketClient] Ping response:', response)
          resolve(response)
        })
      })
    } catch (error) {
      console.error('❌ [NovaSocketClient] Connection test failed:', error)
      throw error
    }
  }

  /**
   * Reconectar manualmente
   */
  reconnect() {
    if (this.socket) {
      console.log('🔄 [NovaSocketClient] Manual reconnection...')
      this.socket.connect()
    }
  }
}

export default NovaSocketClient
