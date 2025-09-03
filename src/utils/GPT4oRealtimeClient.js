/**
 * ^GPT4oRealtimeClient
 * Author: Luis Arturo Parra - Telmo AI
 * Created: 2025-01-09
 * Usage: Cliente WebRTC para GPT-4o Realtime API Azure OpenAI
 * Business Context: Conecta el círculo neumórfico con GPT-4o en tiempo real
 * Relations: useNovaAudio.js, VoiceAssistant.jsx
 * Reminders: Usa ephemeral keys y WebRTC peer connection
 */

class GPT4oRealtimeClient {
  constructor() {
    this.peerConnection = null
    this.dataChannel = null
    this.audioElement = null
    this.isConnected = false
    this.sessionId = null
    this.ephemeralKey = null
    
    // ✅ CONFIGURACIÓN AZURE OPENAI - SEGÚN DOCUMENTACIÓN OFICIAL DE AZURE
    this.RESOURCE_NAME = "aiass-mf33a6qd-eastus2.cognitiveservices.azure.com" // ✅ REAL DESDE AZURE PORTAL
    this.REGION = "eastus2"
    this.DEPLOYMENT = "gpt-4o-audio-preview-2" // ✅ DEPLOYMENT NAME REAL DESDE AZURE PORTAL
    this.API_VERSION = "2024-10-01-preview"
    this.REALTIME_URL = `https://${this.RESOURCE_NAME}/openai/deployments/${this.DEPLOYMENT}/realtime?api-version=${this.API_VERSION}`
    this.API_KEY = import.meta.env.VITE_AZURE_OPENAI_API_KEY || "YOUR_API_KEY_HERE"
    this.VOICE = "verse" // Recomendado por Azure para Realtime
    this.keepAliveInterval = null
    
    // Callbacks para eventos
    this.onConnected = null
    this.onDisconnected = null
    this.onError = null
    this.onAudioReceived = null
    this.onTextReceived = null
    this.onSessionReady = null
    
    console.log('🚀 [GPT4oRealtimeClient] Initialized for Azure OpenAI eastus2')
  }

  /**
   * Conectar directamente a Azure OpenAI Realtime API
   * Según documentación oficial de Azure
   */
  async connectToAzureRealtime() {
    try {
      console.log('🔑 [GPT4oRealtimeClient] Connecting to Azure OpenAI Realtime API...')
      console.log('🔧 [GPT4oRealtimeClient] Using API key:', this.API_KEY ? `${this.API_KEY.substring(0, 10)}...` : 'NOT_FOUND')
      console.log('🔧 [GPT4oRealtimeClient] Realtime URL:', this.REALTIME_URL)
      
      // Para Azure OpenAI, usamos WebSocket directamente al endpoint realtime
      const wsUrl = this.REALTIME_URL.replace('https://', 'wss://').replace('http://', 'ws://')
      
      this.websocket = new WebSocket(wsUrl, [], {
        headers: {
          "api-key": this.API_KEY,
          "OpenAI-Beta": "realtime=v1"
        }
      })

      return new Promise((resolve, reject) => {
        this.websocket.onopen = () => {
          console.log('✅ [GPT4oRealtimeClient] WebSocket connected to Azure OpenAI')
          this.isConnected = true
          this.setupWebSocketHandlers()
          resolve(true)
        }

        this.websocket.onerror = (error) => {
          console.error('❌ [GPT4oRealtimeClient] WebSocket error:', error)
          reject(error)
        }

        this.websocket.onclose = () => {
          console.log('🔌 [GPT4oRealtimeClient] WebSocket closed')
          this.isConnected = false
        }
      })
      
    } catch (error) {
      console.error('❌ [GPT4oRealtimeClient] Connection error:', error)
      throw error
    }
  }

  /**
   * Inicializar conexión WebRTC con GPT-4o
   */
  async connect() {
    try {
      console.log('🔌 [GPT4oRealtimeClient] Starting WebRTC connection...')
      
      // 1. Obtener ephemeral key
      await this.getEphemeralKey()
      
      // 2. Crear peer connection
      this.peerConnection = new RTCPeerConnection()
      
      // 3. Configurar audio element para reproducción
      this.audioElement = document.createElement('audio')
      this.audioElement.autoplay = true
      this.audioElement.style.display = 'none'
      document.body.appendChild(this.audioElement)
      
      // 4. Manejar audio remoto del modelo
      this.peerConnection.ontrack = (event) => {
        console.log('🔊 [GPT4oRealtimeClient] Received audio track from GPT-4o')
        this.audioElement.srcObject = event.streams[0]
        this.onAudioReceived?.(event.streams[0])
      }
      
      // 5. Obtener micrófono del usuario
      const userMedia = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 24000
        }
      })
      
      // 6. Agregar audio track del usuario
      const audioTrack = userMedia.getAudioTracks()[0]
      this.peerConnection.addTrack(audioTrack, userMedia)
      
      // 7. Crear data channel para eventos
      this.dataChannel = this.peerConnection.createDataChannel('realtime-channel')
      this.setupDataChannel()
      
      // 8. Crear offer SDP
      const offer = await this.peerConnection.createOffer()
      await this.peerConnection.setLocalDescription(offer)
      
      // 9. Enviar offer a Azure OpenAI WebRTC endpoint
      const sdpResponse = await fetch(`${this.WEBRTC_URL}?model=${this.DEPLOYMENT}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${this.ephemeralKey}`,
          "Content-Type": "application/sdp",
        },
      })
      
      if (!sdpResponse.ok) {
        throw new Error(`WebRTC connection failed: ${sdpResponse.status}`)
      }
      
      // 10. Configurar answer SDP
      const answerSdp = await sdpResponse.text()
      const answer = { type: "answer", sdp: answerSdp }
      await this.peerConnection.setRemoteDescription(answer)
      
      this.isConnected = true
      console.log('✅ [GPT4oRealtimeClient] WebRTC connection established')
      this.onConnected?.(this.sessionId)
      
      return true
      
    } catch (error) {
      console.error('❌ [GPT4oRealtimeClient] Connection failed:', error)
      this.onError?.(error)
      throw error
    }
  }

  /**
   * Configurar data channel para eventos del modelo
   */
  setupDataChannel() {
    this.dataChannel.addEventListener('open', () => {
      console.log('📡 [GPT4oRealtimeClient] Data channel open')
      this.updateSession()
      this.onSessionReady?.()
      // Enviar saludo inicial para comprobar flujo de respuesta
      this.createResponse()
      // Mantener viva la sesión con pings periódicos (algunos entornos cierran el DC por inactividad)
      this.keepAliveInterval = setInterval(() => {
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
          try { this.dataChannel.send(JSON.stringify({ type: 'ping', timestamp: Date.now() })) } catch {}
        }
      }, 15000)
    })

    this.dataChannel.addEventListener('message', (event) => {
      try {
        const realtimeEvent = JSON.parse(event.data)
        console.log('📥 [GPT4oRealtimeClient] Received event:', realtimeEvent.type)
        
        switch (realtimeEvent.type) {
          case "session.created":
            console.log('✅ [GPT4oRealtimeClient] Session created successfully')
            break
            
          case "session.updated":
            console.log('✅ [GPT4oRealtimeClient] Session updated')
            break
            
          case "conversation.item.created":
            console.log('💬 [GPT4oRealtimeClient] Conversation item created')
            break
            
          case "response.audio.delta":
            // Audio chunks are handled via WebRTC track, not data channel
            console.log('🔊 [GPT4oRealtimeClient] Audio delta received')
            break
            
          case "response.text.delta":
            console.log('💬 [GPT4oRealtimeClient] Text delta:', realtimeEvent.delta)
            this.onTextReceived?.(realtimeEvent.delta)
            break
            
          case "response.done":
            console.log('🏁 [GPT4oRealtimeClient] Response completed')
            break
            
          case "error":
            console.error('❌ [GPT4oRealtimeClient] Model error:', realtimeEvent.error)
            this.onError?.(realtimeEvent.error)
            break
            
          default:
            console.log('📋 [GPT4oRealtimeClient] Unknown event:', realtimeEvent.type)
        }
      } catch (error) {
        console.error('❌ [GPT4oRealtimeClient] Event parsing error:', error)
      }
    })

    this.dataChannel.addEventListener('close', () => {
      console.log('📡 [GPT4oRealtimeClient] Data channel closed')
      this.isConnected = false
      if (this.keepAliveInterval) {
        clearInterval(this.keepAliveInterval)
        this.keepAliveInterval = null
      }
      this.onDisconnected?.('Data channel closed')
    })
  }

  /**
   * Actualizar configuración de sesión
   */
  updateSession() {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      console.warn('⚠️ [GPT4oRealtimeClient] Data channel not ready for session update')
      return
    }
    
    const event = {
      type: "session.update",
      session: {
        instructions: "Eres Nova, un asistente de voz inteligente y amigable. Responde de manera natural y conversacional en español. Mantén tus respuestas concisas pero informativas. Tienes una personalidad cálida y servicial.",
        voice: this.VOICE,
        input_audio_format: "pcm16",
        output_audio_format: "pcm16",
        turn_detection: {
          type: "server_vad",
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 800,
          create_response: true,
          interrupt_response: true
        },
        temperature: 0.7,
        max_response_output_tokens: 400
      }
    }
    
    this.dataChannel.send(JSON.stringify(event))
    console.log('📤 [GPT4oRealtimeClient] Session updated with Nova personality')
  }

  /**
   * Enviar evento de respuesta manual (para iniciar conversación)
   */
  createResponse() {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      console.warn('⚠️ [GPT4oRealtimeClient] Data channel not ready for response creation')
      return
    }
    
    const event = {
      type: "response.create",
      response: {
        modalities: ["audio"],
        instructions: "Saluda al usuario de manera amigable y pregunta cómo puedes ayudarle hoy."
      }
    }
    
    this.dataChannel.send(JSON.stringify(event))
    console.log('📤 [GPT4oRealtimeClient] Response creation requested')
  }

  /**
   * Desconectar de GPT-4o Realtime API
   */
  disconnect() {
    try {
      console.log('🔌 [GPT4oRealtimeClient] Disconnecting...')
      
      if (this.dataChannel) {
        this.dataChannel.close()
        this.dataChannel = null
      }
      
      if (this.peerConnection) {
        this.peerConnection.close()
        this.peerConnection = null
      }
      
      if (this.audioElement) {
        this.audioElement.remove()
        this.audioElement = null
      }
      
      this.isConnected = false
      this.sessionId = null
      this.ephemeralKey = null
      
      console.log('✅ [GPT4oRealtimeClient] Disconnected successfully')
      
    } catch (error) {
      console.error('❌ [GPT4oRealtimeClient] Disconnect error:', error)
    }
  }

  /**
   * Configurar callbacks para eventos
   */
  setCallbacks({
    onConnected,
    onDisconnected, 
    onError,
    onAudioReceived,
    onTextReceived,
    onSessionReady
  }) {
    this.onConnected = onConnected
    this.onDisconnected = onDisconnected
    this.onError = onError
    this.onAudioReceived = onAudioReceived
    this.onTextReceived = onTextReceived
    this.onSessionReady = onSessionReady
  }

  /**
   * Obtener estado de conexión
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      sessionId: this.sessionId,
      hasEphemeralKey: !!this.ephemeralKey,
      dataChannelState: this.dataChannel?.readyState || 'none',
      peerConnectionState: this.peerConnection?.connectionState || 'none'
    }
  }
}

export default GPT4oRealtimeClient
