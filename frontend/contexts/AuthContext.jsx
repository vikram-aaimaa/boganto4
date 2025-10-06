import React, { createContext, useContext, useEffect, useState } from 'react'
import { authManager } from '../utils/auth'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    // During SSG/SSR, return default values instead of throwing
    if (typeof window === 'undefined') {
      return {
        isAuthenticated: false,
        user: null,
        loading: false,
        login: () => Promise.resolve({ success: false }),
        logout: () => Promise.resolve({ success: true }),
        checkAuth: () => Promise.resolve(false)
      }
    }
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    loading: true
  })

  // Initialize auth state on mount
  useEffect(() => {
    let isMounted = true

    const initializeAuth = async () => {
      try {
        const isAuth = await authManager.checkAuth()
        if (isMounted) {
          setAuthState({
            isAuthenticated: isAuth,
            user: authManager.user,
            loading: false
          })
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (isMounted) {
          setAuthState({
            isAuthenticated: false,
            user: null,
            loading: false
          })
        }
      }
    }

    initializeAuth()

    return () => {
      isMounted = false
    }
  }, [])

  // Subscribe to auth manager updates
  useEffect(() => {
    const unsubscribe = authManager.subscribe((newState) => {
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: newState.isAuthenticated,
        user: newState.user
      }))
    })

    return unsubscribe
  }, [])

  const login = async (credentials) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }))
      const result = await authManager.login(credentials)
      
      setAuthState(prev => ({
        ...prev,
        loading: false
      }))

      return result
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }))
      return { success: false, message: error.message }
    }
  }

  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }))
      const result = await authManager.logout()
      
      setAuthState(prev => ({
        ...prev,
        loading: false
      }))

      return result
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }))
      return { success: true } // Always consider logout successful
    }
  }

  const checkAuth = async () => {
    try {
      const isAuth = await authManager.checkAuth()
      return isAuth
    } catch (error) {
      console.error('Auth check error:', error)
      return false
    }
  }

  const value = {
    // State
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    loading: authState.loading,
    
    // Actions
    login,
    logout,
    checkAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext