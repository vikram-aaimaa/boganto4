import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'
import { 
  Menu, 
  Home, 
  FileText, 
  Settings, 
  Users, 
  Tags,
  Image,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

const AdminPanel = () => {
  const { user, logout } = useAuth()
  const router = useRouter()

  // Navigation state
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState('dashboard')

  // Blog management state
  const [blogs, setBlogs] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingBlog, setEditingBlog] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Hero Banner management state
  const [banners, setBanners] = useState([])
  const [showBannerForm, setShowBannerForm] = useState(false)
  const [editingBanner, setEditingBanner] = useState(null)
  const [bannerFormData, setBannerFormData] = useState({
    title: '',
    subtitle: '',
    blog_id: '',
    banner_image: null,
    sort_order: 0,
    is_active: true
  })
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    category_id: '',
    tags: '',
    meta_title: '',
    meta_description: '',
    status: 'draft',
    is_featured: false,
    featured_image: null,
    featured_image_2: null,
    related_books: []
  })

  // Related books state
  const [relatedBooks, setRelatedBooks] = useState([])

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
  }

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/admin')
    }
  }, [user, router])

  // Load initial data
  useEffect(() => {
    if (user) {
      fetchCategories()
      if (activeSection === 'blogs') {
        fetchBlogs()
      } else if (activeSection === 'banners') {
        fetchBanners()
      }
    }
  }, [user, activeSection, currentPage, searchTerm, statusFilter])

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories', {
        withCredentials: true
      })
      setCategories(response.data.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      showToast('Failed to load categories', 'error')
    }
  }

  const fetchBlogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter === 'all' ? '' : statusFilter
      })

      const response = await axios.get(`/api/blogs?${params}`, {
        withCredentials: true
      })
      setBlogs(response.data.blogs || [])
      setTotalPages(Math.ceil((response.data.total || 0) / 10))
    } catch (error) {
      console.error('Error fetching blogs:', error)
      showToast('Failed to load blogs', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchBanners = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/admin/banners', {
        withCredentials: true
      })
      setBanners(response.data.banners || [])
    } catch (error) {
      console.error('Error fetching banners:', error)
      showToast('Failed to load banners', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/admin')
  }

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      category_id: '',
      tags: '',
      meta_title: '',
      meta_description: '',
      status: 'draft',
      is_featured: false,
      featured_image: null,
      featured_image_2: null,
      related_books: []
    })
    setRelatedBooks([])
    setEditingBlog(null)
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target
    
    if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] }))
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
      
      // Auto-generate slug from title
      if (name === 'title' && value) {
        const slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
        setFormData(prev => ({ ...prev, slug }))
      }
    }
  }

  const addRelatedBook = () => {
    setRelatedBooks([...relatedBooks, { title: '', author: '', purchase_link: '', cover_image: null, description: '', price: '' }])
  }

  const updateRelatedBook = (index, field, value) => {
    const updated = [...relatedBooks]
    updated[index] = { ...updated[index], [field]: value }
    setRelatedBooks(updated)
  }

  const updateRelatedBookFile = (index, field, file) => {
    const updated = [...relatedBooks]
    updated[index] = { ...updated[index], [field]: file }
    setRelatedBooks(updated)
  }

  const removeRelatedBook = (index) => {
    setRelatedBooks(relatedBooks.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formPayload = new FormData()
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if ((key === 'featured_image' || key === 'featured_image_2') && formData[key]) {
          formPayload.append(key, formData[key])
        } else if (key !== 'featured_image' && key !== 'featured_image_2' && key !== 'related_books') {
          formPayload.append(key, formData[key])
        }
      })

      // Add related books and their cover images
      if (relatedBooks.length > 0) {
        // Add related books data without cover_image files
        const booksData = relatedBooks.map(book => {
          const { cover_image, ...bookData } = book
          return bookData
        })
        formPayload.append('related_books', JSON.stringify(booksData))
        
        // Add cover image files separately
        relatedBooks.forEach((book, index) => {
          if (book.cover_image && book.cover_image instanceof File) {
            formPayload.append(`book_cover_${index}`, book.cover_image)
          }
        })
      }

      let response
      if (editingBlog) {
        // Update existing blog
        formPayload.append('id', editingBlog.id)
        response = await axios.put('/api/admin/blogs', formPayload, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        })
      } else {
        // Create new blog
        response = await axios.post('/api/admin/blogs', formPayload, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        })
      }

      showToast(editingBlog ? 'Blog updated successfully!' : 'Blog created successfully!')
      resetForm()
      setShowForm(false)
      fetchBlogs()
      
    } catch (error) {
      console.error('Error saving blog:', error)
      showToast(error.response?.data?.error || 'Failed to save blog', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (blog) => {
    setEditingBlog(blog)
    setFormData({
      title: blog.title || '',
      slug: blog.slug || '',
      content: blog.content || '',
      excerpt: blog.excerpt || '',
      category_id: blog.category_id || '',
      tags: blog.tags || '',
      meta_title: blog.meta_title || '',
      meta_description: blog.meta_description || '',
      status: blog.status || 'draft',
      is_featured: blog.is_featured || false,
      featured_image: null,
      featured_image_2: null,
      related_books: []
    })
    
    // Load related books for editing
    if (blog.related_books) {
      const formattedBooks = blog.related_books.map(book => ({
        ...book,
        cover_image: null, // Reset file input for editing
        cover_image_url: book.cover_image // Store existing image URL for preview
      }))
      setRelatedBooks(formattedBooks)
    }
    
    setShowForm(true)
  }

  const handleDelete = async (blogId) => {
    if (!confirm('Are you sure you want to delete this blog?')) return

    try {
      await axios.delete(`/api/admin/blogs?id=${blogId}`, {
        withCredentials: true
      })
      showToast('Blog deleted successfully!')
      fetchBlogs()
    } catch (error) {
      console.error('Error deleting blog:', error)
      showToast('Failed to delete blog', 'error')
    }
  }

  const resetBannerForm = () => {
    setBannerFormData({
      title: '',
      subtitle: '',
      blog_id: '',
      banner_image: null,
      sort_order: 0,
      is_active: true
    })
    setEditingBanner(null)
  }

  const handleBannerInputChange = (e) => {
    const { name, value, type, checked, files } = e.target
    
    if (type === 'file') {
      setBannerFormData(prev => ({ ...prev, [name]: files[0] }))
    } else if (type === 'checkbox') {
      setBannerFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setBannerFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleBannerSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formPayload = new FormData()
      
      // Add all form fields
      Object.keys(bannerFormData).forEach(key => {
        if (key === 'banner_image' && bannerFormData[key]) {
          formPayload.append(key, bannerFormData[key])
        } else if (key !== 'banner_image') {
          formPayload.append(key, bannerFormData[key])
        }
      })

      let response
      if (editingBanner) {
        // Update existing banner
        formPayload.append('id', editingBanner.id)
        response = await axios.put('/api/admin/banners', formPayload, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        })
      } else {
        // Create new banner
        response = await axios.post('/api/admin/banners', formPayload, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        })
      }

      showToast(editingBanner ? 'Banner updated successfully!' : 'Banner created successfully!')
      resetBannerForm()
      setShowBannerForm(false)
      fetchBanners()
      
    } catch (error) {
      console.error('Error saving banner:', error)
      showToast(error.response?.data?.error || 'Failed to save banner', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleEditBanner = (banner) => {
    setEditingBanner(banner)
    setBannerFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      blog_id: banner.blog_id || '',
      banner_image: null,
      sort_order: banner.sort_order || 0,
      is_active: banner.is_active !== undefined ? banner.is_active : true
    })
    setShowBannerForm(true)
  }

  const handleDeleteBanner = async (bannerId) => {
    if (!confirm('Are you sure you want to delete this banner?')) return

    try {
      await axios.delete(`/api/admin/banners?id=${bannerId}`, {
        withCredentials: true
      })
      showToast('Banner deleted successfully!')
      fetchBanners()
    } catch (error) {
      console.error('Error deleting banner:', error)
      showToast('Failed to delete banner', 'error')
    }
  }

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'blogs', label: 'Blog Management', icon: FileText },
    { id: 'banners', label: 'Hero Banners', icon: Image },
    { id: 'categories', label: 'Categories', icon: Tags },
    { id: 'media', label: 'Media Library', icon: Image },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  if (!user) {
    return (
      <>
        <Head>
          <title>Loading... - Admin Panel</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Admin Panel - Boganto</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <div className={`bg-white shadow-lg transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'}`}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                {sidebarOpen && (
                  <div className="ml-3">
                    <h1 className="text-lg font-bold text-slate-800">Boganto</h1>
                    <p className="text-xs text-slate-500">Admin Panel</p>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                {sidebarItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                          activeSection === item.id
                            ? 'bg-orange-100 text-orange-600 border border-orange-200'
                            : 'text-slate-600 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {sidebarOpen && <span className="ml-3 text-sm font-medium">{item.label}</span>}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <header className="bg-white shadow-sm border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-slate-800 capitalize">
                    {activeSection === 'blogs' ? 'Blog Management' : 
                     activeSection === 'banners' ? 'Hero Banners' : activeSection}
                  </h1>
                  <p className="text-sm text-slate-500">
                    {activeSection === 'dashboard' && 'Overview of your blog statistics'}
                    {activeSection === 'blogs' && 'Create, edit, and manage your blog posts'}
                    {activeSection === 'banners' && 'Manage homepage hero banners (max 4 active)'}
                    {activeSection === 'categories' && 'Manage blog categories'}
                    {activeSection === 'media' && 'Upload and manage media files'}
                    {activeSection === 'users' && 'Manage admin users'}
                    {activeSection === 'settings' && 'Configure blog settings'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm text-slate-600">
                  Welcome, <span className="font-medium">{user?.email || 'Admin'}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 p-6">
            {/* Dashboard Section */}
            {activeSection === 'dashboard' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Total Blogs</p>
                      <p className="text-2xl font-bold text-slate-800">{blogs.length}</p>
                    </div>
                    <FileText className="w-8 h-8 text-orange-500" />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Published</p>
                      <p className="text-2xl font-bold text-green-600">
                        {blogs.filter(b => b.status === 'published').length}
                      </p>
                    </div>
                    <Eye className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Drafts</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {blogs.filter(b => b.status === 'draft').length}
                      </p>
                    </div>
                    <Edit className="w-8 h-8 text-yellow-500" />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Categories</p>
                      <p className="text-2xl font-bold text-blue-600">{categories.length}</p>
                    </div>
                    <Tags className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
              </div>
            )}

            {/* Blog Management Section */}
            {activeSection === 'blogs' && (
              <div className="space-y-6">
                {!showForm ? (
                  <>
                    {/* Blog List Header */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="relative">
                            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              placeholder="Search blogs..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                          </div>
                          <div className="relative">
                            <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <select
                              value={statusFilter}
                              onChange={(e) => setStatusFilter(e.target.value)}
                              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            >
                              <option value="all">All Status</option>
                              <option value="published">Published</option>
                              <option value="draft">Draft</option>
                              <option value="archived">Archived</option>
                            </select>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => setShowForm(true)}
                          className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Create New Blog</span>
                        </button>
                      </div>
                    </div>

                    {/* Blog List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      {loading ? (
                        <div className="p-8 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                          <p className="text-slate-600">Loading blogs...</p>
                        </div>
                      ) : (
                        <>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Title
                                  </th>
                                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category
                                  </th>
                                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                  </th>
                                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Featured
                                  </th>
                                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created
                                  </th>
                                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {blogs.map((blog) => (
                                  <tr key={blog.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                      <div>
                                        <p className="font-medium text-slate-800 truncate max-w-xs">
                                          {blog.title}
                                        </p>
                                        <p className="text-sm text-slate-500 truncate max-w-xs">
                                          {blog.excerpt}
                                        </p>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                        {blog.category_name || 'Uncategorized'}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4">
                                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        blog.status === 'published' 
                                          ? 'bg-green-100 text-green-800'
                                          : blog.status === 'draft'
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : 'bg-gray-100 text-gray-800'
                                      }`}>
                                        {blog.status}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4">
                                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        blog.is_featured 
                                          ? 'bg-orange-100 text-orange-800' 
                                          : 'bg-gray-100 text-gray-800'
                                      }`}>
                                        {blog.is_featured ? 'Yes' : 'No'}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                      {new Date(blog.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex space-x-2">
                                        <button
                                          onClick={() => window.open(`/blog/${blog.slug}`, '_blank')}
                                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                        >
                                          <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => handleEdit(blog)}
                                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                                        >
                                          <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => handleDelete(blog.id)}
                                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Pagination */}
                          {totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                              <div className="text-sm text-slate-600">
                                Page {currentPage} of {totalPages}
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                  disabled={currentPage === 1}
                                  className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                  disabled={currentPage === totalPages}
                                  className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  /* Blog Form */
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-slate-800">
                        {editingBlog ? 'Edit Blog' : 'Create New Blog'}
                      </h2>
                      <button
                        onClick={() => {
                          setShowForm(false)
                          resetForm()
                        }}
                        className="px-4 py-2 text-slate-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Title and Slug */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Title *
                          </label>
                          <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Slug (URL)
                          </label>
                          <input
                            type="text"
                            name="slug"
                            value={formData.slug}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                      </div>

                      {/* Content */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Content *
                        </label>
                        <textarea
                          name="content"
                          value={formData.content}
                          onChange={handleInputChange}
                          required
                          rows={10}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Write your blog content here..."
                        />
                      </div>

                      {/* Category and Tags */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Category *
                          </label>
                          <select
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          >
                            <option value="">Select a category</option>
                            {categories.map(category => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Tags (comma separated)
                          </label>
                          <input
                            type="text"
                            name="tags"
                            value={formData.tags}
                            onChange={handleInputChange}
                            placeholder="tag1, tag2, tag3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                      </div>

                      {/* Featured Images */}
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Featured Image 1 */}
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Featured Image 1
                            </label>
                            <input
                              type="file"
                              name="featured_image"
                              accept="image/*"
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                            {/* Preview for existing image or newly selected image */}
                            {(editingBlog?.featured_image || formData.featured_image) && (
                              <div className="mt-2">
                                <div className="text-xs text-slate-500 mb-1">Current Image:</div>
                                <img
                                  src={formData.featured_image ? URL.createObjectURL(formData.featured_image) : editingBlog?.featured_image}
                                  alt="Featured image preview"
                                  className="w-full h-32 object-cover rounded-lg border"
                                  onError={(e) => {
                                    e.target.style.display = 'none'
                                  }}
                                />
                              </div>
                            )}
                          </div>
                          
                          {/* Featured Image 2 */}
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Featured Image 2 (Optional)
                            </label>
                            <input
                              type="file"
                              name="featured_image_2"
                              accept="image/*"
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                            {/* Preview for existing image or newly selected image */}
                            {(editingBlog?.featured_image_2 || formData.featured_image_2) && (
                              <div className="mt-2">
                                <div className="text-xs text-slate-500 mb-1">Current Image:</div>
                                <img
                                  src={formData.featured_image_2 ? URL.createObjectURL(formData.featured_image_2) : editingBlog?.featured_image_2}
                                  alt="Second featured image preview"
                                  className="w-full h-32 object-cover rounded-lg border"
                                  onError={(e) => {
                                    e.target.style.display = 'none'
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Image upload instructions */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-blue-800 mb-2">Image Upload Instructions:</h4>
                          <ul className="text-xs text-blue-700 space-y-1">
                            <li>• <strong>Single Image:</strong> Upload only Featured Image 1 for a large centered display</li>
                            <li>• <strong>Dual Images:</strong> Upload both images for a responsive 2-column grid layout</li>
                            <li>• <strong>Supported formats:</strong> JPG, PNG, WebP (max 5MB each)</li>
                            <li>• <strong>Recommended size:</strong> 1200x800px for optimal display</li>
                          </ul>
                        </div>
                      </div>

                      {/* Excerpt */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Excerpt
                        </label>
                        <textarea
                          name="excerpt"
                          value={formData.excerpt}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Brief description of the blog post..."
                        />
                      </div>

                      {/* Related Books */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <label className="block text-sm font-medium text-slate-700">
                            Related Books
                          </label>
                          <button
                            type="button"
                            onClick={addRelatedBook}
                            className="flex items-center space-x-2 px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add Book</span>
                          </button>
                        </div>
                        
                        {relatedBooks.map((book, index) => (
                          <div key={index} className="p-4 border border-gray-200 rounded-lg mb-4 space-y-4">
                            {/* Book Basic Info Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Book Title *</label>
                                <input
                                  type="text"
                                  placeholder="Book title"
                                  value={book.title || ''}
                                  onChange={(e) => updateRelatedBook(index, 'title', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Author</label>
                                <input
                                  type="text"
                                  placeholder="Author name"
                                  value={book.author || ''}
                                  onChange={(e) => updateRelatedBook(index, 'author', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Price</label>
                                <input
                                  type="text"
                                  placeholder="$19.99"
                                  value={book.price || ''}
                                  onChange={(e) => updateRelatedBook(index, 'price', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                              </div>
                            </div>

                            {/* Purchase Link and Cover Image Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Purchase Link *</label>
                                <input
                                  type="url"
                                  placeholder="https://amazon.com/..."
                                  value={book.purchase_link || ''}
                                  onChange={(e) => updateRelatedBook(index, 'purchase_link', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Cover Image</label>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => updateRelatedBookFile(index, 'cover_image', e.target.files[0])}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                              </div>
                            </div>

                            {/* Description */}
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                              <textarea
                                placeholder="Brief description of the book..."
                                value={book.description || ''}
                                onChange={(e) => updateRelatedBook(index, 'description', e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              />
                            </div>

                            {/* Cover Image Preview */}
                            {(book.cover_image || book.cover_image_url) && (
                              <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Cover Preview</label>
                                <img
                                  src={book.cover_image ? URL.createObjectURL(book.cover_image) : book.cover_image_url}
                                  alt="Book cover preview"
                                  className="w-24 h-32 object-cover rounded border"
                                  onError={(e) => {
                                    e.target.style.display = 'none'
                                  }}
                                />
                              </div>
                            )}

                            {/* Remove Button */}
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => removeRelatedBook(index)}
                                className="flex items-center space-x-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Remove Book</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* SEO Fields */}
                      <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-medium text-slate-800 mb-4">SEO Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Meta Title
                            </label>
                            <input
                              type="text"
                              name="meta_title"
                              value={formData.meta_title}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Meta Description
                            </label>
                            <textarea
                              name="meta_description"
                              value={formData.meta_description}
                              onChange={handleInputChange}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Status and Featured */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-200 pt-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Status
                          </label>
                          <select
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                          </select>
                        </div>
                        <div className="flex items-center mt-8">
                          <input
                            type="checkbox"
                            name="is_featured"
                            checked={formData.is_featured}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                          />
                          <label className="ml-2 text-sm font-medium text-slate-700">
                            Featured Article
                          </label>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="flex justify-end space-x-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowForm(false)
                            resetForm()
                          }}
                          className="px-6 py-2 border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                          <span>{editingBlog ? 'Update Blog' : 'Create Blog'}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* Hero Banner Management Section */}
            {activeSection === 'banners' && (
              <div className="space-y-6">
                {!showBannerForm ? (
                  <>
                    {/* Banner List Header */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        <div className="flex items-center space-x-4">
                          <div className="bg-orange-100 p-2 rounded-lg">
                            <Image className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-slate-800">Hero Banner Management</h3>
                            <p className="text-sm text-slate-600">
                              Current banners: {banners.filter(b => b.is_active).length}/4 active
                            </p>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => setShowBannerForm(true)}
                          disabled={banners.filter(b => b.is_active).length >= 4}
                          className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Hero Banner</span>
                        </button>
                      </div>
                      
                      {banners.filter(b => b.is_active).length >= 4 && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            <strong>Limit Reached:</strong> You have reached the maximum of 4 active banners. 
                            Deactivate or delete an existing banner to add a new one.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Banner List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      {loading ? (
                        <div className="p-8 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                          <p className="text-slate-600">Loading banners...</p>
                        </div>
                      ) : banners.length === 0 ? (
                        <div className="p-8 text-center">
                          <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-slate-800 mb-2">No Banners Yet</h3>
                          <p className="text-slate-600 mb-4">Create your first hero banner to showcase featured content on the homepage.</p>
                          <button
                            onClick={() => setShowBannerForm(true)}
                            className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition mx-auto"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Create First Banner</span>
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                          {banners.map((banner) => (
                            <div key={banner.id} className="border border-gray-200 rounded-lg p-4">
                              {/* Banner Image */}
                              <div className="aspect-video mb-4 bg-gray-100 rounded-lg overflow-hidden">
                                <img
                                  src={banner.image_url}
                                  alt={banner.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src = '/api/placeholder/400/225'
                                  }}
                                />
                              </div>
                              
                              {/* Banner Info */}
                              <div className="space-y-2">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-slate-800 truncate">{banner.title}</h4>
                                    {banner.subtitle && (
                                      <p className="text-sm text-slate-600 truncate">{banner.subtitle}</p>
                                    )}
                                  </div>
                                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    banner.is_active 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {banner.is_active ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                                
                                {banner.blog_title && (
                                  <div className="text-sm text-slate-500">
                                    <span className="font-medium">Links to:</span> {banner.blog_title}
                                  </div>
                                )}
                                
                                <div className="text-xs text-slate-400">
                                  Sort Order: {banner.sort_order} • Created: {new Date(banner.created_at).toLocaleDateString()}
                                </div>
                                
                                {/* Actions */}
                                <div className="flex space-x-2 pt-2 border-t border-gray-100">
                                  <button
                                    onClick={() => handleEditBanner(banner)}
                                    className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                                  >
                                    <Edit className="w-3 h-3" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteBanner(banner.id)}
                                    className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Delete</span>
                                  </button>
                                  {banner.blog_slug && (
                                    <button
                                      onClick={() => window.open(`/blog/${banner.blog_slug}`, '_blank')}
                                      className="flex items-center space-x-1 px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded"
                                    >
                                      <Eye className="w-3 h-3" />
                                      <span>View</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  /* Banner Form */
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-slate-800">
                        {editingBanner ? 'Edit Hero Banner' : 'Create New Hero Banner'}
                      </h2>
                      <button
                        onClick={() => {
                          setShowBannerForm(false)
                          resetBannerForm()
                        }}
                        className="px-4 py-2 text-slate-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>

                    <form onSubmit={handleBannerSubmit} className="space-y-6">
                      {/* Title and Subtitle */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Title *
                          </label>
                          <input
                            type="text"
                            name="title"
                            value={bannerFormData.title}
                            onChange={handleBannerInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Enter banner title"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Subtitle
                          </label>
                          <input
                            type="text"
                            name="subtitle"
                            value={bannerFormData.subtitle}
                            onChange={handleBannerInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Enter banner subtitle (optional)"
                          />
                        </div>
                      </div>

                      {/* Blog Selection and Sort Order */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Linked Blog *
                          </label>
                          <select
                            name="blog_id"
                            value={bannerFormData.blog_id}
                            onChange={handleBannerInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          >
                            <option value="">Select a blog to link</option>
                            {blogs.filter(blog => blog.status === 'published').map(blog => (
                              <option key={blog.id} value={blog.id}>
                                {blog.title}
                              </option>
                            ))}
                          </select>
                          <p className="text-xs text-slate-500 mt-1">
                            Clicking the banner will redirect to the selected blog
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Sort Order
                          </label>
                          <input
                            type="number"
                            name="sort_order"
                            value={bannerFormData.sort_order}
                            onChange={handleBannerInputChange}
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            Lower numbers appear first
                          </p>
                        </div>
                      </div>

                      {/* Banner Image Upload */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Banner Image *
                        </label>
                        <input
                          type="file"
                          name="banner_image"
                          accept="image/*"
                          onChange={handleBannerInputChange}
                          required={!editingBanner}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                        {/* Preview for existing image or newly selected image */}
                        {(editingBanner?.image_url || bannerFormData.banner_image) && (
                          <div className="mt-4">
                            <div className="text-xs text-slate-500 mb-2">Preview:</div>
                            <div className="aspect-video w-full max-w-md bg-gray-100 rounded-lg overflow-hidden">
                              <img
                                src={bannerFormData.banner_image ? URL.createObjectURL(bannerFormData.banner_image) : editingBanner?.image_url}
                                alt="Banner preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                }}
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Upload Guidelines */}
                        <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <h4 className="text-sm font-medium text-blue-800 mb-1">Image Guidelines:</h4>
                          <ul className="text-xs text-blue-700 space-y-0.5">
                            <li>• Recommended size: 1200x675px (16:9 aspect ratio)</li>
                            <li>• Maximum file size: 5MB</li>
                            <li>• Supported formats: JPG, PNG, WebP</li>
                            <li>• Images will be stored locally in /uploads/banners/</li>
                          </ul>
                        </div>
                      </div>

                      {/* Active Status */}
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="is_active"
                          checked={bannerFormData.is_active}
                          onChange={handleBannerInputChange}
                          className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <label className="ml-2 text-sm font-medium text-slate-700">
                          Active Banner (will be displayed on homepage)
                        </label>
                      </div>

                      {/* Submit Button */}
                      <div className="flex justify-end space-x-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowBannerForm(false)
                            resetBannerForm()
                          }}
                          className="px-6 py-2 border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                          <span>{editingBanner ? 'Update Banner' : 'Create Banner'}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* Other Sections Placeholder */}
            {['categories', 'media', 'users', 'settings'].includes(activeSection) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-800 mb-2 capitalize">
                  {activeSection} Management
                </h3>
                <p className="text-slate-600">
                  This section is under development. Coming soon!
                </p>
              </div>
            )}
          </main>
        </div>

        {/* Toast Notification */}
        {toast.show && (
          <div className="fixed top-4 right-4 z-50">
            <div className={`px-6 py-4 rounded-lg shadow-lg ${
              toast.type === 'success' 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}>
              {toast.message}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default AdminPanel