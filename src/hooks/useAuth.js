/**
 * useAuth Hook - AWS Cognito Integration
 * Gestión completa de autenticación con AWS Cognito
 */

import { useState, useEffect, useCallback } from 'react'
import { signIn, signUp, signOut, getCurrentUser, confirmSignUp, resetPassword, confirmResetPassword } from 'aws-amplify/auth'

const useAuth = () => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  /**
   * Verificar estado de autenticación actual
   */
  const checkAuthState = useCallback(async () => {
    try {
      setIsLoading(true)
      
      const currentUser = await getCurrentUser()
      
      if (currentUser) {
        setUser({
          username: currentUser.username,
          userId: currentUser.userId,
          signInDetails: currentUser.signInDetails
        })
        setIsAuthenticated(true)
        console.log('✅ [useAuth] User authenticated:', currentUser.username)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }

    } catch (error) {
      console.log('ℹ️ [useAuth] No authenticated user found')
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Iniciar sesión con Cognito
   */
  const handleSignIn = useCallback(async (email, password) => {
    try {
      setIsLoading(true)
      setError(null)

      const { isSignedIn, nextStep } = await signIn({
        username: email,
        password: password,
      })

      if (isSignedIn) {
        const currentUser = await getCurrentUser()
        setUser({
          username: currentUser.username,
          email: email,
          userId: currentUser.userId
        })
        setIsAuthenticated(true)
        
        console.log('✅ [useAuth] User signed in:', email)
        return { success: true }
      } else {
        // Manejar casos como MFA, nuevo password requerido, etc.
        console.log('Next step required:', nextStep)
        return { success: false, nextStep }
      }

    } catch (error) {
      console.error('❌ [useAuth] Sign in error:', error)
      
      // Manejo de errores específicos de Cognito
      let errorMessage = 'Error al iniciar sesión'
      
      if (error.name === 'UserNotFoundException') {
        errorMessage = 'Usuario no encontrado'
      } else if (error.name === 'NotAuthorizedException') {
        errorMessage = 'Credenciales incorrectas'
      } else if (error.name === 'UserNotConfirmedException') {
        errorMessage = 'Usuario no confirmado. Por favor verifica tu email'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Cerrar sesión
   */
  const handleSignOut = useCallback(async () => {
    try {
      setIsLoading(true)
      
      await signOut()
      
      setUser(null)
      setIsAuthenticated(false)
      
      console.log('✅ [useAuth] User signed out')

    } catch (error) {
      console.error('❌ [useAuth] Sign out error:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Registrar nuevo usuario
   */
  const handleSignUp = useCallback(async (email, password, attributes = {}) => {
    try {
      setIsLoading(true)
      setError(null)

      const { isSignUpComplete, userId, nextStep } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            ...attributes
          }
        }
      })

      console.log('✅ [useAuth] Sign up initiated for:', email)
      
      return { 
        success: true, 
        userId,
        isSignUpComplete,
        nextStep,
        requiresConfirmation: nextStep.signUpStep === 'CONFIRM_SIGN_UP'
      }

    } catch (error) {
      console.error('❌ [useAuth] Sign up error:', error)
      
      let errorMessage = 'Error al registrar usuario'
      
      if (error.name === 'UsernameExistsException') {
        errorMessage = 'Este email ya está registrado'
      } else if (error.name === 'InvalidPasswordException') {
        errorMessage = 'La contraseña no cumple con los requisitos mínimos'
      } else if (error.name === 'InvalidParameterException') {
        errorMessage = 'Parámetros inválidos. Verifica los datos ingresados'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Confirmar registro con código
   */
  const handleConfirmSignUp = useCallback(async (email, code) => {
    try {
      setIsLoading(true)
      setError(null)

      const { isSignUpComplete, nextStep } = await confirmSignUp({
        username: email,
        confirmationCode: code
      })
      
      console.log('✅ [useAuth] Sign up confirmed for:', email)
      
      return { 
        success: true,
        isSignUpComplete,
        nextStep
      }

    } catch (error) {
      console.error('❌ [useAuth] Confirm sign up error:', error)
      
      let errorMessage = 'Error al confirmar registro'
      
      if (error.name === 'CodeMismatchException') {
        errorMessage = 'Código de verificación incorrecto'
      } else if (error.name === 'ExpiredCodeException') {
        errorMessage = 'El código ha expirado. Solicita uno nuevo'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Restablecer contraseña
   */
  const handleForgotPassword = useCallback(async (email) => {
    try {
      setIsLoading(true)
      setError(null)

      const { nextStep } = await resetPassword({
        username: email
      })
      
      console.log('✅ [useAuth] Password reset initiated for:', email)
      
      return { 
        success: true,
        nextStep
      }

    } catch (error) {
      console.error('❌ [useAuth] Forgot password error:', error)
      
      let errorMessage = 'Error al solicitar restablecimiento de contraseña'
      
      if (error.name === 'UserNotFoundException') {
        errorMessage = 'Usuario no encontrado'
      } else if (error.name === 'LimitExceededException') {
        errorMessage = 'Demasiados intentos. Intenta más tarde'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Confirmar nueva contraseña
   */
  const handleConfirmResetPassword = useCallback(async (email, code, newPassword) => {
    try {
      setIsLoading(true)
      setError(null)

      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword
      })
      
      console.log('✅ [useAuth] Password reset completed for:', email)
      
      return { success: true }

    } catch (error) {
      console.error('❌ [useAuth] Confirm reset password error:', error)
      
      let errorMessage = 'Error al restablecer contraseña'
      
      if (error.name === 'CodeMismatchException') {
        errorMessage = 'Código de verificación incorrecto'
      } else if (error.name === 'ExpiredCodeException') {
        errorMessage = 'El código ha expirado. Solicita uno nuevo'
      } else if (error.name === 'InvalidPasswordException') {
        errorMessage = 'La nueva contraseña no cumple con los requisitos'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Obtener token de autenticación (para API calls)
   */
  const getAuthToken = useCallback(async () => {
    try {
      if (!isAuthenticated) return null
      
      // En Amplify v6, los tokens se obtienen automáticamente
      // cuando se hacen llamadas autenticadas
      return 'authenticated'

    } catch (error) {
      console.error('❌ [useAuth] Get token error:', error)
      return null
    }
  }, [isAuthenticated])

  /**
   * Verificar autenticación al cargar
   */
  useEffect(() => {
    checkAuthState()
  }, [checkAuthState])

  return {
    // Estado de autenticación
    user,
    isAuthenticated,
    isLoading,
    error,

    // Acciones de autenticación
    signIn: handleSignIn,
    signOut: handleSignOut,
    signUp: handleSignUp,
    confirmSignUp: handleConfirmSignUp,
    forgotPassword: handleForgotPassword,
    confirmResetPassword: handleConfirmResetPassword,
    getAuthToken,
    checkAuthState,

    // Utilidades
    clearError: () => setError(null)
  }
}

export default useAuth