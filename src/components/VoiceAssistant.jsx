/**
 * VoiceAssistant Component
 * Central animated neumorphic circle with gradient effect
 * @param {boolean} isPlaying - Controls wave animation state  
 * @param {function} togglePlay - Function to toggle play/pause state
 */
import useNovaAudio from '../hooks/useNovaAudio'

const VoiceAssistant = ({ 
  isPlaying, 
  togglePlay, 
  onListeningChange, 
  onNovaPlayingChange 
}) => {
  // Integrar Nova Sonic audio real (sin modificar diseño)
  const { 
    isListening, 
    isActive, 
    startVoiceSession, 
    stopVoiceSession,
    error 
  } = useNovaAudio()

  // Handler para click del círculo - integrar audio real
  const handleVoiceClick = async () => {
    try {
      if (isListening) {
        // Detener grabación
        stopVoiceSession()
        console.log('🛑 [VoiceAssistant] Stopping voice session...')
      } else {
        // Iniciar grabación con Nova Sonic
        await startVoiceSession()
        console.log('🎤 [VoiceAssistant] Starting voice session...')
      }
      
      // Mantener la animación original
      togglePlay()
    } catch (error) {
      console.error('❌ [VoiceAssistant] Voice session error:', error)
    }
  }
  return (
    <div className="frame absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[500]">
      {/* Frame exterior neumórfico */}
      <div className="frame-before relative w-[calc(15vw+40px)] h-[calc(15vw+40px)] rounded-full bg-[var(--nm-bg-primary)] nm-shadow-elevated flex items-center justify-center">
        {/* Trigger button interior - Nova Sonic audio integrado */}
        <div 
          onClick={handleVoiceClick}
          className="trigger trigger-before relative w-[15vw] h-[15vw] rounded-full bg-[var(--nm-bg-primary)] nm-shadow-pressed cursor-pointer overflow-hidden flex items-center justify-center text-black/70 tracking-wider z-[501] transition-all duration-300 hover:scale-[0.98] active:scale-95"
        >
          
          {/* Gradiente cónico animado - Nova Sonic integrado */}
          <div 
            className={`spiral absolute top-[15%] left-[15%] w-[70%] h-[70%] rounded-full spiral-gradient blur-[15px] opacity-90 z-[1] ${(isPlaying || isListening || isActive) ? 'animate-rotate-gradient' : ''}`}
          />
          
          {/* Debug error (invisible - solo consola) */}
          {error && console.error('🎤 Nova Audio Error:', error)}
        </div>
        
        {/* Ondas de expansión cuando está reproduciendo O escuchando - CENTRADAS */}
        {(isPlaying || isListening || isActive) && (
          <div className="dots pointer-events-none">
            <div 
              className="dot absolute top-1/2 left-1/2 w-[calc(15vw+20px)] h-[calc(15vw+20px)] rounded-full opacity-100 -z-[3]"
              style={{
                transform: 'translate(-50%, -50%)',
                background: 'var(--nm-bg-primary)',
                boxShadow: '4px 4px 12px rgba(163,177,198,0.4), -4px -4px 12px var(--nm-light-highlight), inset 2px 2px 4px rgba(163,177,198,0.2), inset -2px -2px 4px rgba(255,255,255,0.3)',
                animation: 'wave 2s ease-in-out infinite'
              }}
            />
            <div 
              className="dot absolute top-1/2 left-1/2 w-[calc(15vw+35px)] h-[calc(15vw+35px)] rounded-full opacity-100 -z-[1]"
              style={{
                transform: 'translate(-50%, -50%)',
                background: 'var(--nm-bg-primary)',
                boxShadow: '6px 6px 16px rgba(163,177,198,0.3), -6px -6px 16px var(--nm-light-highlight), inset 3px 3px 6px rgba(163,177,198,0.15), inset -3px -3px 6px rgba(255,255,255,0.25)',
                animation: 'wave 2s ease-in-out infinite',
                animationDelay: '0.5s'
              }}
            />
            <div 
              className="dot absolute top-1/2 left-1/2 w-[calc(15vw+50px)] h-[calc(15vw+50px)] rounded-full opacity-100 -z-[2]"
              style={{
                transform: 'translate(-50%, -50%)',
                background: 'var(--nm-bg-primary)',
                boxShadow: '8px 8px 20px rgba(163,177,198,0.25), -8px -8px 20px var(--nm-light-highlight), inset 4px 4px 8px rgba(163,177,198,0.1), inset -4px -4px 8px rgba(255,255,255,0.2)',
                animation: 'wave 2s ease-in-out infinite',
                animationDelay: '1s'
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default VoiceAssistant