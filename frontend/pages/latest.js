import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Header from '../components/Header'
import Footer from '../components/Footer'
import BlogCard from '../components/BlogCard'
import { blogAPI } from '../utils/api'
import { Loader2 } from 'lucide-react'

const LatestArticlesPage = () => {
  const [latestBlogs, setLatestBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchLatestBlogs()
  }, [])

  const fetchLatestBlogs = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await blogAPI.getBlogs({ sort: 'latest' })
      setLatestBlogs(response.blogs || [])
    } catch (err) {
      setError('Failed to load latest articles. Please try again later.')
      console.error('Error fetching latest blogs:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>Latest Articles - Boganto</title>
        </Head>
        <Header />
        <main>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
              <p className="text-navy-600">Loading latest articles...</p>
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
          <title>Latest Articles - Boganto</title>
        </Head>
        <Header />
        <main>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-navy-800 mb-4">Something went wrong</h2>
              <p className="text-navy-600 mb-6">{error}</p>
              <button
                onClick={fetchLatestBlogs}
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
        <title>Latest Articles - Boganto</title>
        <meta name="description" content="Stay up to date with the latest articles and insights on Boganto." />
        <meta property="og:title" content="Latest Articles - Boganto" />
        <meta property="og:description" content="Stay up to date with the latest articles and insights on Boganto." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://boganto.com/latest" />
      </Head>

      <Header />
      <main>
        <div className="min-h-screen bg-gray-50">
          {/* Page Header */}
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-navy-800 mb-4">Latest Articles</h1>
                <p className="text-xl text-navy-600 max-w-2xl mx-auto">
                  Stay up to date with our newest content and latest insights from the world of literature.
                </p>
              </div>
            </div>
          </div>

          {/* Articles Grid */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {latestBlogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {latestBlogs.map((blog) => (
                  <BlogCard key={blog.id} blog={blog} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h2 className="text-2xl font-semibold text-navy-700 mb-4">No articles yet</h2>
                <p className="text-navy-500 mb-6">
                  Check back soon for our latest content.
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



export default LatestArticlesPage