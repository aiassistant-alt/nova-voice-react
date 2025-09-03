/**
 * ^useNovaAudio
 * Author: Luis Arturo Parra - Telmo AI
 * Created: 2025-01-26 | Updated: 2025-01-28 (Intellilearn pattern)
 * Usage: Hook React para Nova Sonic usando patrón EXACTO de Intellilearn Core
 * Business Context: getUserMedia + MediaRecorder + NovaSocketClient patrón que funciona
 * Relations: VoiceAssistant.jsx, NovaSocketClient.js, PCM16AudioPlayer.js
 * Reminders: Patrón Intellilearn - WebSocket Lambda + MediaRecorder chunks 100ms
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import AzureRealtimeClient from '../utils/AzureRealtimeClient'

const useNovaAudio = () => {
  // 🚀 GPT-4o REALTIME API - Conectado con Azure OpenAI
  const GPT4O_MODE = true
  
  // Estados principales
  const [isConnected, setIsConnected] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')

  // Estados de conversación
  const [currentResponse, setCurrentResponse] = useState(null)
  const [conversationActive, setConversationActive] = useState(false)
  const [turnNumber, setTurnNumber] = useState(0)

  // Referencias - GPT-4o Realtime API
  const gpt4oClient = useRef(null)
  const audioStreamRef = useRef(null)



  /**
   * Inicializar componentes de audio y conexión GPT-4o Realtime API
   */
  const initialize = useCallback(async () => {
    try {
      console.log('🚀 [useNovaAudio] Initializing GPT-4o Realtime API system...')

      // Crear cliente GPT-4o Realtime
      if (!gpt4oClient.current) {
        gpt4oClient.current = new AzureRealtimeClient()
        
        // Configurar callbacks
        gpt4oClient.current.setCallbacks({
          onConnected: handleGPT4oConnected,
          onDisconnected: handleGPT4oDisconnected,
          onError: handleGPT4oError,
          onAudioReceived: handleGPT4oAudioReceived,
          onTextReceived: handleGPT4oTextReceived,
          onSessionReady: handleGPT4oSessionReady
        })
        
        console.log('✅ [useNovaAudio] GPT-4o client created')
      }
      
      console.log('✅ [useNovaAudio] GPT-4o Realtime API system initialized')
      return true

    } catch (error) {
      console.error('❌ [useNovaAudio] Initialization failed:', error)
      setError(error.message)
      return false
    }
  }, [])

  /**
   * Iniciar sesión de voz con GPT-4o Realtime API
   */
  const startVoiceSession = useCallback(async () => {
    try {
      console.log('🎤 [useNovaAudio] Starting GPT-4o voice session...')
      
      // Limpiar errores previos
      setError(null)
      setIsProcessing(false)

      // Inicializar si no está hecho
      if (!gpt4oClient.current) {
        await initialize()
      }

      // Conectar a GPT-4o Realtime API via WebRTC
      if (!isConnected) {
        setIsProcessing(true)
        setConnectionStatus('connecting')
        console.log('🔌 [useNovaAudio] Connecting to GPT-4o Realtime API...')
        
        await gpt4oClient.current.connect()
      } else {
        // Si ya está conectado, crear respuesta inicial
        console.log('🎯 [useNovaAudio] Already connected, creating initial response...')
        gpt4oClient.current.createResponse()
      }
      
      setIsRecording(true)
      setConversationActive(true)
      setTurnNumber(prev => prev + 1)
      console.log('✅ [useNovaAudio] GPT-4o voice session started')

    } catch (error) {
      console.error('❌ [useNovaAudio] Failed to start voice session:', error)
      setError(error.message)
      setIsProcessing(false)
      setConnectionStatus('error')
    }
  }, [isConnected, initialize])

  /**
   * Detener sesión de voz
   */
  const stopVoiceSession = useCallback(() => {
    try {
      console.log('🛑 [useNovaAudio] Stopping GPT-4o voice session...')
      
      setIsRecording(false)
      
      // GPT-4o maneja automáticamente la detección de fin de voz
      // No necesitamos hacer nada especial aquí
      console.log('✅ [useNovaAudio] GPT-4o voice session stopped')

    } catch (error) {
      console.error('❌ [useNovaAudio] Failed to stop voice session:', error)
      setError(error.message)
    }
  }, [])

  /**
   * Handler: conexión establecida con GPT-4o
   */
  const handleGPT4oConnected = useCallback((sessionId) => {
    console.log('✅ [useNovaAudio] Connected to GPT-4o Realtime API:', sessionId)
    setIsConnected(true)
    setIsProcessing(false)
    setConnectionStatus('connected')
  }, [])

  /**
   * Handler: desconexión de GPT-4o
   */
  const handleGPT4oDisconnected = useCallback((reason) => {
    console.log('🔌 [useNovaAudio] Disconnected from GPT-4o:', reason)
    setIsConnected(false)
    setConnectionStatus('disconnected')
    setIsRecording(false)
    setIsProcessing(false)
    setIsPlaying(false)
  }, [])

  /**
   * Handler: audio recibido de GPT-4o
   */
  const handleGPT4oAudioReceived = useCallback((audioStream) => {
    try {
      console.log('🔊 [useNovaAudio] GPT-4o audio stream received')
      setIsProcessing(false)
      setIsPlaying(true)

      setCurrentResponse({
        type: 'audio',
        content: 'GPT-4o audio stream',
        timestamp: Date.now()
      })

      // Audio se reproduce automáticamente via WebRTC
      console.log('✅ [useNovaAudio] Audio playing via WebRTC')

    } catch (error) {
      console.error('❌ [useNovaAudio] Failed to handle GPT-4o audio:', error)
      setError(error.message)
      setIsPlaying(false)
    }
  }, [])

  /**
   * Handler: texto recibido de GPT-4o
   */
  const handleGPT4oTextReceived = useCallback((textDelta) => {
    console.log('💬 [useNovaAudio] GPT-4o text delta:', textDelta)
    setCurrentResponse({
      type: 'text', 
      content: textDelta,
      timestamp: Date.now()
    })
  }, [])

  /**
   * Handler: sesión GPT-4o lista
   */
  const handleGPT4oSessionReady = useCallback(() => {
    console.log('✅ [useNovaAudio] GPT-4o session ready')
    setConnectionStatus('ready')
    
    // Crear respuesta inicial automáticamente
    setTimeout(() => {
      if (gpt4oClient.current && gpt4oClient.current.isConnected) {
        gpt4oClient.current.createResponse()
      }
    }, 500)
  }, [])

  /**
   * Handler: errores de GPT-4o
   */
  const handleGPT4oError = useCallback((error) => {
    console.error('❌ [useNovaAudio] GPT-4o error:', error)
    setError(error.message || error)
    setIsProcessing(false)
    setConnectionStatus('error')
  }, [])

  /**
   * Finalizar conversación GPT-4o
   */
  const endConversation = useCallback(() => {
    console.log('🔚 [useNovaAudio] Ending GPT-4o conversation...')
    
    if (gpt4oClient.current) {
      gpt4oClient.current.disconnect()
    }

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop())
      audioStreamRef.current = null
    }

    setConversationActive(false)
    setIsRecording(false)
    setIsProcessing(false)
    setIsPlaying(false)
    setTurnNumber(0)
    setCurrentResponse(null)
    setIsConnected(false)
    setConnectionStatus('disconnected')
  }, [])

  /**
   * Limpiar recursos al desmontar
   */
  useEffect(() => {
    return () => {
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop())
      }
      if (gpt4oClient.current) {
        gpt4oClient.current.disconnect()
      }
    }
  }, [])

  /**
   * Auto-inicializar al cargar
   */
  useEffect(() => {
    initialize()
  }, [initialize])

  // Estados derivados
  const isListening = isRecording
  const isActive = isRecording || isProcessing || isPlaying
  const canRecord = !isRecording && !isProcessing

  return {
    // Estados principales
    isConnected,
    isRecording,
    isProcessing,
    isPlaying,
    isListening,
    isActive,
    canRecord,
    error,
    connectionStatus,
    
    // Estados de conversación
    currentResponse,
    conversationActive,
    turnNumber,
    
    // Acciones
    startVoiceSession,
    stopVoiceSession,
    endConversation,
    initialize,
    
    // Información del sistema - GPT-4o Realtime API
    getAudioStatus: () => ({
      hasAudioStream: !!audioStreamRef.current,
      pattern: 'gpt4o-realtime'
    }),
    getConnectionStatus: () => gpt4oClient.current?.getConnectionStatus() || {
      isConnected: false,
      sessionId: null,
      hasEphemeralKey: false,
      dataChannelState: 'none',
      peerConnectionState: 'none'
    }
  }
}

export default useNovaAudio
