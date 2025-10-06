// API proxy for blog by ID
import axios from 'axios'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

export default async function handler(req, res) {
  const { id } = req.query

  // Only handle GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  if (!id) {
    return res.status(400).json({ success: false, error: 'ID parameter is required' })
  }

  try {
    // Forward cookies from the request
    const cookies = req.headers.cookie || ''
    
    // Set up headers for the backend request
    const headers = {
      'Content-Type': 'application/json',
      'Cookie': cookies
    }
    
    // Build the URL for the backend API
    const url = `${BACKEND_URL}/api/blogs/${encodeURIComponent(id)}`
    
    console.log('Forwarding ID request to backend:', url)
    
    // Forward the request to the backend
    const backendResponse = await axios({
      method: 'GET',
      url,
      headers,
      withCredentials: true,
      validateStatus: () => true // Don't throw on HTTP errors
    })
    
    console.log('Backend response status:', backendResponse.status)
    console.log('Backend response data:', backendResponse.data)
    
    // Forward response headers (especially Set-Cookie)
    Object.keys(backendResponse.headers).forEach(key => {
      if (key.toLowerCase() === 'set-cookie') {
        res.setHeader(key, backendResponse.headers[key])
      }
    })
    
    // Set response status and data
    res.status(backendResponse.status).json(backendResponse.data)
    
  } catch (error) {
    console.error('Blog ID API proxy error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Internal proxy error',
      message: error.message 
    })
  }
}