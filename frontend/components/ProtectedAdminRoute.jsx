import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import AdminLogin from '../pages/AdminLogin'
import AdminPanel from '../pages/AdminPanel'

const ProtectedAdminRoute = () => {
  const { isAuthenticated, user, loading, login } = useAuth()

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
          <h2 className="text-xl font-semibold text-navy-800 mb-2">Loading...</h2>
          <p className="text-navy-600">Checking authentication status</p>
        </div>
      </div>
    )
  }

  // Handle login success
  const handleLoginSuccess = (userData) => {
    // The auth context will automatically update the state
    console.log('Login successful:', userData)
  }

  // If not authenticated, show login form
  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />
  }

  // If authenticated, show admin panel
  return <AdminPanel />
}

export default ProtectedAdminRoute