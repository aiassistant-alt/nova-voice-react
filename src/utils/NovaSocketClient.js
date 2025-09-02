/**
 * ^NovaSocketClient
 * Author: Luis Arturo Parra - Telmo AI
 * Created: 2025-01-26 | Updated: 2025-01-28 (AWS DIRECT CONNECTION)
 * Usage: Cliente WebSocket para conexión DIRECTA con AWS Lambda Nova Sonic
 * Business Context: Conecta frontend con Lambda Nova Sonic via API Gateway WebSocket
 * Relations: useNovaAudio hook, AWS Lambda, API Gateway WebSocket, CloudFront
 * Reminders: AWS Lambda Nova Sonic + API Gateway WebSocket (NO Socket.IO)
 */

class NovaSocketClient {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.sessionId = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    
    // 🚀 AWS DIRECTO: URL de API Gateway WebSocket para Lambda Nova Sonic (con stage)
    this.backendUrl = 'wss://az79e1erja.execute-api.us-east-1.amazonaws.com/production'
    
    console.log('🚀 [NovaSocketClient] AWS DIRECTO - Lambda Nova Sonic WebSocket')

    // Callbacks para eventos
    this.onConnected = null
    this.onDisconnected = null
    this.onError = null
    this.onAudioOutput = null
    this.onTextOutput = null
    this.onContentEnd = null
    this.onSessionReady = null

    console.log('🔌 [NovaSocketClient] Initialized for AWS Lambda Nova Sonic:', this.backendUrl)
  }

  /**
   * Conectar al AWS Lambda Nova Sonic via API Gateway WebSocket
   */
  async connect() {
    try {
      console.log('🔌 [NovaSocketClient] Connecting to AWS Lambda Nova Sonic WebSocket...')

      // ✅ PATRÓN AWS: Obtener token Cognito de localStorage  
      let authToken = ''
      if (typeof window !== 'undefined') {
        console.log('🔍 [NovaSocketClient] Searching for Cognito authentication tokens...')
        
        const allKeys = Object.keys(localStorage)
        console.log('🔍 [NovaSocketClient] Available localStorage keys:', allKeys)
        
        // Buscar claves reales de Cognito en formato AWS
        const cognitoKeys = allKeys.filter(key => 
          key.includes('CognitoIdentityServiceProvider') && 
          (key.includes('.idToken') || key.includes('.accessToken'))
        )
        
        console.log('🔍 [NovaSocketClient] Found Cognito keys:', cognitoKeys)
        
        // Intentar extraer token directamente de las claves reales
        for (const key of cognitoKeys) {
          const tokenValue = localStorage.getItem(key)
          if (tokenValue && tokenValue.length > 50) { // Tokens JWT son largos
            authToken = tokenValue
            console.log(`✅ [NovaSocketClient] Found Cognito token in: ${key.substring(0, 50)}...`)
            break
          }
        }
        
        if (!authToken) {
          console.warn('⚠️ [NovaSocketClient] No valid Cognito token found - trying anonymous connection')
        }
      }
      
      // ✅ AWS API Gateway WebSocket URL (sin token porque AuthorizationType=NONE)
      const wsUrl = this.backendUrl
        
      console.log('🔌 [NovaSocketClient] AWS WebSocket URL:', wsUrl.replace(/token=.*/, 'token=***'))

      // ✅ WEBSOCKET NATIVO para AWS API Gateway + Lambda
      this.socket = new WebSocket(wsUrl)

      // Configurar event handlers WebSocket nativos
      this.setupEventHandlers()

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('AWS WebSocket connection timeout'))
        }, 10000)

        this.socket.onopen = () => {
          clearTimeout(timeout)
          console.log('✅ [NovaSocketClient] Connected to AWS Lambda Nova Sonic')
          this.isConnected = true
          this.sessionId = Date.now().toString() // Generar session ID
          this.reconnectAttempts = 0
          this.onConnected?.(this.sessionId)
          resolve(true)
        }

        this.socket.onerror = (error) => {
          clearTimeout(timeout)
          console.error('❌ [NovaSocketClient] AWS WebSocket error:', error)
          this.onError?.(error)
          reject(error)
        }
      })

    } catch (error) {
      console.error('❌ [NovaSocketClient] AWS connection failed:', error)
      this.onError?.(error)
      throw error
    }
  }

  /**
   * Configurar event handlers para WebSocket nativo AWS
   */
  setupEventHandlers() {
    // ✅ AWS WebSocket message handler - recibe eventos del Lambda Nova Sonic
    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('📥 [NovaSocketClient] AWS Lambda message:', data.type || data.action || 'unknown')

        // Manejar diferentes tipos de eventos del Lambda Nova Sonic
        switch (data.type || data.action) {
          case 'sessionReady':
            console.log('✅ [NovaSocketClient] Lambda session ready:', data)
            this.onSessionReady?.(data)
            break

          case 'audioOutput':
            console.log('🔊 [NovaSocketClient] Lambda audio output:', data.content?.length || 0, 'chars')
            this.onAudioOutput?.(data)
            break

          case 'textOutput':
            console.log('💬 [NovaSocketClient] Lambda text output:', data.text?.substring(0, 50) + '...')
            this.onTextOutput?.(data)
            break

          case 'contentEnd':
            console.log('🏁 [NovaSocketClient] Lambda content ended:', data)
            this.onContentEnd?.(data)
            break

          case 'contentStart':
            console.log('📋 [NovaSocketClient] Lambda content started:', data)
            break

          case 'error':
            console.error('❌ [NovaSocketClient] Lambda error:', data)
            this.onError?.(data)
            break

          default:
            console.log('📋 [NovaSocketClient] Unknown Lambda message type:', data)
        }
      } catch (error) {
        console.error('❌ [NovaSocketClient] Error parsing Lambda message:', error)
        this.onError?.(error)
      }
    }

    // ✅ AWS WebSocket close handler
    this.socket.onclose = (event) => {
      console.log('🔌 [NovaSocketClient] AWS WebSocket closed:', event.code, event.reason)
      this.isConnected = false
      this.onDisconnected?.(event.reason || 'AWS connection closed')
      
      // Auto-reconexión con backoff exponencial
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          this.reconnectAttempts++
          console.log(`🔄 [NovaSocketClient] Reconnecting to AWS... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
          this.connect().catch(error => {
            console.error('❌ [NovaSocketClient] AWS reconnection failed:', error)
          })
        }, 2000 * this.reconnectAttempts)
      }
    }
  }

  /**
   * Iniciar sesión de audio con AWS Lambda Nova Sonic
   * Envía configuración inicial via WebSocket
   */
  startAudioSession() {
    if (!this.isConnected || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('AWS WebSocket not connected')
    }

    console.log('🚀 [NovaSocketClient] Starting AWS Lambda Nova Sonic audio session...')
    
    // ✅ MENSAJE JSON para AWS Lambda via API Gateway WebSocket
    const message = {
      action: 'startSession',
      data: {
        sessionId: this.sessionId,
        timestamp: Date.now(),
        config: {
          inputFormat: 'PCM16',
          inputSampleRate: 16000,
          outputFormat: 'PCM16', 
          outputSampleRate: 24000,
          channels: 1,
          model: 'amazon.nova-sonic-v1:0'
        }
      }
    }

    this.socket.send(JSON.stringify(message))
  }

  /**
   * Enviar chunk de audio a AWS Lambda Nova Sonic
   * Formato JSON para API Gateway WebSocket
   */
  sendAudioChunk(audioData) {
    if (!this.isConnected || !audioData.data || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('⚠️ [NovaSocketClient] Cannot send audio - AWS not connected')
      return
    }

    // ✅ FORMATO JSON para AWS Lambda Nova Sonic WebSocket
    const message = {
      action: 'audioInput',
      data: {
        sessionId: this.sessionId,
        audio: audioData.data,        // Base64 audio
        format: audioData.format,     // 'WEBM_OPUS' o 'PCM16'
        sampleRate: audioData.sampleRate || 16000,
        channels: audioData.channels || 1,
        size: audioData.size,         // Buffer size
        timestamp: Date.now()
      }
    }

    this.socket.send(JSON.stringify(message))
    console.log(`📤 [NovaSocketClient] Sent audio chunk to AWS: ${audioData.size} bytes`)
  }

  /**
   * Finalizar entrada de audio
   */
  endAudioInput() {
    if (!this.isConnected || this.socket.readyState !== WebSocket.OPEN) return

    console.log('🏁 [NovaSocketClient] Ending audio input...')
    const message = {
      action: 'audioEnd',
      data: {
        sessionId: this.sessionId,
        timestamp: Date.now()
      }
    }
    this.socket.send(JSON.stringify(message))
  }

  /**
   * Desconectar del AWS WebSocket
   */
  disconnect() {
    if (this.socket) {
      console.log('🔌 [NovaSocketClient] Disconnecting from AWS...')
      this.socket.close()
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
   * Obtener estado de conexión AWS WebSocket
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      sessionId: this.sessionId,
      backendUrl: this.backendUrl,
      reconnectAttempts: this.reconnectAttempts,
      readyState: this.socket?.readyState,
      readyStateText: this.socket ? ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'][this.socket.readyState] : 'NO_SOCKET'
    }
  }

  /**
   * Test de conexión al AWS Lambda
   */
  async testConnection() {
    try {
      if (!this.isConnected || this.socket.readyState !== WebSocket.OPEN) {
        throw new Error('AWS WebSocket not connected')
      }

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('AWS test timeout'))
        }, 5000)

        // ✅ Enviar ping y esperar respuesta
        const pingMessage = {
          action: 'ping',
          data: { timestamp: Date.now() }
        }

        // Configurar listener temporal para pong
        const originalOnMessage = this.socket.onmessage
        this.socket.onmessage = (event) => {
          const data = JSON.parse(event.data)
          if (data.type === 'pong') {
            clearTimeout(timeout)
            this.socket.onmessage = originalOnMessage // Restaurar handler original
            console.log('🏓 [NovaSocketClient] AWS pong received:', data)
            resolve(data)
          } else {
            originalOnMessage?.(event) // Procesar otros mensajes normalmente
          }
        }

        this.socket.send(JSON.stringify(pingMessage))
      })
    } catch (error) {
      console.error('❌ [NovaSocketClient] AWS connection test failed:', error)
      throw error
    }
  }

  /**
   * Reconectar manualmente
   */
  reconnect() {
    console.log('🔄 [NovaSocketClient] Manual AWS reconnection...')
    if (this.socket) {
      this.socket.close()
    }
    this.connect().catch(error => {
      console.error('❌ [NovaSocketClient] Manual AWS reconnection failed:', error)
    })
  }
}

export default NovaSocketClient
