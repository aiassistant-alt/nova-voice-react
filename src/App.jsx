import { useState, useEffect, useRef } from 'react'
import VoiceAssistant from './components/VoiceAssistant'
import Sidebar from './components/Sidebar'
import QuizSidebar from './components/QuizSidebar'
import Controls from './components/Controls'
import Header from './components/Header'

/**
 * Main App Component
 * Nova Voice React - Neumorphic Voice Assistant Interface
 * Features multi-theme support, interactive lessons, and AI quiz system
 */
function App() {
  // Theme state
  const [theme, setTheme] = useState('purple')
  const [autoTheme, setAutoTheme] = useState(false) // Disabled for manual theme cycling
  
  // UI state
  const [sidebarActive, setSidebarActive] = useState(false)
  const [quizActive, setQuizActive] = useState(false)
  
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  
  // Course state
  const [currentLesson, setCurrentLesson] = useState(null)
  const [currentModule, setCurrentModule] = useState(1)
  
  // Theme configuration
  const themes = ['white', 'black', 'blue', 'purple']
  const themeIndexRef = useRef(3) // Start with purple

  useEffect(() => {
    document.body.setAttribute('data-theme', theme)
  }, [theme])


  useEffect(() => {
    document.body.className = `${sidebarActive ? 'sidebar-active' : ''} ${quizActive ? 'quiz-active' : ''}`
  }, [sidebarActive, quizActive])

  const toggleSidebar = () => setSidebarActive(!sidebarActive)
  const toggleQuiz = () => setQuizActive(!quizActive)
  const togglePlay = () => setIsPlaying(!isPlaying)
  const toggleMute = () => {
    if (isPlaying) {
      setIsMuted(!isMuted)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen relative"
         style={{ background: 'var(--nm-bg-primary)' }}>
      {/* Header Controls */}
      <Header 
        toggleSidebar={toggleSidebar}
        currentLesson={currentLesson}
        isPlaying={isPlaying}
        sidebarActive={sidebarActive}
      />
      
      {/* Left Sidebar */}
      <Sidebar 
        active={sidebarActive}
        toggleSidebar={toggleSidebar}
        currentModule={currentModule}
        setCurrentModule={setCurrentModule}
        setCurrentLesson={setCurrentLesson}
        theme={theme}
        setTheme={setTheme}
      />
      
      {/* Right Quiz Sidebar */}
      <QuizSidebar 
        active={quizActive}
        toggleQuiz={toggleQuiz}
      />
      
      {/* AI Quiz Button - Top Right */}
      <button 
        onClick={toggleQuiz}
        className="ai-quiz-btn"
        style={{
          position: 'fixed',
          top: '20px',
          right: quizActive ? '420px' : '20px',
          background: 'var(--nm-bg-primary)',
          border: 'none',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: 'var(--nm-shadow-raised)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--nm-text-primary)',
          fontSize: '16px',
          fontWeight: '600',
          transition: 'all 0.3s ease',
          zIndex: '102',
          gap: '8px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = 'var(--nm-shadow-inset-light)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'var(--nm-shadow-raised)'
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.boxShadow = 'inset -4px -4px 10px var(--nm-light-highlight), inset 4px 4px 10px rgba(163,177,198,0.4)'
          e.currentTarget.style.transform = 'scale(0.98)'
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.boxShadow = 'var(--nm-shadow-raised)'
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        <i className="fas fa-brain"></i>
        AI Quiz
      </button>
      
      {/* Central Voice Assistant */}
      <VoiceAssistant isPlaying={isPlaying} togglePlay={togglePlay} />
      
      {/* Bottom Controls */}
      <div style={{
        position: 'fixed',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: '600'
      }}>
        <Controls 
          isPlaying={isPlaying}
          togglePlay={togglePlay}
          isMuted={isMuted}
          toggleMute={toggleMute}
        />
      </div>
    </div>
  )
}

export default App