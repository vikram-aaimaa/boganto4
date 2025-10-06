import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { TrendingUp, Clock } from 'lucide-react'
import { blogAPI, utils } from '../utils/api'

const Sidebar = () => {
  const [latestBlogs, setLatestBlogs] = useState([])
  const [popularBlogs, setPopularBlogs] = useState([])
  const [showMoreLatest, setShowMoreLatest] = useState(false)
  const [showMorePopular, setShowMorePopular] = useState(false)
  const [loading, setLoading] = useState(true)

  const INITIAL_COUNT = 4
  const LOAD_MORE_COUNT = 3

  useEffect(() => {
    fetchSidebarData()
  }, [])

  const fetchSidebarData = async () => {
    try {
      setLoading(true)
      
      // Fetch latest blogs
      const latestResponse = await blogAPI.getBlogs({
        limit: INITIAL_COUNT + LOAD_MORE_COUNT,
        offset: 0
      })
      
      // Fetch popular blogs (simulated by view_count or featured status)
      const popularResponse = await blogAPI.getBlogs({
        featured: true,
        limit: INITIAL_COUNT + LOAD_MORE_COUNT,
        offset: 0
      })
      
      setLatestBlogs(latestResponse.blogs || [])
      setPopularBlogs(popularResponse.blogs || [])
    } catch (error) {
      console.error('Error fetching sidebar data:', error)
    } finally {
      setLoading(false)
    }
  }

  const displayLatest = showMoreLatest 
    ? latestBlogs 
    : latestBlogs.slice(0, INITIAL_COUNT)

  const displayPopular = showMorePopular 
    ? popularBlogs 
    : popularBlogs.slice(0, INITIAL_COUNT)

  const SidebarBlogItem = ({ blog, isPopular = false }) => {
    const getImageUrl = (img) =>
      img ? `http://localhost:8000/uploads/${img.replace(/^.*[\\/]/, '')}` : ''
    return (
      <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
        <div className="flex-shrink-0">
          {blog.featured_image ? (
            <img
              src={getImageUrl(blog.featured_image)}
              alt={blog.title}
              className="w-16 h-16 object-cover rounded-lg"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">📚</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-navy-800 leading-tight mb-1 hover:text-primary-600 transition-colors duration-200">
            <Link href={`/blog/${blog.slug}`} className="line-clamp-2">
              {blog.title}
            </Link>
          </h4>
          <p className="text-xs text-navy-500 mb-2">
            {utils.formatDate(blog.created_at)}
          </p>
          <div className="flex items-center text-xs text-navy-400">
            <span>{blog.view_count || 0} views</span>
            {isPopular && blog.is_featured && (
              <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-600 rounded-full text-xs">
                Featured
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Latest Articles Loading */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="h-6 bg-gray-200 animate-pulse rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-16 h-16 bg-gray-200 animate-pulse rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-3 bg-gray-200 animate-pulse rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 animate-pulse rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Latest Articles */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-navy-800 mb-6 flex items-center">
          <Clock className="h-5 w-5 mr-2 text-primary-500" />
          Latest Articles
        </h3>
        
        <div className="space-y-1">
          {displayLatest.map((blog) => (
            <SidebarBlogItem key={blog.id} blog={blog} />
          ))}
        </div>

        {latestBlogs.length > INITIAL_COUNT && (
          <button
            onClick={() => setShowMoreLatest(!showMoreLatest)}
            className="w-full mt-4 px-4 py-2 text-primary-500 hover:text-primary-600 border border-primary-200 hover:border-primary-300 rounded-lg transition-colors duration-200 text-sm"
          >
            {showMoreLatest ? 'See Less' : `See More (${latestBlogs.length - INITIAL_COUNT})`}
          </button>
        )}
      </div>

      {/* Popular Articles */}
      {popularBlogs.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-navy-800 mb-6 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary-500" />
            Popular Articles
          </h3>
          
          <div className="space-y-1">
            {displayPopular.map((blog) => (
              <SidebarBlogItem key={blog.id} blog={blog} isPopular={true} />
            ))}
          </div>

          {popularBlogs.length > INITIAL_COUNT && (
            <button
              onClick={() => setShowMorePopular(!showMorePopular)}
              className="w-full mt-4 px-4 py-2 text-primary-500 hover:text-primary-600 border border-primary-200 hover:border-primary-300 rounded-lg transition-colors duration-200 text-sm"
            >
              {showMorePopular ? 'See Less' : `See More (${popularBlogs.length - INITIAL_COUNT})`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default Sidebar