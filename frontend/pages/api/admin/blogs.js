// API proxy for admin blogs with proper cookie forwarding and form handling
import axios from 'axios'
import formidable from 'formidable'
import FormData from 'form-data'
import fs from 'fs'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

export default async function handler(req, res) {
  try {
    // Forward cookies from the request
    const cookies = req.headers.cookie || ''
    
    let requestData = req.body
    let requestHeaders = {
      'Cookie': cookies
    }

    // Handle multipart form data for file uploads
    if (req.headers['content-type']?.startsWith('multipart/form-data')) {
      const form = formidable()
      const [fields, files] = await form.parse(req)
      
      const formData = new FormData()
      
      // Add fields to FormData
      Object.keys(fields).forEach(key => {
        const value = Array.isArray(fields[key]) ? fields[key][0] : fields[key]
        formData.append(key, value)
      })
      
      // Add files to FormData
      Object.keys(files).forEach(key => {
        const file = Array.isArray(files[key]) ? files[key][0] : files[key]
        if (file && file.filepath) {
          formData.append(key, fs.createReadStream(file.filepath), {
            filename: file.originalFilename,
            contentType: file.mimetype
          })
        }
      })
      
      requestData = formData
      requestHeaders = {
        ...formData.getHeaders(),
        'Cookie': cookies
      }
    } else {
      // Handle JSON data
      requestHeaders['Content-Type'] = req.headers['content-type'] || 'application/json'
    }
    
    // Build URL with query parameters
    let url = `${BACKEND_URL}/api/admin/blogs`
    if (req.url?.includes('?')) {
      url += '?' + req.url.split('?')[1]
    }
    
    // Forward the request to the backend
    const backendResponse = await axios({
      method: req.method,
      url,
      headers: requestHeaders,
      data: requestData,
      withCredentials: true,
      validateStatus: () => true, // Don't throw on HTTP errors
      maxBodyLength: Infinity,
      maxContentLength: Infinity
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
    console.error('Admin blogs API proxy error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Internal proxy error',
      message: error.message 
    })
  }
}

// Disable body parser for multipart form handling
export const config = {
  api: {
    bodyParser: false
  }
}