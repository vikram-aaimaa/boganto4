import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Eye,
  Tag,
  ExternalLink,
  ChevronRight,
  Share2,
  Twitter,
  Facebook,
  Linkedin,
  MessageSquare,
  Copy,
  Clock,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { blogAPI, utils } from "../../utils/api";
import { DEFAULT_IMAGES } from "../../utils/constants";

// Use SSR for blog posts to avoid build issues
export async function getServerSideProps({ params }) {
  const { slug } = params;

  try {
    console.log("Fetching blog with slug:", slug);
    const response = await blogAPI.getBlogBySlug(slug);

    console.log("API Response:", response);

    if (response && response.blog) {
      console.log("Blog data found:", response.blog);
      console.log("Related books in SSR:", response.blog.related_books);
      return {
        props: {
          initialBlog: response.blog,
          relatedArticles: [],
        },
      };
    } else {
      const errorMsg = "Failed to load blog post";
      console.error(errorMsg, response);
      return {
        props: {
          error: errorMsg,
          initialBlog: null,   
          relatedArticles: [],
        },
      };
    }
  } catch (error) {
    console.error("Error fetching blog:", error);
    const errorMsg =
      error.response?.data?.error ||
      error.message ||
      "Failed to load blog post";

    return {
      props: {
        error: errorMsg,
        initialBlog: null,
        relatedArticles: [],
      },
    };
  }
}

// BlogDetailPage component definition starts here
function BlogDetailPage({ initialBlog = null, relatedArticles = [] }) {
  const router = useRouter();
  const { slug } = router.query;
  const [blog, setBlog] = useState(initialBlog);
  const [relatedBooks, setRelatedBooks] = useState(
    initialBlog && initialBlog.related_books ? initialBlog.related_books : []
  );
  const [loading, setLoading] = useState(!initialBlog); 
  const [error, setError] = useState(null);
  const [tableOfContents, setTableOfContents] = useState([]);
  const [showMoreRelated, setShowMoreRelated] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (!initialBlog && slug) {
      fetchBlogDetail();
    }
  }, [slug, initialBlog]);

  useEffect(() => {
    if (blog) {
      generateTableOfContents();
    }
  }, [blog]);

  const fetchBlogDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await blogAPI.getBlogBySlug(slug);
      console.log("Blog response with related books:", response);

      setBlog(response.blog);

      // Set related books from the response
      if (response.blog && response.blog.related_books) {
        console.log("Related books found:", response.blog.related_books);
        setRelatedBooks(
          Array.isArray(response.blog.related_books)
            ? response.blog.related_books
            : []
        );
      } else {
        console.log("No related books found in response");
        setRelatedBooks([]);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching blog detail:", err);
      if (err.status === 404) {
        setError("Blog post not found");
      } else {
        setError("Failed to load blog post. Please try again.");
      }
      setLoading(false);
    }
  };

  const generateTableOfContents = () => {
    if (!blog || !blog.content) return;

    // Extract h2 and h3 tags from content
    const headingRegex = /<h([23])[^>]*>(.*?)<\/h[23]>/gi;
    const headings = [];
    let match;

    while ((match = headingRegex.exec(blog.content)) !== null) {
      const level = parseInt(match[1]);
      const text = match[2].replace(/<[^>]*>/g, ""); // Remove any HTML tags
      const id = utils.generateSlug(text);

      headings.push({
        level,
        text,
        id,
      });
    }

    setTableOfContents(headings);
  };

  const scrollToHeading = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleTagClick = (tag) => {
    router.push(`/tag/${encodeURIComponent(tag.trim())}`);
  };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:5173";
  const shareUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `${siteUrl}/blog/${slug}`;
  const shareTitle = blog ? blog.title : "";

  const getShareUrl = () => {
    // Use client-side URL when available, fallback to constructed URL for SSR
    return typeof window !== "undefined"
      ? window.location.href
      : `${siteUrl}/blog/${slug}`;
  };

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareTitle
    )}&url=${encodeURIComponent(getShareUrl())}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      getShareUrl()
    )}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      getShareUrl()
    )}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(
      shareTitle + " " + getShareUrl()
    )}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const handleFeedback = (type) => {
    setFeedback(type);
    // You can implement API call to save feedback here
  };

  // Process content to add IDs to headings
  const processContent = (content) => {
    return content.replace(
      /<h([23])[^>]*>(.*?)<\/h[23]>/gi,
      (match, level, text) => {
        const cleanText = text.replace(/<[^>]*>/g, "");
        const id = utils.generateSlug(cleanText);
        return `<h${level} id="${id}" class="scroll-mt-24">${text}</h${level}>`;
      }
    );
  };

  const calculateReadTime = (content) => {
    const wordsPerMinute = 200;
    const words = content?.replace(/<[^>]*>/g, "").split(" ").length || 0;
    return Math.ceil(words / wordsPerMinute);
  };

  // Display only 3 related articles by default
  const displayedRelatedArticles = showMoreRelated
    ? relatedArticles
    : relatedArticles?.slice(0, 3) || [];

  if (loading) {
    return (
      <>
        <Head>
          <title>Loading... - Boganto</title>
        </Head>
        <Header />
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded mb-6"></div>
              <div className="space-y-4">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Error - Boganto</title>
        </Head>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-navy-800 mb-4">{error}</h2>
            <p className="text-navy-600 mb-6">
              The blog post you're looking for might have been moved or deleted.
            </p>
            <Link href="/" className="btn-primary">
              Back to Home
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!blog) {
    return null;
  }

  // Use getImageUrl from constants
  const readTime = calculateReadTime(blog.content);

  return (
    <>
      <Head>
        <title>{`${blog.title} - Boganto`}</title>
        <meta name="description" content={blog.excerpt || blog.title} />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.excerpt || blog.title} />
        <meta property="og:type" content="article" />
        <meta
          property="og:image"
          content={blog.featured_image || DEFAULT_IMAGES.ARTICLE_THUMBNAIL}
        />
        <meta property="article:published_time" content={blog.created_at} />
        <meta property="article:author" content="Boganto" />
        {blog.tags &&
          blog.tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag.trim()} />
          ))}
        <link rel="canonical" href={`https://boganto.com/blog/${blog.slug}`} />
        {blog.featured_image && (
          <>
            <link
              rel="preload"
              href={blog.featured_image}
              as="image"
              fetchpriority="high"
            />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />
          </>
        )}
      </Head>

      <Header />
      <main>
        {/* Breadcrumb */}
        <nav className="bg-gray-50 py-4 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ul className="flex items-center text-sm text-gray-600">
              <li>
                <Link
                  href="/"
                  className="text-orange-500 hover:text-orange-600 transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li className="mx-2">/</li>
              {blog.category && (
                <>
                  <li>
                    <span className="text-gray-600">
                      {blog.category.name || "Fiction"}
                    </span>
                  </li>
                  <li className="mx-2">/</li>
                </>
              )}
              <li>
                <span className="text-gray-800 font-medium truncate">
                  {blog.title}
                </span>
              </li>
            </ul>
          </div>
        </nav>

        {/* Article Hero Section */}
        <section className="bg-gradient-to-br from-gray-50 to-white py-12 lg:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Category Tag */}
            {blog.category && (
              <div className="mb-6">
                <span className="inline-block bg-teal-500 text-white px-4 py-2 rounded-full text-sm font-medium uppercase tracking-wider">
                  {blog.category.name || "Fiction"}
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-8 leading-tight font-serif">
              {blog.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-orange-500" />
                <span>{utils.formatDate(blog.created_at)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-orange-500" />
                <span>{readTime} min read</span>
              </div>
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-2 text-orange-500" />
                <span>{blog.view_count || 0} views</span>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Image Section - Responsive Single vs Dual Images */}
        <section className="py-8">
          {blog.featured_image && blog.featured_image_2 ? (
            // Dual images - 2-column grid layout (stacked on mobile)
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="aspect-[4/3] overflow-hidden rounded-xl shadow-lg relative">
                  <Image
                    src={blog.featured_image}
                    alt={blog.title}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      e.target.src = DEFAULT_IMAGES.ARTICLE_THUMBNAIL;
                      e.target.onerror = null;
                    }}
                  />
                </div>
                <div className="aspect-[4/3] overflow-hidden rounded-xl shadow-lg relative">
                  <Image
                    src={blog.featured_image_2}
                    alt={`${blog.title} - Image 2`}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      e.target.src = DEFAULT_IMAGES.ARTICLE_THUMBNAIL;
                      e.target.onerror = null;
                    }}
                  />
                </div>
              </div>
            </div>
          ) : blog.featured_image ? (
            // Single image - large centered display
            <div className="max-w-3xl mx-auto rounded-xl overflow-hidden shadow-2xl relative h-[400px]">
              <Image
                src={
                  utils.getImageUrl(blog.featured_image) ||
                  utils.getImageUrl(DEFAULT_IMAGES.ARTICLE_THUMBNAIL)
                }
                alt={blog.title}
                fill
                className="object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.onerror = null;
                }}
              />
            </div>
          ) : (
            // No uploaded images - use fallback
            <div className="max-w-3xl mx-auto rounded-xl overflow-hidden shadow-2xl">
              <div className="w-full h-[400px] bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                <span className="text-white text-4xl font-bold">📚</span>
              </div>
            </div>
          )}
        </section>

        {/* Article Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content */}
            <article className="lg:col-span-8 order-1">
              <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
                {/* Table of Contents */}
                {tableOfContents.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-6 mb-12 border-l-4 border-orange-500">
                    <h3 className="text-[1.1rem] font-semibold text-gray-800 mb-4">
                      Table of Contents
                    </h3>
                    <nav className="space-y-2">
                      {tableOfContents.map((heading, index) => (
                        <button
                          key={index}
                          onClick={() => scrollToHeading(heading.id)}
                          className={`block w-full text-left text-sm no-underline text-gray-600 py-1 border-l-2 border-transparent pl-4 transition-all duration-200 hover:text-orange-600 hover:border-orange-500 hover:pl-6 ${
                            heading.level === 2
                              ? "font-medium text-gray-700"
                              : "pl-4 text-gray-600"
                          }`}
                        >
                          {heading.text}
                        </button>
                      ))}
                    </nav>
                  </div>
                )}

                {/* Article Body */}
                <div
                  className="article-content prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-orange-600 prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-4 prose-blockquote:border-orange-500 prose-blockquote:bg-orange-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg"
                  dangerouslySetInnerHTML={{
                    __html: processContent(blog.content),
                  }}
                />

                {/* Article Body */}
                <div
                  className="article-content prose prose-lg max-w-none
  prose-headings:font-serif prose-headings:text-gray-900
  prose-p:text-gray-700 prose-p:leading-relaxed
  prose-a:text-orange-600 prose-a:no-underline hover:prose-a:underline

  /* === Quote styling converted from CSS === */
  prose-blockquote:relative
  prose-blockquote:bg-gray-50 prose-blockquote:rounded-lg prose-blockquote:border-l-4 prose-blockquote:border-orange-500
  prose-blockquote:px-8 prose-blockquote:py-6 prose-blockquote:my-12
  prose-blockquote:before:content-['“'] prose-blockquote:before:text-orange-500 prose-blockquote:before:text-4xl prose-blockquote:before:absolute prose-blockquote:before:-top-3 prose-blockquote:before:left-6
  prose-blockquote:p-italic prose-blockquote:text-gray-800 prose-blockquote:text-[1.25rem] prose-blockquote:leading-relaxed
  prose-blockquote:cite:block prose-blockquote:cite:text-right prose-blockquote:cite:text-gray-500 prose-blockquote:cite:font-medium prose-blockquote:cite:not-italic prose-blockquote:cite:text-[0.95rem] prose-blockquote:cite:before:content-['—_']

  "
                  dangerouslySetInnerHTML={{
                    __html: processContent(blog.content),
                  }}
                />

                {/* Tags */}
                {blog.tags && blog.tags.length > 0 && (
                  <div className="my-12 py-8 border-t border-b border-gray-200">
                    <h4 className="text-base font-semibold text-gray-800 mb-4">
                      Tags:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {blog.tags.map((tag, index) => (
                        <button
                          key={index}
                          onClick={() => handleTagClick(tag)}
                          className="inline-flex items-center px-4 py-1.5 rounded-full text-[0.85rem] font-medium
                     bg-gray-50 text-gray-600 border border-gray-200
                     hover:bg-orange-500 hover:text-white hover:border-orange-500
                     transform hover:-translate-y-[1px]
                     transition-all duration-200"
                        >
                          <Tag className="h-3.5 w-3.5 mr-1" />
                          {tag.trim()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social Share (Bottom) */}
                <div className="my-12 text-center">
                  <h4 className="text-[1.1rem] font-semibold text-gray-800 mb-6">
                    Share this article
                  </h4>
                  <div className="flex flex-wrap justify-center gap-4">
                    <a
                      href={shareLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-5 py-3 rounded-md text-sm font-medium text-white bg-[#1877F2]
                 hover:-translate-y-[2px] hover:shadow-md transition-all duration-200"
                    >
                      <Facebook className="h-4 w-4" />
                      Share on Facebook
                    </a>

                    <a
                      href={shareLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-5 py-3 rounded-md text-sm font-medium text-white bg-[#1DA1F2]
                 hover:-translate-y-[2px] hover:shadow-md transition-all duration-200"
                    >
                      <Twitter className="h-4 w-4" />
                      Share on Twitter
                    </a>

                    <a
                      href={shareLinks.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-5 py-3 rounded-md text-sm font-medium text-white bg-[#25D366]
                 hover:-translate-y-[2px] hover:shadow-md transition-all duration-200"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Share on WhatsApp
                    </a>

                    <button
                      onClick={copyToClipboard}
                      className={`flex items-center gap-2 px-5 py-3 rounded-md text-sm font-medium transition-all duration-200 
                 hover:-translate-y-[2px] hover:shadow-md
                 ${
                   copySuccess
                     ? "bg-green-600 text-white"
                     : "bg-gray-600 text-white hover:bg-gray-700"
                 }`}
                    >
                      <Copy className="h-4 w-4" />
                      {copySuccess ? "Copied!" : "Copy Link"}
                    </button>
                  </div>
                </div>
              </div>
            </article>

            {/* Article Sidebar - Related Books */}
            <aside className="lg:col-span-4 order-2">
              <div className="sticky top-24">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-6">
                    Related Books
                  </h4>
                  <div className="space-y-4">
                    {relatedBooks && relatedBooks.length > 0 ? (
                      relatedBooks.map((book) => (
                        <div
                          key={book.id}
                          className="flex gap-3 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0 group hover:bg-gray-50 p-2 rounded-lg transition-colors"
                        >
                          <div className="w-12 h-16 flex-shrink-0 rounded overflow-hidden">
                            {book.cover_image ? (
                              <Image
                                src={utils.getImageUrl(book.cover_image)}
                                alt={book.title}
                                width={48}
                                height={64}
                                loading="lazy"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback to gradient background if image fails to load
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <div
                              className={`w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center ${
                                book.cover_image ? "hidden" : "flex"
                              }`}
                            >
                              <span className="text-white text-xs font-bold">
                                📚
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 text-sm leading-tight mb-1 group-hover:text-orange-600 transition-colors">
                              {book.title}
                            </h5>
                            {book.author && (
                              <p className="text-gray-600 text-xs mb-1">
                                by {book.author}
                              </p>
                            )}
                            {book.price && (
                              <p className="text-orange-600 font-semibold text-sm mb-2">
                                {book.price}
                              </p>
                            )}
                            {book.description && (
                              <p className="text-gray-600 text-xs leading-relaxed mb-2 line-clamp-2">
                                {book.description}
                              </p>
                            )}
                            {book.purchase_link && (
                              <a
                                href={book.purchase_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-xs text-orange-600 hover:text-orange-700 font-medium"
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Buy Now
                              </a>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <div className="mb-4">
                          <span className="text-4xl">📚</span>
                        </div>
                        <p className="text-sm">
                          No related books available for this article.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* Related Articles Section */}
        {relatedArticles && relatedArticles.length > 0 && (
          <section className="bg-gray-50 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
                Related Articles
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayedRelatedArticles.map((article) => (
                  <article
                    key={article.id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                  >
                    <Link href={`/blog/${article.slug}`}>
                      <div className="aspect-video relative">
                        <img
                          src={
                            article.featured_image ||
                            DEFAULT_IMAGES.ARTICLE_THUMBNAIL
                          }
                          alt={article.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = DEFAULT_IMAGES.ARTICLE_THUMBNAIL;
                          }}
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 hover:text-orange-600 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{utils.formatDate(article.created_at)}</span>
                          <span className="mx-2">•</span>
                          <Eye className="h-3 w-3 mr-1" />
                          <span>{article.view_count || 0} views</span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>

              {relatedArticles.length > 3 && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => setShowMoreRelated(!showMoreRelated)}
                    className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 font-medium"
                  >
                    <span className="mr-2">
                      {showMoreRelated
                        ? "Load Less Articles"
                        : "Load More Articles"}
                    </span>
                    <ChevronRight
                      className={`h-4 w-4 transform transition-transform ${
                        showMoreRelated ? "rotate-90" : "rotate-0"
                      }`}
                    />
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Feedback Section */}
        <section className="py-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Was this article helpful?
            </h3>

            {feedback ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <p className="text-green-800 font-medium">
                  Thank you for your feedback!
                </p>
              </div>
            ) : (
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => handleFeedback("yes")}
                  className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  <ThumbsUp className="h-5 w-5 mr-2" />
                  <span>Yes</span>
                </button>
                <button
                  onClick={() => handleFeedback("no")}
                  className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  <ThumbsDown className="h-5 w-5 mr-2" />
                  <span>No</span>
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default BlogDetailPage;
