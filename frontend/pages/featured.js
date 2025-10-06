import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Header from '../components/Header'
import Footer from '../components/Footer'
import BlogCard from '../components/BlogCard'
import { blogAPI } from '../utils/api'
import { Loader2 } from 'lucide-react'

const FeaturedArticlesPage = () => {
  const [featuredBlogs, setFeaturedBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchFeaturedBlogs()
  }, [])

  const fetchFeaturedBlogs = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await blogAPI.getBlogs({ featured: true })
      setFeaturedBlogs(response.blogs || [])
    } catch (err) {
      setError('Failed to load featured articles. Please try again later.')
      console.error('Error fetching featured blogs:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>Featured Articles - Boganto</title>
        </Head>
        <Header />
        <main>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
              <p className="text-navy-600">Loading featured articles...</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Featured Articles - Boganto</title>
        </Head>
        <Header />
        <main>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-navy-800 mb-4">Something went wrong</h2>
              <p className="text-navy-600 mb-6">{error}</p>
              <button
                onClick={fetchFeaturedBlogs}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }
  return (
    <>
      <Head>
        <title>{`Featured Articles - Boganto`}</title>
        <meta name="description" content="Discover our featured articles and handpicked content on Boganto." />
        <meta property="og:title" content="Featured Articles - Boganto" />
        <meta property="og:description" content="Discover our featured articles and handpicked content on Boganto." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://boganto.com/featured" />
      </Head>

      <Header />
      <main>
        <div className="min-h-screen bg-gray-50">
          {/* Page Header */}
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-navy-800 mb-4">Featured Articles</h1>
                <p className="text-xl text-navy-600 max-w-2xl mx-auto">
                  Discover our handpicked selection of the most engaging and insightful articles from our collection.
                </p>
              </div>
            </div>
          </div>

          {/* Articles Grid */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {featuredBlogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredBlogs.map((blog) => (
                  <BlogCard key={blog.id} blog={blog} featured={true} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h2 className="text-2xl font-semibold text-navy-700 mb-4">No featured articles yet</h2>
                <p className="text-navy-500 mb-6">
                  Check back soon for our latest featured content.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}



export default FeaturedArticlesPage