import axios from 'axios'

// Authentication API functions
export const authAPI = {
  // Login
  login: async (credentials) => {
    try {
      const response = await axios.post('/api/auth/login', credentials, {
        withCredentials: true
      })
      return response.data
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Login failed' }
    }
  },

  // Check login status
  checkStatus: async () => {
    try {
      const response = await axios.get('/api/auth/login', {
        withCredentials: true
      })
      return response.data
    } catch (error) {
      return { success: false, logged_in: false }
    }
  },

  // Logout
  logout: async () => {
    try {
      const response = await axios.delete('/api/auth/login', {
        withCredentials: true
      })
      return response.data
    } catch (error) {
      return { success: true } // Even if request fails, consider logout successful
    }
  }
}

// Auth state management
export class AuthManager {
  constructor() {
    this.listeners = []
    this.user = null
    this.isAuthenticated = false
  }

  // Subscribe to auth state changes
  subscribe(callback) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback)
    }
  }

  // Notify all listeners of state changes
  notify() {
    this.listeners.forEach(callback => {
      callback({
        isAuthenticated: this.isAuthenticated,
        user: this.user
      })
    })
  }

  // Set user and auth state
  setUser(user) {
    this.user = user
    this.isAuthenticated = !!user
    this.notify()
  }

  // Clear user and auth state
  clearUser() {
    this.user = null
    this.isAuthenticated = false
    this.notify()
  }

  // Get current auth state
  getState() {
    return {
      isAuthenticated: this.isAuthenticated,
      user: this.user
    }
  }

  // Check if user is authenticated
  async checkAuth() {
    try {
      const response = await authAPI.checkStatus()
      if (response.success && response.logged_in) {
        this.setUser(response.user)
        return true
      } else {
        this.clearUser()
        return false
      }
    } catch (error) {
      this.clearUser()
      return false
    }
  }

  // Login user
  async login(credentials) {
    try {
      const response = await authAPI.login(credentials)
      if (response.success) {
        this.setUser(response.user)
        return { success: true, user: response.user }
      } else {
        return { success: false, message: response.message }
      }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  // Logout user
  async logout() {
    try {
      await authAPI.logout()
      this.clearUser()
      
      // Clear any stored auth data
      localStorage.removeItem('admin_remember')
      
      return { success: true }
    } catch (error) {
      this.clearUser()
      return { success: true } // Always consider logout successful
    }
  }
}

// Create singleton instance
export const authManager = new AuthManager()

// Utility functions
export const isAuthenticated = () => authManager.isAuthenticated
export const getCurrentUser = () => authManager.user
export const checkAuthStatus = () => authManager.checkAuth()