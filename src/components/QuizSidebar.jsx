import { useState } from 'react'

/**
 * QuizSidebar Component
 * Interactive quiz panel with multiple choice questions
 * @param {boolean} active - Controls sidebar visibility
 * @param {function} toggleQuiz - Function to toggle quiz sidebar
 */
const QuizSidebar = ({ active, toggleQuiz }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showExplanation, setShowExplanation] = useState(false)
  
  const questions = [
    {
      question: "¿Cuál es el comando principal para activar Nova Voice?",
      options: ["Hey Nova", "OK Nova", "Nova Voice", "Activar Nova"],
      correct: 0,
      explanation: "El comando 'Hey Nova' es la forma principal de activar el asistente de voz."
    },
    {
      question: "¿Qué tecnología utiliza Nova Voice para el procesamiento del lenguaje?",
      options: ["GPT-3", "BERT", "Transformer Neural Networks", "Simple RNN"],
      correct: 2,
      explanation: "Nova Voice utiliza Transformer Neural Networks para un procesamiento avanzado del lenguaje natural."
    },
    {
      question: "¿Cuántos idiomas soporta Nova Voice actualmente?",
      options: ["5 idiomas", "10 idiomas", "15 idiomas", "20 idiomas"],
      correct: 1,
      explanation: "Nova Voice actualmente soporta 10 idiomas principales con dialectos regionales."
    },
    {
      question: "¿Cuál es la tasa de precisión de reconocimiento de voz de Nova?",
      options: ["85%", "90%", "95%", "99%"],
      correct: 3,
      explanation: "Nova Voice alcanza una precisión del 99% en condiciones óptimas."
    },
    {
      question: "¿Qué protocolo de seguridad utiliza Nova Voice?",
      options: ["SSL/TLS", "End-to-End Encryption", "Ambas", "Ninguna"],
      correct: 2,
      explanation: "Nova Voice utiliza tanto SSL/TLS como cifrado de extremo a extremo para máxima seguridad."
    }
  ]

  const handleAnswerSelect = (index) => {
    setSelectedAnswer(index)
    setShowExplanation(true)
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    }
  }

  const question = questions[currentQuestion]

  return (
    <div className={`quiz-sidebar ${active ? 'active' : ''}`}>
      {/* Quiz Header - Matching Main Sidebar */}
      <div className="sidebar-header" 
           style={{
             background: 'var(--nm-bg-secondary)',
             borderBottom: '1px solid var(--nm-detail-3)',
             color: 'var(--nm-text-primary)',
             padding: '10px 15px',
             margin: '10px 15px 5px 15px',
             borderRadius: '8px',
             boxShadow: 'var(--nm-shadow-raised)',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'space-between',
             height: '45px'
           }}>
        <h3 className="quiz-title" 
            style={{
              color: 'var(--nm-text-secondary)',
              fontSize: '16px',
              fontWeight: '600',
              margin: 0,
              display: 'flex',
              alignItems: 'center'
            }}>
          <i className="fas fa-clipboard-question" 
             style={{ marginRight: '8px', color: 'var(--nm-accent)', fontSize: '14px' }}></i>
          <span>Quiz</span>
        </h3>
        <button 
          onClick={toggleQuiz}
          className="sidebar-close-btn"
          style={{
            background: 'var(--nm-bg-primary)',
            border: '1px solid var(--nm-detail-3)',
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            boxShadow: 'var(--nm-shadow-raised-sm)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--nm-text-primary)',
            fontSize: '12px',
            transition: 'all 0.3s ease',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = 'var(--nm-shadow-inset-light)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'var(--nm-shadow-raised-sm)'
          }}
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      {/* Quiz Content - Matching Main Sidebar */}
      <div className="sidebar-content" style={{ 
        padding: '10px',
        margin: '0 15px 15px 15px',
        borderRadius: '8px',
        background: 'var(--nm-bg-primary)',
        boxShadow: 'inset 3px 3px 6px rgba(163, 177, 198, 0.3), inset -3px -3px 6px var(--nm-light-highlight, rgba(228, 233, 240, 0.5))',
        flex: 1,
        overflowY: 'auto'
      }}>
        <div className="question-card">
          <div>
            <div className="question-number"
                 style={{
                   color: '#ffffff',
                   fontSize: '12px',
                   fontWeight: '600',
                   marginBottom: '8px',
                   opacity: '0.9'
                 }}>
              Pregunta {currentQuestion + 1} de {questions.length}
            </div>
            <div className="question-text"
                 style={{
                   color: '#ffffff',
                   fontSize: '14px',
                   fontWeight: '500',
                   marginBottom: '12px',
                   lineHeight: '1.4'
                 }}>
              {question.question}
            </div>
            
            <div className="answers-container">
              {question.options.map((option, index) => (
                <div 
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className="answer-option"
                  data-theme={document.body.getAttribute('data-theme')}
                  style={{
                    background: selectedAnswer === index 
                      ? index === question.correct 
                        ? 'rgba(76, 175, 80, 0.3)'
                        : 'rgba(244, 67, 54, 0.3)'
                      : document.body.getAttribute('data-theme') === 'white'
                        ? 'rgba(0, 0, 0, 0.05)'
                        : 'rgba(255, 255, 255, 0.15)',
                    border: selectedAnswer === index
                      ? index === question.correct
                        ? '1px solid #4caf50'
                        : '1px solid #f44336'
                      : document.body.getAttribute('data-theme') === 'white'
                        ? '1px solid rgba(0, 0, 0, 0.2)'
                        : '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '6px',
                    boxShadow: 'inset 2px 2px 4px rgba(255, 255, 255, 0.1), inset -2px -2px 4px rgba(0, 0, 0, 0.2)',
                    padding: '8px 10px',
                    marginBottom: '6px',
                    color: document.body.getAttribute('data-theme') === 'white' ? '#212529' : '#ffffff',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedAnswer === null) {
                      const theme = document.body.getAttribute('data-theme');
                      if (theme === 'white') {
                        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.08)'
                        e.currentTarget.style.border = '1px solid rgba(0, 0, 0, 0.25)'
                        e.currentTarget.style.color = '#212529'
                      } else {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'
                        e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.5)'
                      }
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedAnswer === null) {
                      const theme = document.body.getAttribute('data-theme');
                      if (theme === 'white') {
                        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)'
                        e.currentTarget.style.border = '1px solid rgba(0, 0, 0, 0.2)'
                        e.currentTarget.style.color = '#212529'
                      } else {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                        e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.3)'
                        e.currentTarget.style.color = '#ffffff'
                      }
                      e.currentTarget.style.transform = 'translateY(0)'
                    }
                  }}
                >
                  {String.fromCharCode(65 + index)}. {option}
                  {selectedAnswer === index && index === question.correct && (
                    <i className="fas fa-check" style={{ marginLeft: '10px', color: '#4caf50' }}></i>
                  )}
                  {selectedAnswer === index && index !== question.correct && (
                    <i className="fas fa-times" style={{ marginLeft: '10px', color: '#f44336' }}></i>
                  )}
                </div>
              ))}
            </div>
            
            {showExplanation && (
              <div style={{
                marginTop: '15px',
                padding: '10px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#ffffff'
              }}>
                <i className="fas fa-info-circle" style={{ marginRight: '8px', color: 'var(--nm-accent)' }}></i>
                <strong>Explicación:</strong> {question.explanation}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Quiz Navigation */}
      <div className="quiz-navigation"
           style={{
             display: 'flex',
             justifyContent: 'space-between',
             alignItems: 'center',
             marginTop: '20px',
             paddingTop: '15px',
             borderTop: '2px solid rgba(163, 177, 198, 0.2)'
           }}>
        <button 
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="nav-btn"
          style={{
            background: currentQuestion === 0 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
            color: '#ffffff',
            fontWeight: '600',
            transition: 'all 0.25s ease-out',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: currentQuestion === 0 ? '0.5' : '1'
          }}
          onMouseEnter={(e) => {
            if (currentQuestion > 0) {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
              e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.6)'
              e.currentTarget.style.transform = 'scale(1.05)'
            }
          }}
          onMouseLeave={(e) => {
            if (currentQuestion > 0) {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
              e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.4)'
              e.currentTarget.style.transform = 'scale(1)'
            }
          }}
        >
          <i className="fas fa-chevron-left"></i>
          Anterior
        </button>
        
        <div className="question-counter"
             style={{
               background: 'var(--nm-bg-primary)',
               padding: '8px 15px',
               borderRadius: '20px',
               boxShadow: 'var(--nm-shadow-inset-light)',
               fontSize: '14px',
               fontWeight: '600',
               color: 'var(--nm-accent)'
             }}>
          {currentQuestion + 1} / {questions.length}
        </div>
        
        <button 
          onClick={handleNext}
          disabled={currentQuestion === questions.length - 1}
          className="nav-btn"
          style={{
            background: currentQuestion === questions.length - 1 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: currentQuestion === questions.length - 1 ? 'not-allowed' : 'pointer',
            color: '#ffffff',
            fontWeight: '600',
            transition: 'all 0.25s ease-out',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: currentQuestion === questions.length - 1 ? '0.5' : '1'
          }}
          onMouseEnter={(e) => {
            if (currentQuestion < questions.length - 1) {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
              e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.6)'
              e.currentTarget.style.transform = 'scale(1.05)'
            }
          }}
          onMouseLeave={(e) => {
            if (currentQuestion < questions.length - 1) {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
              e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.4)'
              e.currentTarget.style.transform = 'scale(1)'
            }
          }}
        >
          Siguiente
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  )
}

export default QuizSidebar