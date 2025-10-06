// API proxy for authentication with proper cookie forwarding
import axios from 'axios'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

export default async function handler(req, res) {
  try {
    // Forward cookies from the request
    const cookies = req.headers.cookie || ''
    
    // Set up headers for the backend request
    const headers = {
      'Content-Type': req.headers['content-type'] || 'application/json',
      'Cookie': cookies
    }
    
    // Forward the request to the backend
    const backendResponse = await axios({
      method: req.method,
      url: `${BACKEND_URL}/api/auth/login`,
      headers,
      data: req.body,
      withCredentials: true,
      validateStatus: () => true // Don't throw on HTTP errors
    })
    
    // Forward response headers (especially Set-Cookie)
    Object.keys(backendResponse.headers).forEach(key => {
      if (key.toLowerCase() === 'set-cookie') {
        res.setHeader(key, backendResponse.headers[key])
      }
    })
    
    // Set response status and data
    res.status(backendResponse.status).json(backendResponse.data)
    
  } catch (error) {
    console.error('Auth API proxy error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Internal proxy error',
      message: error.message 
    })
  }
}