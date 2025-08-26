import { useState } from 'react'

/**
 * Sidebar Component
 * Displays course lessons with module selection and theme switcher
 * @param {boolean} active - Controls sidebar visibility
 * @param {function} toggleSidebar - Function to toggle sidebar state
 * @param {number} currentModule - Currently selected module (1-3)
 * @param {function} setCurrentModule - Function to update current module
 * @param {function} setCurrentLesson - Function to update current lesson
 * @param {string} theme - Current theme name
 * @param {function} setTheme - Function to update theme
 */
const Sidebar = ({ active, toggleSidebar, currentModule, setCurrentModule, setCurrentLesson, theme, setTheme }) => {
  const [lessons] = useState({
    1: [
      { id: 1, number: 1, title: 'Lección 1', unlocked: true, progress: 85, timeSpent: 17 },
      { id: 2, number: 2, title: 'Lección 2', unlocked: false, progress: 0, timeSpent: 0 },
      { id: 3, number: 3, title: 'Lección 3', unlocked: false, progress: 0, timeSpent: 0 },
      { id: 4, number: 4, title: 'Lección 4', unlocked: false, progress: 0, timeSpent: 0 },
      { id: 5, number: 5, title: 'Lección 5', unlocked: false, progress: 0, timeSpent: 0 },
      { id: 6, number: 6, title: 'Lección 6', unlocked: false, progress: 0, timeSpent: 0 }
    ],
    2: [
      { id: 7, number: 1, title: 'Lección 1', unlocked: false, progress: 0, timeSpent: 0 },
      { id: 8, number: 2, title: 'Lección 2', unlocked: false, progress: 0, timeSpent: 0 },
      { id: 9, number: 3, title: 'Lección 3', unlocked: false, progress: 0, timeSpent: 0 },
      { id: 10, number: 4, title: 'Lección 4', unlocked: false, progress: 0, timeSpent: 0 },
      { id: 11, number: 5, title: 'Lección 5', unlocked: false, progress: 0, timeSpent: 0 }
    ],
    3: [
      { id: 12, number: 1, title: 'Lección 1', unlocked: false, progress: 0, timeSpent: 0 },
      { id: 13, number: 2, title: 'Lección 2', unlocked: false, progress: 0, timeSpent: 0 },
      { id: 14, number: 3, title: 'Lección 3', unlocked: false, progress: 0, timeSpent: 0 },
      { id: 15, number: 4, title: 'Lección 4', unlocked: false, progress: 0, timeSpent: 0 }
    ]
  })

  const [selectedLesson, setSelectedLesson] = useState(1)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  
  const themes = ['white', 'black', 'blue', 'purple']
  const themeIcons = {
    white: '☀️',
    black: '🌙',
    blue: '🌊',
    purple: '🔮'
  }
  
  const handleThemeChange = () => {
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  const getProgressClass = (progress) => {
    if (progress === 0) return 'not-started'
    if (progress >= 100) return 'completed'
    return 'in-progress'
  }

  const handleLessonClick = (lesson) => {
    if (lesson.unlocked) {
      setSelectedLesson(lesson.number)
      setCurrentLesson(lesson)
      
      // Auto-close sidebar after lesson selection
      setTimeout(() => {
        toggleSidebar()
      }, 500)
    }
  }

  const handleModuleChange = (moduleNumber) => {
    setCurrentModule(moduleNumber)
    setSelectedLesson(1)
    setDropdownOpen(false)
  }

  return (
    <div className={`sidebar ${active ? 'active' : ''}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="sidebar-title">
          <i className="fas fa-book-open"></i>
          <span>Lecciones</span>
        </div>
        
        <div className="header-module-dropdown" style={{ flex: 1, margin: '0 15px', position: 'relative' }}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="header-dropdown-toggle"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              width: '100%',
              justifyContent: 'space-between'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <span>Módulo {currentModule}</span>
            <i className={`fas fa-chevron-down text-xs transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}></i>
          </button>
          
          {dropdownOpen && (
            <div className="dropdown-menu"
                 style={{
                   position: 'absolute',
                   top: 'calc(100% + 5px)',
                   left: '0',
                   right: '0',
                   background: 'var(--nm-bg-primary)',
                   borderRadius: '8px',
                   boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), var(--nm-shadow-raised)',
                   zIndex: '1001',
                   overflow: 'hidden',
                   maxHeight: '200px',
                   overflowY: 'auto'
                 }}>
              {[1, 2, 3].map((moduleNum) => (
                <div 
                  key={moduleNum}
                  className="dropdown-item"
                  onClick={() => handleModuleChange(moduleNum)}
                  style={{
                    padding: '12px 15px',
                    color: currentModule === moduleNum ? 'var(--nm-accent)' : 'var(--nm-text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontWeight: currentModule === moduleNum ? '600' : '400',
                    background: currentModule === moduleNum ? 'var(--nm-detail-1)' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (currentModule !== moduleNum) {
                      e.currentTarget.style.background = 'var(--nm-detail-1)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentModule !== moduleNum) {
                      e.currentTarget.style.background = 'transparent'
                    }
                  }}
                >
                  Módulo {moduleNum}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <button 
          onClick={toggleSidebar}
          className="sidebar-close-btn"
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.3)',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            transition: 'all 0.3s ease',
            fontSize: '14px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
          }}
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      {/* Sidebar Content */}
      <div className="sidebar-content">
        <div className="lesson-list">
          {lessons[currentModule].map((lesson) => (
            <div 
              key={lesson.id}
              onClick={() => handleLessonClick(lesson)}
              className={`lesson-item ${selectedLesson === lesson.number ? 'active' : ''}`}
              style={{
                cursor: lesson.unlocked ? 'pointer' : 'not-allowed',
                opacity: lesson.unlocked ? '1' : '0.5'
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                marginBottom: '10px' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className={`fas ${lesson.unlocked ? 'fa-play-circle' : 'fa-lock'}`} 
                     style={{ 
                       color: selectedLesson === lesson.number 
                         ? '#ffffff' 
                         : lesson.unlocked 
                           ? 'var(--nm-accent)' 
                           : 'var(--nm-text-secondary)',
                       fontSize: '18px'
                     }}></i>
                  <span style={{ fontWeight: '500', fontSize: '14px' }}>{lesson.title}</span>
                </div>
                {lesson.unlocked && (
                  <span style={{ 
                    fontSize: '11px', 
                    opacity: '0.7',
                    color: selectedLesson === lesson.number ? '#ffffff' : 'var(--nm-text-secondary)'
                  }}>
                    {lesson.timeSpent} min
                  </span>
                )}
              </div>
              
              {lesson.unlocked && (
                <div className="lesson-progress" 
                     style={{ 
                       display: 'flex', 
                       alignItems: 'center', 
                       gap: '10px'
                     }}>
                  <div className="lesson-progress-bar">
                    <div className={`lesson-progress-fill ${getProgressClass(lesson.progress)}`}
                         style={{
                           width: `${lesson.progress}%`
                         }} />
                  </div>
                  <span className="lesson-progress-text">
                    {lesson.progress}%
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Sidebar Footer with Theme Button */}
      <div className="sidebar-footer" style={{
        position: 'absolute',
        bottom: '0',
        left: '0',
        right: '0',
        padding: '20px',
        borderTop: '1px solid var(--nm-border)',
        background: 'var(--nm-bg-secondary)'
      }}>
        <button
          onClick={handleThemeChange}
          className="theme-cycle-btn"
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '12px',
            background: 'var(--nm-bg-primary)',
            boxShadow: 'var(--nm-shadow-raised)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            color: 'var(--nm-text-primary)',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = 'var(--nm-shadow-inset-light)'
            e.currentTarget.style.transform = 'scale(0.98)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'var(--nm-shadow-raised)'
            e.currentTarget.style.transform = 'scale(1)'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.boxShadow = 'var(--nm-shadow-pressed)'
            e.currentTarget.style.transform = 'scale(0.95)'
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.boxShadow = 'var(--nm-shadow-inset-light)'
            e.currentTarget.style.transform = 'scale(0.98)'
          }}
        >
          <span style={{ fontSize: '20px' }}>{themeIcons[theme]}</span>
          <span style={{ textTransform: 'capitalize' }}>Tema: {theme}</span>
          <i className="fas fa-chevron-right" style={{ fontSize: '12px', opacity: '0.6' }}></i>
        </button>
      </div>
    </div>
  )
}

export default Sidebar