/**
 * ^AzureOpenAIClient
 * Author: Luis Arturo Parra - Telmo AI
 * Created: 2025-01-23
 * Usage: Cliente HTTP para Azure OpenAI Chat Completions con audio
 * Business Context: Implementación correcta según documentación oficial de Azure
 * Relations: useNovaAudio.js, VoiceAssistant.jsx
 * Reminders: Azure OpenAI usa HTTP REST, NO WebSocket para audio
 */

class AzureOpenAIClient {
  constructor() {
    this.isConnected = false
    this.isRecording = false
    this.mediaRecorder = null
    this.audioContext = null
    this.audioQueue = []
    
    // ✅ CONFIGURACIÓN AZURE OPENAI - HTTP REST API
    this.RESOURCE_NAME = "aiass-mf33a6qd-eastus2.cognitiveservices.azure.com"
    this.DEPLOYMENT = "gpt-4o-audio-preview-2"
    this.API_VERSION = "2024-10-21"
    this.API_KEY = import.meta.env.VITE_AZURE_OPENAI_API_KEY || "YOUR_API_KEY_HERE"
    
    // Endpoint para Chat Completions con audio
    this.CHAT_URL = `https://${this.RESOURCE_NAME}/openai/deployments/${this.DEPLOYMENT}/chat/completions?api-version=${this.API_VERSION}`
    
    // Callbacks
    this.onConnected = null
    this.onDisconnected = null
    this.onError = null
    this.onAudioReceived = null
    this.onTextReceived = null
    
    console.log('🚀 [AzureOpenAIClient] Initialized for Azure OpenAI Chat API with audio')
  }

  /**
   * Conectar (simular conexión)
   */
  async connect() {
    try {
      console.log('🔌 [AzureOpenAIClient] Connecting to Azure OpenAI...')
      console.log('🔧 [AzureOpenAIClient] Using API key:', this.API_KEY ? `${this.API_KEY.substring(0, 10)}...` : 'NOT_FOUND')
      console.log('🔧 [AzureOpenAIClient] Chat URL:', this.CHAT_URL)
      
      // Test de conectividad con un ping simple
      await this.testConnection()
      
      this.isConnected = true
      console.log('✅ [AzureOpenAIClient] Connected to Azure OpenAI')
      this.onConnected?.()
      
      return true
      
    } catch (error) {
      console.error('❌ [AzureOpenAIClient] Connection failed:', error)
      this.onError?.(error)
      throw error
    }
  }

  /**
   * Test de conectividad con auto-detección de deployment
   */
  async testConnection() {
    console.log('🔑 [AzureOpenAIClient] Testing connection...')

    // Lista de deployments comunes a probar
    const commonDeployments = [
      "gpt-4o-audio-preview-2",
      "gpt-4o-audio-preview", 
      "gpt-4o-realtime-preview",
      "gpt-4o",
      "gpt-4",
      "gpt-35-turbo"
    ]

    for (const deployment of commonDeployments) {
      console.log(`🧪 [AzureOpenAIClient] Testing deployment: ${deployment}`)
      
      const testUrl = `https://${this.RESOURCE_NAME}/openai/deployments/${deployment}/chat/completions?api-version=${this.API_VERSION}`
      
      try {
        const response = await fetch(testUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': this.API_KEY
          },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: "Hi"
              }
            ],
            max_tokens: 5,
            temperature: 0.1,
            stream: false
          })
        })

        if (response.ok) {
          const data = await response.json()
          console.log(`✅ [AzureOpenAIClient] SUCCESS with deployment: ${deployment}`)
          
          // Actualizar configuración con el deployment que funciona
          this.DEPLOYMENT = deployment
          this.CHAT_URL = testUrl
          
          console.log('✅ [AzureOpenAIClient] Connection test successful:', data)
          return true
        } else {
          console.log(`❌ [AzureOpenAIClient] Deployment ${deployment} failed: ${response.status}`)
        }

      } catch (error) {
        console.log(`❌ [AzureOpenAIClient] Deployment ${deployment} error:`, error.message)
      }
    }

    throw new Error('❌ No working deployment found. Please verify your Azure OpenAI deployments in the portal.')
  }

  /**
   * Enviar mensaje de chat con audio
   */
  async sendChatMessage(message, audioData = null) {
    try {
      console.log('💬 [AzureOpenAIClient] Sending chat message...')
      
      const messages = [
        {
          role: "system",
          content: "Eres Nova, un asistente de voz inteligente. Responde en español de manera natural y amigable. Mantén las respuestas concisas."
        },
        {
          role: "user",
          content: message
        }
      ]

      // Si hay audio, agregarlo como contenido multimodal
      if (audioData) {
        messages[1] = {
          role: "user",
          content: [
            {
              type: "text",
              text: message
            },
            {
              type: "input_audio",
              input_audio: {
                data: audioData,
                format: "wav"
              }
            }
          ]
        }
      }

      const requestBody = {
        messages: messages,
        max_tokens: 300,
        temperature: 0.7,
        modalities: ["text", "audio"],
        audio: {
          voice: "alloy",
          format: "wav"
        }
      }

      const response = await fetch(this.CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.API_KEY
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      this.handleChatResponse(data)

      return data

    } catch (error) {
      console.error('❌ [AzureOpenAIClient] Chat message failed:', error)
      this.onError?.(error)
      throw error
    }
  }

  /**
   * Manejar respuesta del chat
   */
  handleChatResponse(data) {
    try {
      const choice = data.choices?.[0]
      if (!choice) return

      const message = choice.message

      // Procesar texto
      if (message.content) {
        console.log('💬 [AzureOpenAIClient] Text received:', message.content)
        this.onTextReceived?.(message.content)
      }

      // Procesar audio si está presente
      if (message.audio) {
        console.log('🔊 [AzureOpenAIClient] Audio received')
        this.playAudioFromBase64(message.audio.data)
      }

    } catch (error) {
      console.error('❌ [AzureOpenAIClient] Response handling error:', error)
    }
  }

  /**
   * Reproducir audio desde base64
   */
  async playAudioFromBase64(base64Audio) {
    try {
      // Convertir base64 a blob de audio
      const audioData = atob(base64Audio)
      const audioArray = new Uint8Array(audioData.length)
      for (let i = 0; i < audioData.length; i++) {
        audioArray[i] = audioData.charCodeAt(i)
      }

      const audioBlob = new Blob([audioArray], { type: 'audio/wav' })
      const audioUrl = URL.createObjectURL(audioBlob)

      // Crear y reproducir elemento de audio
      const audio = new Audio(audioUrl)
      audio.play()

      console.log('🔊 [AzureOpenAIClient] Audio playing')
      this.onAudioReceived?.(audioBlob)

      // Limpiar URL después de reproducir
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl)
      }

    } catch (error) {
      console.error('❌ [AzureOpenAIClient] Audio playback error:', error)
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
      this.audioQueue = []
      this.isRecording = true
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioQueue.push(event.data)
        }
      }
      
      this.mediaRecorder.start()
      console.log('🎤 [AzureOpenAIClient] Recording started')
      
    } catch (error) {
      console.error('❌ [AzureOpenAIClient] Recording failed:', error)
      throw error
    }
  }

  /**
   * Detener grabación y enviar audio
   */
  async stopRecording() {
    if (!this.mediaRecorder || !this.isRecording) return

    return new Promise((resolve) => {
      this.mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(this.audioQueue, { type: 'audio/wav' })
          const base64Audio = await this.blobToBase64(audioBlob)
          
          console.log('🛑 [AzureOpenAIClient] Recording stopped, processing audio...')
          
          // Enviar audio a Azure OpenAI
          await this.sendChatMessage("Responde a mi audio", base64Audio)
          
          this.isRecording = false
          resolve(audioBlob)
          
        } catch (error) {
          console.error('❌ [AzureOpenAIClient] Stop recording error:', error)
          this.isRecording = false
          resolve(null)
        }
      }
      
      this.mediaRecorder.stop()
    })
  }

  /**
   * Convertir blob a base64
   */
  async blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  /**
   * Enviar mensaje de texto simple
   */
  async sendTextMessage(text) {
    return this.sendChatMessage(text)
  }

  /**
   * Desconectar
   */
  disconnect() {
    try {
      if (this.mediaRecorder && this.isRecording) {
        this.mediaRecorder.stop()
      }
      
      this.isConnected = false
      this.isRecording = false
      
      console.log('✅ [AzureOpenAIClient] Disconnected')
      this.onDisconnected?.()
      
    } catch (error) {
      console.error('❌ [AzureOpenAIClient] Disconnect error:', error)
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
      isRecording: this.isRecording,
      method: 'HTTP REST'
    }
  }
}

export default AzureOpenAIClient
