import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn, signUp, confirmSignUp, forgotPassword, isLoading, error, clearError } = useAuth();
  
  const [mode, setMode] = useState('signin'); // signin, signup, confirm, forgot
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmationCode: ''
  });
  
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    clearError();
    setMessage('');
    
    try {
      const result = await signIn(formData.email, formData.password);
      if (result.success) {
        // Force navigation with replace
        navigate('/voice', { replace: true });
        // Force reload if navigation doesn't work
        setTimeout(() => {
          window.location.href = '/voice';
        }, 100);
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    clearError();
    setMessage('');
    
    try {
      const result = await signUp(formData.email, formData.password, { 
        name: formData.email.split('@')[0] 
      });
      
      if (result.requiresConfirmation) {
        setMode('confirm');
        setMessage('Please check your email for the confirmation code');
      } else if (result.success) {
        navigate('/voice', { replace: true });
      }
    } catch (error) {
      console.error('Sign up error:', error);
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    clearError();
    setMessage('');
    
    const result = await confirmSignUp(formData.email, formData.confirmationCode);
    if (result.success) {
      setMessage('Account confirmed! Please sign in.');
      setMode('signin');
      setFormData(prev => ({ ...prev, password: '', confirmationCode: '' }));
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    clearError();
    setMessage('');
    
    const result = await forgotPassword(formData.email);
    if (result.success) {
      setMessage('Password reset code sent to your email');
      setMode('signin');
    }
  };

  const handleSubmit = (e) => {
    if (mode === 'signin') {
      handleLogin(e);
    } else if (mode === 'signup') {
      handleSignUp(e);
    } else if (mode === 'confirm') {
      handleConfirm(e);
    } else if (mode === 'forgot') {
      handleForgotPassword(e);
    }
  };

  return (
    <PageWrapper>
      <StyledWrapper>
        <form className="form" onSubmit={handleSubmit}>
          <p id="heading">
            {mode === 'signin' ? 'Login' : 
             mode === 'signup' ? 'Sign Up' : 
             mode === 'confirm' ? 'Verify Email' : 
             'Reset Password'}
          </p>
          
          {message && (
            <div className="message">{message}</div>
          )}
          
          {error && (
            <div className="error">{error}</div>
          )}
          
          {mode !== 'confirm' && (
            <div className="field">
              <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
                <path d="M13.106 7.222c0-2.967-2.249-5.032-5.482-5.032-3.35 0-5.646 2.318-5.646 5.702 0 3.493 2.235 5.708 5.762 5.708.862 0 1.689-.123 2.304-.335v-.862c-.43.199-1.354.328-2.29.328-2.926 0-4.813-1.88-4.813-4.798 0-2.844 1.921-4.881 4.594-4.881 2.735 0 4.608 1.688 4.608 4.156 0 1.682-.554 2.769-1.416 2.769-.492 0-.772-.28-.772-.76V5.206H8.923v.834h-.11c-.266-.595-.881-.964-1.6-.964-1.4 0-2.378 1.162-2.378 2.823 0 1.737.957 2.906 2.379 2.906.8 0 1.415-.39 1.709-1.087h.11c.081.67.703 1.148 1.503 1.148 1.572 0 2.57-1.415 2.57-3.643zm-7.177.704c0-1.197.54-1.907 1.456-1.907.93 0 1.524.738 1.524 1.907S8.308 9.84 7.371 9.84c-.895 0-1.442-.725-1.442-1.914z" />
              </svg>
              <input 
                autoComplete="off" 
                placeholder="Email" 
                className="input-field" 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          )}
          
          {(mode === 'signin' || mode === 'signup') && (
            <div className="field">
              <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
              </svg>
              <input 
                placeholder="Password" 
                className="input-field" 
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
          )}
          
          {mode === 'confirm' && (
            <div className="field">
              <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
              </svg>
              <input 
                placeholder="Confirmation Code" 
                className="input-field" 
                type="text"
                value={formData.confirmationCode}
                onChange={(e) => setFormData({...formData, confirmationCode: e.target.value})}
                required
              />
            </div>
          )}
          
          {mode === 'signin' && (
            <>
              <div className="btn">
                <button type="submit" className="button1" disabled={isLoading}>
                  {isLoading ? 'Loading...' : 'Login'}
                </button>
                <button type="button" className="button2" onClick={() => setMode('signup')}>
                  Sign Up
                </button>
              </div>
              <button type="button" className="button3" onClick={() => setMode('forgot')}>
                Forgot Password
              </button>
            </>
          )}
          
          {mode === 'signup' && (
            <>
              <div className="btn">
                <button type="submit" className="button1" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Account'}
                </button>
                <button type="button" className="button2" onClick={() => setMode('signin')}>
                  Back to Login
                </button>
              </div>
            </>
          )}
          
          {mode === 'confirm' && (
            <>
              <div className="btn">
                <button type="submit" className="button1" disabled={isLoading}>
                  {isLoading ? 'Verifying...' : 'Verify'}
                </button>
                <button type="button" className="button2" onClick={() => setMode('signin')}>
                  Back to Login
                </button>
              </div>
            </>
          )}
          
          {mode === 'forgot' && (
            <>
              <div className="btn">
                <button type="submit" className="button1" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send Reset Code'}
                </button>
                <button type="button" className="button2" onClick={() => setMode('signin')}>
                  Back to Login
                </button>
              </div>
            </>
          )}
        </form>
      </StyledWrapper>
    </PageWrapper>
  );
};

const PageWrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
`;

const StyledWrapper = styled.div`
  .form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-left: 2em;
    padding-right: 2em;
    padding-bottom: 0.4em;
    background-color: #171717;
    border-radius: 25px;
    transition: .4s ease-in-out;
    min-width: 350px;
  }

  .form:hover {
    transform: scale(1.05);
    border: 1px solid black;
  }

  #heading {
    text-align: center;
    margin: 2em;
    color: rgb(255, 255, 255);
    font-size: 1.2em;
  }
  
  .message {
    background-color: #1a4d2e;
    color: #4ade80;
    padding: 10px;
    border-radius: 10px;
    text-align: center;
    margin: 10px 0;
    font-size: 0.9em;
  }
  
  .error {
    background-color: #4d1a1a;
    color: #f87171;
    padding: 10px;
    border-radius: 10px;
    text-align: center;
    margin: 10px 0;
    font-size: 0.9em;
  }

  .field {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5em;
    border-radius: 25px;
    padding: 0.6em;
    border: none;
    outline: none;
    color: white;
    background-color: #171717;
    box-shadow: inset 2px 5px 10px rgb(5, 5, 5);
  }

  .input-icon {
    height: 1.3em;
    width: 1.3em;
    fill: white;
  }

  .input-field {
    background: none;
    border: none;
    outline: none;
    width: 100%;
    color: #d3d3d3;
    font-size: 1em;
  }
  
  .input-field::placeholder {
    color: #808080;
  }

  .form .btn {
    display: flex;
    justify-content: center;
    flex-direction: row;
    margin-top: 2.5em;
    gap: 0.5em;
  }

  .button1 {
    padding: 0.5em;
    padding-left: 1.5em;
    padding-right: 1.5em;
    border-radius: 5px;
    border: none;
    outline: none;
    transition: .4s ease-in-out;
    background-color: #252525;
    color: white;
    cursor: pointer;
    font-size: 1em;
  }

  .button1:hover:not(:disabled) {
    background-color: black;
    color: white;
  }
  
  .button1:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .button2 {
    padding: 0.5em;
    padding-left: 1.5em;
    padding-right: 1.5em;
    border-radius: 5px;
    border: none;
    outline: none;
    transition: .4s ease-in-out;
    background-color: #252525;
    color: white;
    cursor: pointer;
    font-size: 1em;
  }

  .button2:hover {
    background-color: black;
    color: white;
  }

  .button3 {
    margin-bottom: 3em;
    padding: 0.5em;
    border-radius: 5px;
    border: none;
    outline: none;
    transition: .4s ease-in-out;
    background-color: #252525;
    color: white;
    cursor: pointer;
    font-size: 1em;
    margin-top: 1em;
  }

  .button3:hover {
    background-color: #8b0000;
    color: white;
  }
`;

export default LoginPage;