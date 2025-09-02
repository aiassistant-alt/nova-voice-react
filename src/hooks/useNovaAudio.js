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
import NovaSocketClient from '../utils/NovaSocketClient'
import { SonicPCMPlayerAdvanced } from '../utils/SonicPCMPlayerAdvanced'
import { base64ToFloat32Array } from '../utils/PCM16AudioPlayer'

const useNovaAudio = () => {
  // 🚀 MODO OFFLINE - Sin backend hasta que esté disponible
  const OFFLINE_MODE = true
  
  // Estados principales
  const [isConnected, setIsConnected] = useState(OFFLINE_MODE ? false : false)
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState(OFFLINE_MODE ? 'offline' : 'disconnected')

  // Estados de conversación
  const [currentResponse, setCurrentResponse] = useState(null)
  const [conversationActive, setConversationActive] = useState(false)
  const [turnNumber, setTurnNumber] = useState(0)

  // Referencias - Patrón Intellilearn
  const socketClient = useRef(null)
  const audioPlayer = useRef(null)
  
  // Audio capture refs (Intellilearn pattern)
  const audioStreamRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  
  // PCM16 capture pipeline (AWS pattern)
  const audioContextRef = useRef(null)
  const sourceNodeRef = useRef(null)
  const processorNodeRef = useRef(null)
  const pendingSamplesRef = useRef(new Float32Array(0)) // acumulador a 16kHz

  // Helpers PCM16/Resampler
  const downsampleTo16k = useCallback((inputFloat32, inputSampleRate) => {
    const targetRate = 16000
    if (inputSampleRate === targetRate) return inputFloat32

    const sampleRateRatio = inputSampleRate / targetRate
    const newLength = Math.floor(inputFloat32.length / sampleRateRatio)
    const result = new Float32Array(newLength)

    let offsetResult = 0
    let offsetBuffer = 0
    while (offsetResult < result.length) {
      const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio)
      // Average to cheap anti-alias instead of naive pick
      let accum = 0
      let count = 0
      for (let i = Math.round(offsetBuffer); i < nextOffsetBuffer && i < inputFloat32.length; i++) {
        accum += inputFloat32[i]
        count++
      }
      result[offsetResult] = count > 0 ? (accum / count) : 0
      offsetResult++
      offsetBuffer = nextOffsetBuffer
    }
    return result
  }, [])

  const encodePCM16 = useCallback((float32Array) => {
    const buffer = new ArrayBuffer(float32Array.length * 2)
    const view = new DataView(buffer)
    let offset = 0
    for (let i = 0; i < float32Array.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, float32Array[i]))
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true)
    }
    return new Uint8Array(buffer)
  }, [])

  const uint8ToBase64 = useCallback((uint8Array) => {
    let binary = ''
    const chunkSize = 8192
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length))
      binary += String.fromCharCode.apply(null, Array.from(chunk))
    }
    return btoa(binary)
  }, [])

  /**
   * Inicializar componentes de audio y conexión
   * Patrón EXACTO de Intellilearn Core que funciona con Nova Sonic
   */
  const initialize = useCallback(async () => {
    try {
      console.log('🚀 [useNovaAudio] Initializing Nova Voice system (Intellilearn pattern)...')

      if (OFFLINE_MODE) {
        console.log('📱 [useNovaAudio] OFFLINE MODE - Inicializando solo interfaz visual...')
        setConnectionStatus('offline')
        setError(null)
        console.log('✅ [useNovaAudio] Nova Voice system initialized (OFFLINE MODE)')
        return true
      }

      // Crear SonicPCMPlayerAdvanced para Nova Sonic (AWS Pattern)
      if (!audioPlayer.current) {
        audioPlayer.current = new SonicPCMPlayerAdvanced()
        
        // Configurar callbacks del reproductor (Advanced pattern)
        audioPlayer.current.onStatus((status) => {
          console.log('🔊 [SonicPCMPlayerAdvanced] Buffer status:', status)
          if (!status.buffering && status.available === 0) {
            // Audio playback completed
            console.log('✅ [useNovaAudio] Audio playback completed (Advanced)')
            setIsPlaying(false)
            
            // Mantener conversación activa para turnos continuos
            if (conversationActive) {
              console.log('🔄 [useNovaAudio] Ready for next turn...')
            }
          }
        })
        
        // Inicializar audio player avanzado
        await audioPlayer.current.initialize()
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
  }, [OFFLINE_MODE])

  /**
   * Iniciar captura de audio - Patrón EXACTO Intellilearn que funciona
   */
  const startVoiceSession = useCallback(async () => {
    try {
      console.log('🎤 [useNovaAudio] Starting voice session (Intellilearn pattern)...')
      
      // Limpiar errores previos
      setError(null)
      setIsProcessing(false)

      if (OFFLINE_MODE) {
        console.log('📱 [useNovaAudio] OFFLINE MODE - Simulando sesión de voz...')
        setIsRecording(true)
        setConversationActive(true)
        setTurnNumber(prev => prev + 1)
        console.log('✅ [useNovaAudio] Voice session started (OFFLINE MODE)')
        
        // Simular procesamiento después de 3 segundos
        setTimeout(() => {
          if (OFFLINE_MODE) {
            setIsRecording(false)
            setIsProcessing(true)
            console.log('⏳ [useNovaAudio] Processing... (OFFLINE MODE)')
            
            // Simular respuesta después de 2 segundos
            setTimeout(() => {
              setIsProcessing(false)
              setIsPlaying(true)
              console.log('🔊 [useNovaAudio] Playing response... (OFFLINE MODE)')
              
              // Simular fin de reproducción después de 3 segundos
              setTimeout(() => {
                setIsPlaying(false)
                console.log('✅ [useNovaAudio] Audio completed (OFFLINE MODE)')
              }, 3000)
            }, 2000)
          }
        }, 3000)
        
        return
      }

      // ✅ PATRÓN INTELLILEARN: Pedir micrófono INMEDIATAMENTE sin esperar WebSocket
      console.log('🎤 Requesting microphone access (Intellilearn pattern)...')
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
          channelCount: 1
        }
      })

      // ✅ INICIALIZAR WEBSOCKET EN PARALELO (no bloquear micrófono)
      if (!isConnected) {
        initialize().catch(e => console.log('🔌 WebSocket inicializando en background:', e))
      }

      // ✅ INTENTAR WEBSOCKET SESSION (pero no fallar si no conecta)
      try {
        if (socketClient.current && isConnected) {
          socketClient.current.startAudioSession()
        }
      } catch (e) {
        console.log('⚠️ WebSocket no disponible, continuando solo con micrófono:', e)
      }

      audioStreamRef.current = stream

      // ✅ AWS PATTERN: AudioContext + ScriptProcessorNode → PCM16 @16kHz
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      sourceNodeRef.current = audioContextRef.current.createMediaStreamSource(stream)
      // Buffer size 4096 para baja latencia estable
      processorNodeRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1)

      processorNodeRef.current.onaudioprocess = (e) => {
        try {
          if (!conversationActive) return
          const input = e.inputBuffer.getChannelData(0)
          const down = downsampleTo16k(input, audioContextRef.current.sampleRate)

          // Acumular hasta al menos 480 samples (30ms a 16k)
          if (pendingSamplesRef.current.length === 0) {
            pendingSamplesRef.current = down
          } else {
            const merged = new Float32Array(pendingSamplesRef.current.length + down.length)
            merged.set(pendingSamplesRef.current, 0)
            merged.set(down, pendingSamplesRef.current.length)
            pendingSamplesRef.current = merged
          }

          const frameSize = 480 // 30ms @16k
          while (pendingSamplesRef.current.length >= frameSize) {
            const frame = pendingSamplesRef.current.slice(0, frameSize)
            pendingSamplesRef.current = pendingSamplesRef.current.slice(frameSize)

            const pcmBytes = encodePCM16(frame)
            const base64Audio = uint8ToBase64(pcmBytes)
            socketClient.current?.sendAudioChunk({
              data: base64Audio,
              format: 'PCM16',
              sampleRate: 16000,
              channels: 1,
              size: pcmBytes.byteLength
            })
          }
        } catch (err) {
          console.error('❌ PCM16 processing error:', err)
        }
      }

      sourceNodeRef.current.connect(processorNodeRef.current)
      processorNodeRef.current.connect(audioContextRef.current.destination)
      
      setIsRecording(true)
      setConversationActive(true)
      setTurnNumber(prev => prev + 1)
      console.log('✅ [useNovaAudio] Voice session started (Intellilearn pattern)')

    } catch (error) {
      console.error('❌ [useNovaAudio] Failed to start voice session:', error)
      setError(error.message)
    }
  }, [isConnected, initialize, conversationActive, OFFLINE_MODE])

  /**
   * Detener grabación - Patrón EXACTO Intellilearn
   */
  const stopVoiceSession = useCallback(() => {
    try {
      console.log('🛑 [useNovaAudio] Stopping voice session (Intellilearn pattern)...')
      
      if (OFFLINE_MODE) {
        console.log('📱 [useNovaAudio] OFFLINE MODE - Deteniendo simulación...')
        setIsRecording(false)
        setConversationActive(false)
        console.log('✅ [useNovaAudio] Voice session stopped (OFFLINE MODE)')
        return
      }
      
      // ✅ Stop ScriptProcessor chain
      if (processorNodeRef.current) {
        try { processorNodeRef.current.disconnect() } catch (e) { console.debug('[PCM16] processor disconnect error', e) }
        processorNodeRef.current.onaudioprocess = null
        processorNodeRef.current = null
      }
      if (sourceNodeRef.current) {
        try { sourceNodeRef.current.disconnect() } catch (e) { console.debug('[PCM16] source disconnect error', e) }
        sourceNodeRef.current = null
      }
      if (audioContextRef.current) {
        try { audioContextRef.current.close() } catch (e) { console.debug('[PCM16] context close error', e) }
        audioContextRef.current = null
      }
      pendingSamplesRef.current = new Float32Array(0)

      // ✅ PATRÓN INTELLILEARN: Stop audio stream
      if (audioStreamRef.current) {
        console.log('🛑 Stopping audio stream...')
        audioStreamRef.current.getTracks().forEach(track => track.stop())
        audioStreamRef.current = null
      }

      // Enviar señal de fin de audio al WebSocket
      if (socketClient.current) {
        socketClient.current.endAudioInput()
      }

      setIsRecording(false)
      setIsProcessing(true)
      console.log('⏳ [useNovaAudio] Processing with Nova Sonic...')

    } catch (error) {
      console.error('❌ [useNovaAudio] Failed to stop voice session:', error)
      setError(error.message)
    }
  }, [OFFLINE_MODE])

  // AudioManager ya no se usa - patrón Intellilearn maneja audio directamente

  /**
   * Handler: conexión establecida con backend
   */
  const handleSocketConnected = useCallback((sessionId) => {
    console.log('✅ [useNovaAudio] Connected to Nova Sonic backend:', sessionId)
    setIsConnected(true)
    setConnectionStatus('connected')
    try {
      socketClient.current?.startAudioSession()
    } catch (err) {
      console.warn('⚠️ startAudioSession on connect failed:', err?.message || err)
    }
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

      // ✅ REPRODUCCIÓN REAL - Patrón AWS oficial con SonicPCMPlayerAdvanced
      await audioPlayer.current.playPCM16(data.content)     // Direct base64 → PCM16 playback

      setCurrentResponse({
        type: 'audio',
        content: data.content,
        timestamp: Date.now()
      })

      console.log('✅ [useNovaAudio] Audio started playing via PCM16AudioPlayer')

    } catch (error) {
      console.error('❌ [useNovaAudio] Failed to play Nova audio:', error)
      setError(error.message)
      setIsPlaying(false)
    }
  }, [])

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

  // Audio errors ahora manejados en MediaRecorder.onerror directamente

  /**
   * Handler: errores de socket
   */
  const handleSocketError = useCallback((error) => {
    console.error('❌ [useNovaAudio] Socket error:', error)
    setError(error.message)
  }, [])

  /**
   * Finalizar conversación completa - Patrón Intellilearn
   */
  const endConversation = useCallback(() => {
    console.log('🔚 [useNovaAudio] Ending conversation (Intellilearn pattern)...')
    
    // ✅ PATRÓN INTELLILEARN: Stop MediaRecorder y audio stream
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
    }

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop())
      audioStreamRef.current = null
    }

    if (audioPlayer.current) {
      audioPlayer.current.stop()
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
   * Limpiar recursos al desmontar - Patrón Intellilearn
   */
  useEffect(() => {
    return () => {
      // ✅ PATRÓN INTELLILEARN: Cleanup MediaRecorder y audio stream
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop())
      }
      if (audioPlayer.current) {
        audioPlayer.current.cleanup()
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
  const canRecord = OFFLINE_MODE ? (!isRecording && !isProcessing) : (isConnected && !isRecording && !isProcessing)

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
    
    // Información del sistema - Patrón Intellilearn
    getAudioStatus: () => ({
      isRecording: mediaRecorderRef.current?.state === 'recording',
      hasAudioStream: !!audioStreamRef.current,
      pattern: 'intellilearn'
    }),
    getAudioPlayerStatus: () => audioPlayer.current?.getStatus(),
    getConnectionStatus: () => socketClient.current?.getConnectionStatus()
  }
}

export default useNovaAudio
