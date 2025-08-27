import { useState, useEffect } from 'react'

/**
 * Library Component
 * Main library page with two sidebars and central content area
 */
const Library = ({ theme, setTheme }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [aiMessage, setAiMessage] = useState('')
  const [documentContent, setDocumentContent] = useState('')
  const [chatMessages, setChatMessages] = useState([
    { type: 'ai', text: 'Hello! I\'m your AI tutor. How can I help you today?' }
  ])
  const [currentMessage, setCurrentMessage] = useState('')
  const [chatExpanded, setChatExpanded] = useState(false)
  const [selectedModule, setSelectedModule] = useState('1')
  const [selectedLesson, setSelectedLesson] = useState('1')
  
  const lessons = [
    { id: 1, title: 'Introduction to React', completed: true, progress: 100 },
    { id: 2, title: 'State Management', completed: true, progress: 100 },
    { id: 3, title: 'Component Lifecycle', completed: false, progress: 45 },
    { id: 4, title: 'Hooks and Effects', completed: false, progress: 20 },
    { id: 5, title: 'Advanced Patterns', completed: false, progress: 0 }
  ]
  
  const sources = [
    { id: 1, name: 'React Documentation', type: 'pdf', size: '2.3 MB' },
    { id: 2, name: 'JavaScript Guide', type: 'doc', size: '1.5 MB' },
    { id: 3, name: 'CSS Animations', type: 'pdf', size: '890 KB' },
    { id: 4, name: 'API Reference', type: 'txt', size: '450 KB' },
    { id: 5, name: 'Best Practices', type: 'doc', size: '1.1 MB' }
  ]
  
  const filteredSources = sources.filter(source =>
    source.name.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
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
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.body.setAttribute('data-theme', theme)
    localStorage.setItem('novavoice-theme', theme)
  }, [theme])
  
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      background: 'var(--nm-bg-primary)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Left Sidebar - 20% */}
      <div 
        className="library-sidebar-left"
        style={{
          width: '20%',
          height: '100%',
          background: 'var(--nm-bg-secondary)',
          boxShadow: 'var(--nm-shadow-raised)',
          borderRadius: '0 20px 20px 0',
          padding: '15px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 10,
          border: theme === 'black' ? '1px solid var(--color-border)' : 'none'
        }}
      >
        {/* Header Section with Back Button */}
        <div style={{
          width: '100%',
          padding: '12px',
          marginBottom: '15px',
          borderRadius: '12px',
          background: 'var(--nm-bg-primary)',
          boxShadow: 'var(--nm-shadow-raised)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          border: theme === 'black' ? '1px solid var(--color-border)' : 'none'
        }}>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: 'var(--nm-bg-secondary)',
              boxShadow: 'var(--nm-shadow-raised-sm)',
              border: theme === 'black' ? '1px solid var(--color-border)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--nm-text-primary)',
              fontSize: '12px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = 'var(--nm-shadow-pressed)'
              e.currentTarget.style.transform = 'scale(0.95)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'var(--nm-shadow-raised-sm)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <h2 style={{
            color: 'var(--nm-text-primary)',
            fontSize: '16px',
            fontWeight: '600',
            margin: 0,
            flex: 1,
            textAlign: 'center'
          }}>
            Learning Path
          </h2>
        </div>
        
        {/* First Section - Lessons List - AUMENTADA */}
        <div style={{
          width: '100%',
          height: '60%',
          padding: '12px',
          marginBottom: '10px',
          borderRadius: '12px',
          background: 'var(--nm-bg-primary)',
          boxShadow: 'var(--nm-shadow-pressed)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: theme === 'black' ? '1px solid var(--color-border)' : 'none'
        }}>
          <h3 style={{
            color: 'var(--nm-text-primary)',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <i className="fas fa-book-open"></i>
            Lessons
          </h3>
          <div style={{
            flex: 1,
            overflowY: 'auto',
            paddingRight: '10px'
          }}>
            {lessons.map(lesson => (
              <div
                key={lesson.id}
                className="library-lesson-item"
                style={{
                  padding: '8px 10px',
                  marginBottom: '6px',
                  borderRadius: '8px',
                  background: 'var(--nm-bg-secondary)',
                  boxShadow: 'var(--nm-shadow-inset-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: theme === 'black' ? '1px solid #353535' : 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(5px)'
                  e.currentTarget.style.boxShadow = 'var(--nm-shadow-raised-sm)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)'
                  e.currentTarget.style.boxShadow = 'var(--nm-shadow-inset-light)'
                }}
              >
                <div style={{ flex: 1 }}>
                  <span style={{
                    color: 'var(--nm-text-primary)',
                    fontSize: '12px',
                    fontWeight: '500',
                    display: 'block'
                  }}>{lesson.title}</span>
                  <span style={{
                    color: 'var(--nm-text-secondary)',
                    fontSize: '10px',
                    marginTop: '2px',
                    display: 'block'
                  }}>{lesson.progress}% complete</span>
                </div>
                <i className={`fas fa-check-circle`} style={{
                  color: lesson.completed ? 'var(--nm-success)' : 'var(--nm-detail-4)',
                  fontSize: '16px'
                }}></i>
              </div>
            ))}
          </div>
        </div>
        
        {/* Third Section - AI Tools - NUEVA SECCIÓN SIDEBAR IZQUIERDA */}
        <div style={{
          width: '100%',
          height: '23%',
          padding: '18px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(186,146,234,0.15), rgba(186,146,234,0.05))',
          boxShadow: 'var(--nm-shadow-pressed)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <h3 style={{
            color: 'var(--nm-text-primary)',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <i className="fas fa-robot" style={{ color: 'rgba(186,146,234,0.7)' }}></i>
            AI Tools
          </h3>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            flex: 1
          }}>
            {/* Generate with AI - Special button */}
            <button
              onClick={() => console.log('Generate with AI')}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                background: theme === 'black' ? 'var(--color-button-bg)' : 'var(--nm-bg-secondary)',
                boxShadow: 'var(--nm-shadow-raised)',
                border: theme === 'black' ? '1px solid #454545' : '1px solid var(--nm-detail-3)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: 'var(--nm-text-primary)',
                fontSize: '11px',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(186,146,234,0.35), rgba(186,146,234,0.15))'
                e.currentTarget.style.transform = 'scale(1.02)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(186,146,234,0.25), rgba(186,146,234,0.1))'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              <i className="fas fa-sparkles" style={{ color: 'rgba(186,146,234,0.8)' }}></i>
              <span>Generate Content</span>
            </button>
            
            {/* AI Assistant */}
            <button
              onClick={() => console.log('AI Assistant')}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                background: theme === 'black' ? 'var(--color-button-bg)' : 'var(--nm-bg-secondary)',
                boxShadow: 'var(--nm-shadow-raised)',
                border: theme === 'black' ? '1px solid #454545' : '1px solid var(--nm-detail-3)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: 'var(--nm-text-primary)',
                fontSize: '11px',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(186,146,234,0.35), rgba(186,146,234,0.15))'
                e.currentTarget.style.transform = 'scale(1.02)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(186,146,234,0.25), rgba(186,146,234,0.1))'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              <i className="fas fa-brain" style={{ color: 'rgba(186,146,234,0.8)' }}></i>
              <span>Smart Assistant</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Central Content Area - Document Canvas (Word-like) */}
      <div style={{
        flex: 1,
        height: '100%',
        padding: '20px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        background: theme === 'black' ? '#1a1a1a' : '#f5f5f5'
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          borderRadius: '2px',
          background: theme === 'black' ? '#ffffff' : '#ffffff',
          boxShadow: theme === 'black' ? '0 0 0 1px #404040' : '0 2px 4px rgba(0,0,0,0.1)',
          padding: '0',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Word-like Toolbar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 20px',
            background: theme === 'black' ? '#f0f0f0' : '#f8f8f8',
            borderBottom: theme === 'black' ? '1px solid #d0d0d0' : '1px solid #e0e0e0'
          }}>
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <label style={{
                  fontSize: '14px',
                  color: '#666666',
                  fontWeight: '500'
                }}>Module:</label>
                <select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: '#ffffff',
                    border: '1px solid #d0d0d0',
                    color: '#333333',
                    fontSize: '14px',
                    cursor: 'pointer',
                    outline: 'none',
                    minWidth: '120px'
                  }}
                >
                  <option value="1">Module 1</option>
                  <option value="2">Module 2</option>
                  <option value="3">Module 3</option>
                </select>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <label style={{
                  fontSize: '14px',
                  color: '#666666',
                  fontWeight: '500'
                }}>Lesson:</label>
                <select
                  value={selectedLesson}
                  onChange={(e) => setSelectedLesson(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: '#ffffff',
                    border: '1px solid #d0d0d0',
                    color: '#333333',
                    fontSize: '14px',
                    cursor: 'pointer',
                    outline: 'none',
                    minWidth: '150px'
                  }}
                >
                  <option value="1">Lesson 1: Introduction</option>
                  <option value="2">Lesson 2: Basics</option>
                  <option value="3">Lesson 3: Advanced</option>
                  <option value="4">Lesson 4: Practice</option>
                  <option value="5">Lesson 5: Review</option>
                </select>
              </div>
            </div>
            
            {/* Save and Share buttons in toolbar */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                style={{
                  padding: '6px 14px',
                  borderRadius: '4px',
                  border: '1px solid #d0d0d0',
                  background: '#ffffff',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: '#444444',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f0f0f0'
                  e.currentTarget.style.borderColor = '#0078d4'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffffff'
                  e.currentTarget.style.borderColor = '#d0d0d0'
                }}
              >
                <i className="fas fa-save" style={{ fontSize: '11px' }}></i>
                <span>Save</span>
              </button>
              <button
                style={{
                  padding: '6px 14px',
                  borderRadius: '4px',
                  border: '1px solid #d0d0d0',
                  background: '#ffffff',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: '#444444',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f0f0f0'
                  e.currentTarget.style.borderColor = '#0078d4'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffffff'
                  e.currentTarget.style.borderColor = '#d0d0d0'
                }}
              >
                <i className="fas fa-share" style={{ fontSize: '11px' }}></i>
                <span>Share</span>
              </button>
            </div>
          </div>
          
          {/* Document Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            paddingBottom: '15px',
            borderBottom: '1px solid var(--nm-border)',
            gap: '15px'
          }}>
            <input
              type="text"
              placeholder="Untitled Document"
              style={{
                fontSize: '24px',
                fontWeight: '600',
                color: 'var(--nm-text-primary)',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                flex: 1,
                padding: '4px 8px',
                borderRadius: '8px',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.background = 'var(--nm-bg-secondary)'
                e.currentTarget.style.boxShadow = 'var(--nm-shadow-inset-light)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
            <button
              onClick={() => console.log('Generate with AI')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #d0d0d0',
                background: 'linear-gradient(135deg, #5C6BC0, #6A1B9A)',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                fontWeight: '500',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #6A1B9A, #5C6BC0)'
                e.currentTarget.style.transform = 'scale(1.02)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #5C6BC0, #6A1B9A)'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              <i className="fas fa-sparkles" style={{ fontSize: '13px' }}></i>
              <span>Generate with AI</span>
            </button>
          </div>
          
          {/* Document Editor Area - Word Page */}
          <div style={{
            flex: 1,
            width: '100%',
            position: 'relative',
            background: '#ffffff',
            display: 'flex',
            justifyContent: 'center',
            overflowY: 'auto',
            padding: '30px 20px'
          }}>
            <div style={{
              width: '100%',
              maxWidth: '850px',
              minHeight: '100%',
              background: '#ffffff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
              padding: '96px',
              fontFamily: 'Calibri, "Segoe UI", Arial, sans-serif'
            }}>
              <textarea
                placeholder="Start typing your document..."
                value={documentContent}
                onChange={(e) => setDocumentContent(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '800px',
                  border: 'none',
                  outline: 'none',
                  fontSize: '11pt',
                  lineHeight: '1.5',
                  color: '#000000',
                  background: 'transparent',
                  resize: 'none',
                  fontFamily: 'Calibri, "Segoe UI", Arial, sans-serif'
                }}
              />
            </div>
          </div>
          
          {/* Document Footer - Word Status Bar */}
          <div style={{
            padding: '6px 20px',
            borderTop: '1px solid #e0e0e0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#f3f3f3'
          }}>
            <div style={{
              fontSize: '11px',
              color: '#666666'
            }}>
              {documentContent.length} characters
            </div>
            <div style={{
              fontSize: '11px',
              color: '#666666'
            }}>
              Last saved: Never
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Sidebar - 20% */}
      <div 
        className="library-sidebar-right"
        style={{
          width: '20%',
          height: '100%',
          background: 'var(--nm-bg-secondary)',
          boxShadow: 'var(--nm-shadow-raised)',
          borderRadius: '20px 0 0 20px',
          padding: '15px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 10,
          border: theme === 'black' ? '1px solid var(--color-border)' : 'none'
        }}
      >
        {/* Available Sources Section - Extended to bottom */}
        <div style={{
          width: '100%',
          flex: 1,
          padding: '12px',
          marginBottom: '15px',
          borderRadius: '12px',
          background: 'var(--nm-bg-primary)',
          boxShadow: 'var(--nm-shadow-pressed)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: theme === 'black' ? '1px solid var(--color-border)' : 'none'
        }}>
          <h3 style={{
            color: 'var(--nm-text-primary)',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <i className="fas fa-folder-open"></i>
            Available Sources
          </h3>
          
          {/* Search Bar */}
          <div style={{
            position: 'relative',
            marginBottom: '15px'
          }}>
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 35px 10px 12px',
                borderRadius: '10px',
                border: 'none',
                background: 'var(--nm-bg-secondary)',
                boxShadow: 'var(--nm-shadow-inset-light)',
                color: 'var(--nm-text-primary)',
                fontSize: '13px',
                outline: 'none'
              }}
            />
            <i className="fas fa-search" style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--nm-text-secondary)',
              fontSize: '14px'
            }}></i>
          </div>
          
          {/* Documents List */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            paddingRight: '10px'
          }}>
            {filteredSources.map(source => (
              <div
                key={source.id}
                style={{
                  padding: '10px 12px',
                  marginBottom: '8px',
                  borderRadius: '10px',
                  background: 'var(--nm-bg-secondary)',
                  boxShadow: 'var(--nm-shadow-inset-light)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(3px)'
                  e.currentTarget.style.boxShadow = 'var(--nm-shadow-raised-sm)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)'
                  e.currentTarget.style.boxShadow = 'var(--nm-shadow-inset-light)'
                }}
              >
                <i className={`fas fa-file-${source.type === 'pdf' ? 'pdf' : source.type === 'doc' ? 'word' : 'alt'}`} 
                   style={{
                     color: source.type === 'pdf' ? '#dc3545' : source.type === 'doc' ? '#0066cc' : 'var(--nm-text-secondary)',
                     fontSize: '16px'
                   }}></i>
                <div style={{ flex: 1 }}>
                  <div style={{
                    color: 'var(--nm-text-primary)',
                    fontSize: '11px',
                    fontWeight: '500'
                  }}>{source.name}</div>
                  <div style={{
                    color: 'var(--nm-text-secondary)',
                    fontSize: '9px'
                  }}>{source.size}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Library