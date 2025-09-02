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
    <div className="voice-main-wrapper">
      {/* PATRÓN INTELLILEARN EXACTO: Tamaños fijos + flex centering */}
      <div className="nm-voice-circle-wrapper">
        <div className="nm-voice-circle" onClick={handleVoiceClick}>
          <div className="nm-voice-inner-circle">
            {/* PATRÓN INTELLILEARN EXACTO: Iridescent center */}
            <div 
              className={`nm-voice-iridescent ${(isPlaying || isListening || isActive) ? 'active' : ''}`}
            />
            
            {/* Debug error (invisible - solo consola) */}
            {error && console.error('🎤 Nova Audio Error:', error)}
          </div>
          
          {/* PATRÓN INTELLILEARN EXACTO: Voice waves */}
          {(isPlaying || isListening || isActive) && (
            <>
              <div className="nm-voice-wave nm-voice-wave-1" />
              <div className="nm-voice-wave nm-voice-wave-2" />
              <div className="nm-voice-wave nm-voice-wave-3" />
              <div className="nm-voice-wave nm-voice-wave-4" />
            </>
          )}
        </div>
      </div>
      
      {/* ESTILOS INTELLILEARN EXACTOS */}
      <style jsx>{`
        /* PATRÓN INTELLILEARN EXACTO: Main wrapper */
        .voice-main-wrapper {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 30px;
          z-index: 500;
        }
        
        /* PATRÓN INTELLILEARN EXACTO: Circle wrapper */
        .nm-voice-circle-wrapper {
          position: relative;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        /* PATRÓN INTELLILEARN EXACTO: Main circle - SIN SOMBRA BLANCA */
        .nm-voice-circle {
          position: relative;
          width: 280px;
          height: 280px;
          border-radius: 50%;
          background: var(--nm-bg-primary);
          box-shadow: var(--nm-shadow-elevated);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        
        .nm-voice-circle:hover {
          box-shadow: var(--nm-shadow-elevated);
          transform: scale(1.02);
        }
        
        /* PATRÓN INTELLILEARN EXACTO: Inner circle - SIN SOMBRA BLANCA */
        .nm-voice-inner-circle {
          position: relative;
          width: 220px;
          height: 220px;
          border-radius: 50%;
          background: var(--nm-bg-primary);
          box-shadow: var(--nm-shadow-inset-light);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        
        /* PATRÓN INTELLILEARN EXACTO: Iridescent center - COLORES INTENSOS SIN AMARILLO */
        .nm-voice-iridescent {
          position: absolute;
          width: 140px;
          height: 140px;
          border-radius: 50%;
          background: conic-gradient(
            from 0deg at 50% 50%,
            #FF007F 0deg,
            #FF00FF 60deg,
            #8B00FF 120deg,
            #0080FF 180deg,
            #00D4FF 240deg,
            #00FF94 300deg,
            #FF007F 360deg
          );
          filter: blur(12px);
          opacity: 0.4;
          animation: rotate-iridescent 4s linear infinite;
          z-index: 1;
        }
        
        .nm-voice-iridescent.active {
          opacity: 0.65;
          filter: blur(8px);
          animation: rotate-iridescent 2s linear infinite;
        }
        
        /* PATRÓN INTELLILEARN EXACTO: Voice waves - TAMAÑOS FIJOS */
        .nm-voice-wave {
          position: absolute;
          border: 2px solid;
          border-radius: 50%;
          opacity: 0;
          animation: voice-wave-animation 2s ease-out infinite;
          pointer-events: none;
        }
        
        .nm-voice-wave-1 {
          width: 300px;
          height: 300px;
          border-color: var(--nm-detail-3);
          animation-delay: 0s;
        }
        
        .nm-voice-wave-2 {
          width: 340px;
          height: 340px;
          border-color: var(--nm-detail-2);
          animation-delay: 0.5s;
        }
        
        .nm-voice-wave-3 {
          width: 380px;
          height: 380px;
          border-color: var(--nm-detail-1);
          animation-delay: 1s;
        }
        
        .nm-voice-wave-4 {
          width: 420px;
          height: 420px;
          border-color: var(--nm-border);
          animation-delay: 1.5s;
        }
        
        /* ANIMACIONES INTELLILEARN EXACTAS */
        @keyframes rotate-iridescent {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes voice-wave-animation {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

export default VoiceAssistant