import { useState, useEffect, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import VoiceAssistant from './components/VoiceAssistant'
import Sidebar from './components/Sidebar'
import QuizSidebar from './components/QuizSidebar'
import Controls from './components/Controls'
import Header from './components/Header'
import Library from './components/Library'
import LoginPage from './components/LoginPage'
import useAuth from './hooks/useAuth'

/**
 * Main App Component
 * Nova Voice React - Neumorphic Voice Assistant Interface
 * Features multi-theme support, interactive lessons, and AI quiz system
 */
function App() {
  // Authentication state
  const { isAuthenticated, isLoading, user } = useAuth()
  
  // Theme state - Load from localStorage or default to purple
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('novavoice-theme')
    return savedTheme || 'purple'
  })
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
  
  // Estados de audio Nova Sonic - CRÍTICOS PARA FUNCIONAMIENTO
  const [isListening, setIsListening] = useState(false)
  const [isNovaPlaying, setIsNovaPlaying] = useState(false)
  
  // Theme configuration
  const themes = ['white', 'black', 'blue', 'purple']
  const themeIndexRef = useRef(3) // Start with purple

  useEffect(() => {
    document.body.setAttribute('data-theme', theme)
    localStorage.setItem('novavoice-theme', theme)
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

  const MainLayout = () => (
    <div className="flex flex-col items-center justify-center h-screen relative"
         style={{ background: 'var(--nm-bg-primary)' }}>
      {/* Header Controls */}
      <Header 
        toggleSidebar={toggleSidebar}
        currentLesson={currentLesson}
        sidebarActive={sidebarActive}
        isListening={isListening}
        isPlaying={isNovaPlaying}
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
          right: quizActive ? '320px' : '20px',
          zIndex: '102',
          transition: 'all 0.3s ease'
        }}
      >
        <i className="fas fa-brain"></i>
        <span>AI Quiz</span>
      </button>
      
      {/* Central Voice Assistant */}
      <VoiceAssistant 
        isPlaying={isPlaying} 
        togglePlay={togglePlay}
        onListeningChange={setIsListening}
        onNovaPlayingChange={setIsNovaPlaying}
      />
      
      {/* Bottom Controls */}
      <div className="fixed bottom-[30px] left-1/2 transform -translate-x-1/2 z-[600]">
        <Controls 
          isPlaying={isPlaying}
          togglePlay={togglePlay}
          isMuted={isMuted}
          toggleMute={toggleMute}
        />
      </div>
    </div>
  )

  // Loading screen mientras verificamos autenticación
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        {/* Ruta de login */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/voice" replace /> : <LoginPage />
          } 
        />
        
        {/* Rutas protegidas */}
        <Route 
          path="/voice" 
          element={
            isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />
          } 
        />
        
        <Route 
          path="/library" 
          element={
            isAuthenticated ? 
              <Library theme={theme} setTheme={setTheme} /> : 
              <Navigate to="/login" replace />
          } 
        />
        
        {/* Redirección por defecto */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? 
              <Navigate to="/voice" replace /> : 
              <Navigate to="/login" replace />
          } 
        />
      </Routes>
    </Router>
  )
}

export default App