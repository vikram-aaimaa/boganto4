
import React, { useState, useEffect } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { categoryAPI } from '../utils/api'

const CategoryFilter = ({ onCategorySelect, selectedCategory }) => {
  const [categories, setCategories] = useState([])
  const [showAll, setShowAll] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Number of categories to show initially
  const INITIAL_CATEGORIES_COUNT = 4

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await categoryAPI.getCategories()
      setCategories(response.categories || [])
    } catch (err) { 
      setError('Failed to load categories')
      console.error('Error fetching categories:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryClick = (category) => {
    if (selectedCategory === category.slug) {
      // Deselect if clicking the same category
      onCategorySelect(null)
    } else {
      onCategorySelect(category.slug)
    }
  }

  const handleClearFilter = () => {
    onCategorySelect(null)
  }

  const handleSeeMore = () => {
    setShowAll(!showAll)
  }

  const displayCategories = showAll 
    ? categories 
    : categories.slice(0, INITIAL_CATEGORIES_COUNT)

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-navy-800 mb-4">Filter By: Categories</h3>
        <div className="space-y-2">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-8 bg-gray-200 animate-pulse rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-navy-800 mb-4">Filter By: Categories</h3>
        <p className="text-red-500 text-sm">{error}</p>
        <button 
          onClick={fetchCategories}
          className="mt-2 text-primary-500 text-sm hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-navy-800">Browse by Category</h3>
        {selectedCategory && (
          <button
            onClick={handleClearFilter}
            className="text-primary-500 hover:text-primary-600 text-sm flex items-center bg-primary-50 px-3 py-1 rounded-full"
          >
            <X className="h-4 w-4 mr-1" />
            Clear Filter
          </button>
        )}
      </div>

      {/* Categories Grid */}
      <div className={`space-y-2 ${showAll ? 'max-h-96 overflow-y-auto category-scroll' : ''}`}>
        {displayCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category)}
            className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-between group ${
              selectedCategory === category.slug
                ? 'bg-primary-500 text-white'
                : 'bg-gray-50 text-navy-700 hover:bg-primary-50 hover:text-primary-700'
            }`}
          >
            <span className="font-medium">{category.name}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              selectedCategory === category.slug
                ? 'bg-white bg-opacity-20 text-white'
                : 'bg-navy-100 text-navy-600 group-hover:bg-primary-100 group-hover:text-primary-700'
            }`}>
              {category.blog_count}
            </span>
          </button>
        ))}
      </div>

      {/* See More/Less Button */}
      {categories.length > INITIAL_CATEGORIES_COUNT && (
        <button
          onClick={handleSeeMore}
          className="w-full mt-4 px-4 py-2 text-primary-500 hover:text-primary-600 border border-primary-200 hover:border-primary-300 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          <span className="mr-2">{showAll ? 'See Less' : 'See More'}</span>
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showAll ? 'rotate-180' : ''}`} />
        </button>
      )}
    </div>
  )
}

export default CategoryFilter