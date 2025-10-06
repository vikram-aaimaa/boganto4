import { useRouter } from 'next/router'
import HomePage from '../index'

// This page reuses the HomePage component but with tag filtering
const TagPage = (props) => {
  return <HomePage {...props} />
}

export async function getServerSideProps({ params, query }) {
  // Import the getStaticProps function from index.js and modify for tag
  const { blogAPI, bannerAPI } = await import('../../utils/api')
  
  try {
    const { tag } = params
    
    // Fetch blogs for the specific tag
    const [blogsResponse, featuredResponse, bannersResponse] = await Promise.all([
      blogAPI.getBlogs({ tag: decodeURIComponent(tag), limit: 20 }),
      blogAPI.getBlogs({ tag: decodeURIComponent(tag), featured: true, limit: 10 }),
      bannerAPI.getBanners()
    ])

    return {
      props: {
        initialData: {
          blogs: blogsResponse.blogs || [],
          featuredBlogs: featuredResponse.blogs || [],
          latestBlogs: blogsResponse.blogs || [],
          popularBlogs: featuredResponse.blogs?.slice(0, 4) || []
        },
        banners: bannersResponse.banners || []
      }
    }
  } catch (error) {
    console.error('Error in getServerSideProps:', error)
    return {
      props: {
        initialData: {
          blogs: [],
          featuredBlogs: [],
          latestBlogs: [],
          popularBlogs: []
        },
        banners: []
      }
    }
  }
}

export default TagPage