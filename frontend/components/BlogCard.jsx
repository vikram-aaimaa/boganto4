import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Eye, Tag } from 'lucide-react'
import { utils } from '../utils/api'

const DEFAULT_IMAGES = {
  ARTICLE_THUMBNAIL: '/uploads/1758801057_book-419589_640.jpg'
}

const BlogCard = ({ blog, featured = false }) => {

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:-translate-y-1">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        {blog.featured_image ? (
          <Image
            src={utils.getImageUrl(blog.featured_image)}
            alt={blog.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.onerror = null;
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
            <span className="text-white text-3xl font-bold">📚</span>
          </div>
        )}
        {/* Featured Badge */}
        {blog.is_featured && (
          <div className="absolute top-3 left-3">
            <span className="bg-primary-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
              Featured
            </span>
          </div>
        )}
        {/* Category Badge */}
        {blog.category && (
          <div className="absolute top-3 right-3">
            <Link href={`/category/${blog.category.slug}`}>
              <span className="bg-white text-navy-800 px-2.5 py-1 rounded-full text-xs font-semibold hover:bg-gray-50 transition-colors shadow-lg">
                {blog.category.name}
              </span>
            </Link>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm text-navy-500 mb-3">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1.5" />
            <span className="font-medium">{utils.formatDate ? utils.formatDate(blog.created_at) : new Date(blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
          <div className="flex items-center">
            <Eye className="h-4 w-4 mr-1" />
            <span>{blog.view_count || 0}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className={`font-bold text-navy-800 mb-3 leading-tight group-hover:text-primary-600 transition-colors duration-300 line-clamp-2 ${
          featured ? 'text-xl' : 'text-lg'
        }`}>
          <Link href={`/blog/${blog.slug}`}>
            {blog.title}
          </Link>
        </h3>

        {/* Excerpt */}
        <p className="text-navy-600 leading-relaxed line-clamp-2 mb-4">
          {blog.excerpt || (utils.generateExcerpt ? utils.generateExcerpt(blog.content) : (blog.content ? blog.content.substring(0, 100) + '...' : 'Discover more in this article...'))}
        </p>

        {/* Read More Link */}
        <Link
          href={`/blog/${blog.slug}`}
          className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold group/link transition-colors duration-200"
        >
          {featured ? 'Read Article' : 'Continue Reading'}
          <svg className="w-4 h-4 ml-2 transform group-hover/link:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  )
}

export default BlogCard