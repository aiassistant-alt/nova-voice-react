/**
 * Header Component
 * Displays navigation menu button and status badges
 * @param {function} toggleSidebar - Function to toggle sidebar visibility
 * @param {object} currentLesson - Currently selected lesson object
 * @param {boolean} isPlaying - Voice assistant playback state
 * @param {boolean} sidebarActive - Sidebar visibility state
 */
const Header = ({ toggleSidebar, currentLesson, isPlaying, sidebarActive }) => {
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

      {/* Top Header Badges - Aligned with menu button */}
      <div className="badges-container fixed top-[15px] left-1/2 transform -translate-x-1/2 flex items-center z-[999] pointer-events-none" style={{ gap: '60px' }}>
        {/* Radio Badge - HABLANDO/ESCUCHANDO */}
        <div className={`radio-badge pointer-events-auto ${isPlaying ? 'speaking' : ''}`}>
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
              style={{ color: isPlaying ? '#22c55e' : 'var(--nm-accent)' }}
            />
            <span 
              className="text-[0.9rem] font-semibold text-[var(--nm-text-primary)] uppercase tracking-[0.5px]"
            >
              {isPlaying ? 'HABLANDO' : 'ESCUCHANDO'}
            </span>
          </div>
          
          {/* Radio Indicator */}
          <div className="radio-indicator" />
        </div>
        
        {/* Lesson Title Badge - Same style as radio badge */}
        <div className="lesson-badge pointer-events-auto">
          <i className="fas fa-book-open" style={{ color: 'var(--nm-accent)' }}></i>
          <span className="text-[0.9rem] font-semibold text-[var(--nm-text-primary)] uppercase tracking-[0.5px]">
            {currentLesson ? currentLesson.title : 'MÓDULO 1 - LECCIÓN 1'}
          </span>
        </div>
      </div>
    </>
  )
}

export default Header