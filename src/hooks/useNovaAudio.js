/**
 * ^useNovaAudio
 * Author: Luis Arturo Parra - Telmo AI
 * Created: 2025-01-26
 * Usage: Hook React para gestión completa de audio + Nova Sonic
 * Business Context: Integra AudioManager + NovaSocketClient para conversación
 * Relations: VoiceAssistant.jsx, AudioManager.js, NovaSocketClient.js
 * Reminders: Maneja estados de grabación, conexión, respuesta y streaming continuo
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import AudioManager from '../utils/AudioManager'
import NovaSocketClient from '../utils/NovaSocketClient'

const useNovaAudio = () => {
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

  // Referencias
  const audioManager = useRef(null)
  const socketClient = useRef(null)
  const audioContext = useRef(null)

  /**
   * Inicializar componentes de audio y conexión
   */
  const initialize = useCallback(async () => {
    try {
      console.log('🚀 [useNovaAudio] Initializing Nova Voice system...')

      // Crear AudioManager
      if (!audioManager.current) {
        audioManager.current = new AudioManager()
        
        // Configurar callbacks AudioManager
        audioManager.current.setCallbacks({
          onAudioData: handleAudioData,
          onError: handleAudioError,
          onStatusChange: (status) => {
            console.log('🎤 [useNovaAudio] Audio status:', status)
            if (status === 'recording') setIsRecording(true)
            if (status === 'stopped') setIsRecording(false)
          }
        })
      }

      // Crear NovaSocketClient
      if (!socketClient.current) {
        socketClient.current = new NovaSocketClient()
        
        // Configurar callbacks NovaSocket
        socketClient.current.setCallbacks({
          onConnected: handleSocketConnected,
          onDisconnected: handleSocketDisconnected,
          onError: handleSocketError,
          onAudioOutput: handleNovaAudioOutput,
          onTextOutput: handleNovaTextOutput,
          onContentEnd: handleContentEnd,
          onSessionReady: handleSessionReady
        })
      }

      // Conectar al backend Nova Sonic
      await socketClient.current.connect()
      
      console.log('✅ [useNovaAudio] Nova Voice system initialized')
      return true

    } catch (error) {
      console.error('❌ [useNovaAudio] Initialization failed:', error)
      setError(error.message)
      return false
    }
  }, [])

  /**
   * Iniciar grabación y sesión Nova Sonic
   */
  const startVoiceSession = useCallback(async () => {
    try {
      console.log('🎤 [useNovaAudio] Starting voice session...')
      
      if (!isConnected) {
        await initialize()
      }

      // Limpiar errores previos
      setError(null)
      setIsProcessing(false)

      // Iniciar sesión de audio en backend
      socketClient.current.startAudioSession()
      
      // Iniciar grabación
      const success = await audioManager.current.startRecording()
      if (!success) {
        throw new Error('Failed to start audio recording')
      }

      setConversationActive(true)
      setTurnNumber(prev => prev + 1)
      console.log('✅ [useNovaAudio] Voice session started, turn:', turnNumber + 1)

    } catch (error) {
      console.error('❌ [useNovaAudio] Failed to start voice session:', error)
      setError(error.message)
    }
  }, [isConnected, initialize, turnNumber])

  /**
   * Detener grabación y procesar con Nova Sonic
   */
  const stopVoiceSession = useCallback(() => {
    try {
      console.log('🛑 [useNovaAudio] Stopping voice session...')
      
      if (audioManager.current) {
        audioManager.current.stopRecording()
      }

      if (socketClient.current) {
        socketClient.current.endAudioInput()
      }

      setIsProcessing(true)
      console.log('⏳ [useNovaAudio] Processing with Nova Sonic...')

    } catch (error) {
      console.error('❌ [useNovaAudio] Failed to stop voice session:', error)
      setError(error.message)
    }
  }, [])

  /**
   * Handler: datos de audio desde AudioManager
   */
  const handleAudioData = useCallback((audioData) => {
    if (socketClient.current && isConnected) {
      socketClient.current.sendAudioChunk(audioData)
    }
  }, [isConnected])

  /**
   * Handler: conexión establecida con backend
   */
  const handleSocketConnected = useCallback((sessionId) => {
    console.log('✅ [useNovaAudio] Connected to Nova Sonic backend:', sessionId)
    setIsConnected(true)
    setConnectionStatus('connected')
  }, [])

  /**
   * Handler: desconexión del backend  
   */
  const handleSocketDisconnected = useCallback((reason) => {
    console.log('🔌 [useNovaAudio] Disconnected from backend:', reason)
    setIsConnected(false)
    setConnectionStatus('disconnected')
    setIsRecording(false)
    setIsProcessing(false)
  }, [])

  /**
   * Handler: respuesta de audio de Nova Sonic
   */
  const handleNovaAudioOutput = useCallback(async (data) => {
    try {
      console.log('🔊 [useNovaAudio] Nova Sonic audio response received')
      setIsProcessing(false)
      setIsPlaying(true)

      // TODO: Implementar reproducción de audio PCM16
      // const audioBuffer = await convertPCM16ToAudioBuffer(data.content)
      // await playAudioBuffer(audioBuffer)
      
      // Por ahora, simular reproducción
      setTimeout(() => {
        setIsPlaying(false)
        console.log('✅ [useNovaAudio] Audio playback completed')
        
        // Mantener conversación activa para turnos continuos
        if (conversationActive) {
          console.log('🔄 [useNovaAudio] Ready for next turn...')
        }
      }, 2000) // Simular duración

      setCurrentResponse({
        type: 'audio',
        content: data.content,
        timestamp: Date.now()
      })

    } catch (error) {
      console.error('❌ [useNovaAudio] Failed to play Nova audio:', error)
      setError(error.message)
      setIsPlaying(false)
    }
  }, [conversationActive])

  /**
   * Handler: respuesta de texto de Nova Sonic
   */
  const handleNovaTextOutput = useCallback((data) => {
    console.log('💬 [useNovaAudio] Nova Sonic text response:', data.text)
    setCurrentResponse({
      type: 'text',
      content: data.text,
      timestamp: Date.now()
    })
  }, [])

  /**
   * Handler: contenido completado
   */
  const handleContentEnd = useCallback(() => {
    console.log('🏁 [useNovaAudio] Nova Sonic content ended')
    setIsProcessing(false)
    // Mantener streaming abierto para turnos continuos
  }, [])

  /**
   * Handler: sesión lista
   */
  const handleSessionReady = useCallback((data) => {
    console.log('✅ [useNovaAudio] Nova Sonic session ready:', data)
    setConnectionStatus('ready')
  }, [])

  /**
   * Handler: errores de audio
   */
  const handleAudioError = useCallback((error) => {
    console.error('❌ [useNovaAudio] Audio error:', error)
    setError(error.message)
    setIsRecording(false)
  }, [])

  /**
   * Handler: errores de socket
   */
  const handleSocketError = useCallback((error) => {
    console.error('❌ [useNovaAudio] Socket error:', error)
    setError(error.message)
  }, [])

  /**
   * Finalizar conversación completa
   */
  const endConversation = useCallback(() => {
    console.log('🔚 [useNovaAudio] Ending conversation...')
    
    if (audioManager.current) {
      audioManager.current.stopRecording()
    }

    if (socketClient.current) {
      socketClient.current.disconnect()
    }

    setConversationActive(false)
    setIsRecording(false)
    setIsProcessing(false)
    setIsPlaying(false)
    setTurnNumber(0)
    setCurrentResponse(null)
  }, [])

  /**
   * Limpiar recursos al desmontar
   */
  useEffect(() => {
    return () => {
      if (audioManager.current) {
        audioManager.current.cleanup()
      }
      if (socketClient.current) {
        socketClient.current.disconnect()
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
  const canRecord = isConnected && !isRecording && !isProcessing

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
    
    // Información del sistema
    getAudioStatus: () => audioManager.current?.getStatus(),
    getConnectionStatus: () => socketClient.current?.getConnectionStatus()
  }
}

export default useNovaAudio
