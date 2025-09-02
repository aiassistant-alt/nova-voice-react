/**
 * Header Component
 * Displays navigation menu button and status badges
 * @param {function} toggleSidebar - Function to toggle sidebar visibility
 * @param {object} currentLesson - Currently selected lesson object
 * @param {boolean} isPlaying - Voice assistant playback state
 * @param {boolean} sidebarActive - Sidebar visibility state
 */
const Header = ({ toggleSidebar, currentLesson, isPlaying, sidebarActive, isListening }) => {
  return (
    <>
      {/* Menu Button for Sidebar - Only show when sidebar is closed */}
      {!sidebarActive && (
        <div 
          onClick={() => {
            toggleSidebar()
          }}
          className="m_button"
          id="menu-btn"
          style={{ position: 'fixed', left: '10px', top: '20px', zIndex: 10000 }}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      )}

      {/* Top Header Badge - CENTRADO PERFECTO CON CÍRCULO */}
      <div 
        className="badges-container fixed top-[15px] flex items-center justify-center z-[999] pointer-events-none"
        style={{ 
          left: '50%', 
          transform: 'translateX(-50%)', 
          width: 'auto',
          margin: 0, 
          padding: 0 
        }}
      >
        {/* Radio Badge - HABLANDO/ESCUCHANDO */}
        <div className={`radio-badge pointer-events-auto ${isPlaying || isListening ? 'speaking' : ''}`}>
          {/* Radio Waves Animation */}
          <div className="radio-waves">
            <div className="wave wave-1" />
            <div className="wave wave-2" />
            <div className="wave wave-3" />
          </div>
          
          {/* Radio Content */}
          <div className="radio-content flex items-center gap-2">
            <i 
              className="fas fa-microphone"
              style={{ color: isListening ? '#ef4444' : (isPlaying ? '#22c55e' : 'var(--nm-accent)') }}
            />
            <span 
              className="text-[0.9rem] font-semibold text-[var(--nm-text-primary)] uppercase tracking-[0.5px]"
            >
              {isListening ? 'ESCUCHANDO' : (isPlaying ? 'HABLANDO' : 'LISTO')}
            </span>
          </div>
          
          {/* Radio Indicator */}
          <div className="radio-indicator" />
        </div>
      </div>
    </>
  )
}

export default Header