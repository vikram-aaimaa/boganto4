<?php
require_once 'config.php';

$database = new DatabaseConfig();
$db = $database->getConnection();

if (!$db) {
    sendResponse(['error' => 'Database connection failed'], 500);
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            // Get single blog by ID
            getBlogById($db, $_GET['id']);
        } elseif (isset($_GET['slug'])) {
            // Get single blog by slug
            getBlogBySlug($db, $_GET['slug']);
        } else {
            // Get all blogs with filters
            getAllBlogs($db);
        }
        break;
    
    default: 
        sendResponse(['error' => 'Method not allowed'], 405);
}

function getAllBlogs($db) {
    // Get query parameters
    $category = isset($_GET['category']) ? sanitizeInput($_GET['category']) : null;
    $tag = isset($_GET['tag']) ? sanitizeInput($_GET['tag']) : null;
    $featured = isset($_GET['featured']) ? (bool)$_GET['featured'] : null;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : null;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
    $search = isset($_GET['search']) ? sanitizeInput($_GET['search']) : null;
    $status = isset($_GET['status']) ? sanitizeInput($_GET['status']) : null;
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;

    // Check if this is an admin request (should show all statuses)
    $is_admin_request = strpos($_SERVER['REQUEST_URI'], '/admin/') !== false || isset($_GET['admin']);
    
    // Build base query
    $query = "SELECT b.id, b.title, b.slug, b.content, b.excerpt, b.featured_image, b.featured_image_2, 
                     b.category_id, b.tags, b.meta_title, b.meta_description, b.is_featured, b.status, 
                     b.view_count, b.created_at, b.updated_at, c.name as category_name, c.slug as category_slug 
              FROM blogs b 
              LEFT JOIN categories c ON b.category_id = c.id 
              WHERE 1=1";
    
    $params = [];
    
    // Filter by status
    if (!$is_admin_request) {
        $query .= " AND b.status = 'published'";
    } elseif ($status && $status !== 'all') {
        $query .= " AND b.status = :status";
        $params['status'] = $status;
    }
    
    if ($category) {
        $query .= " AND c.slug = :category";
        $params['category'] = $category;
    }
    
    if ($tag) {
        $query .= " AND b.tags LIKE :tag";
        $params['tag'] = "%{$tag}%";
    }
    
    if ($featured !== null) {
        $query .= " AND b.is_featured = :featured";
        $params['featured'] = $featured ? 1 : 0;
    }
    
    if ($search) {
        $query .= " AND (b.title LIKE :search OR b.content LIKE :search OR b.tags LIKE :search)";
        $params['search'] = "%{$search}%";
    }
    
    // Get total count for pagination
    $count_query = "SELECT COUNT(*) as total FROM ($query) as count_table";
    $count_stmt = $db->prepare($count_query);
    foreach ($params as $key => $value) {
        $count_stmt->bindValue(":$key", $value);
    }
    $count_stmt->execute();
    $total = $count_stmt->fetch()['total'];
    
    $query .= " ORDER BY b.created_at DESC";
    
    // Handle pagination
    if ($limit || $page > 1) {
        if (!$limit) $limit = 10; // default limit for pagination
        $offset = ($page - 1) * $limit;
        $query .= " LIMIT :limit OFFSET :offset";
        $params['limit'] = $limit;
        $params['offset'] = $offset;
    }

    try {
        $stmt = $db->prepare($query);
        
        foreach ($params as $key => $value) {
            if (in_array($key, ['limit', 'offset', 'featured'])) {
                $stmt->bindValue(":$key", $value, PDO::PARAM_INT);
            } else {
                $stmt->bindValue(":$key", $value);
            }
        }
        
        $stmt->execute();
        $blogs = $stmt->fetchAll();
        
        // Format blogs data
        $formatted_blogs = array_map('formatBlog', $blogs);
        
        // Load related books for all requests (both admin and public)
        foreach ($formatted_blogs as &$blog) {
            $books_query = "SELECT * FROM related_books WHERE blog_id = :blog_id ORDER BY id ASC";
            $books_stmt = $db->prepare($books_query);
            $books_stmt->bindParam(':blog_id', $blog['id'], PDO::PARAM_INT);
            $books_stmt->execute();
            $related_books = $books_stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Format the related books data and ensure cover_image is full URL
            $blog['related_books'] = array_map(function($book) {
                return [
                    'id' => (int)$book['id'],
                    'blog_id' => (int)$book['blog_id'],
                    'title' => $book['title'],
                    'author' => $book['author'] ?? null,
                    'purchase_link' => $book['purchase_link'],
                    'cover_image' => getFullImageUrl($book['cover_image']),
                    'description' => $book['description'],
                    'price' => $book['price'],
                    'created_at' => $book['created_at']
                ];
            }, $related_books);
        }
        
        $response = [
            'blogs' => $formatted_blogs,
            'total' => (int)$total,
            'page' => $page,
            'limit' => $limit ?: count($formatted_blogs),
            'total_pages' => $limit ? ceil($total / $limit) : 1
        ];
        
        sendResponse($response);
        
    } catch (PDOException $e) {
        sendResponse(['error' => 'Database query failed: ' . $e->getMessage()], 500);
    }
}

function getBlogById($db, $id) {
    try {
        $query = "SELECT b.id, b.title, b.slug, b.content, b.excerpt, b.featured_image, b.featured_image_2, 
                         b.category_id, b.tags, b.meta_title, b.meta_description, b.is_featured, b.status, 
                         b.view_count, b.created_at, b.updated_at, c.name as category_name, c.slug as category_slug 
                  FROM blogs b 
                  LEFT JOIN categories c ON b.category_id = c.id 
                  WHERE b.id = :id AND b.status = 'published'";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        
        $blog = $stmt->fetch();
        
        if (!$blog) {
            sendResponse(['error' => 'Blog not found'], 404);
        }
        
        // Increment view count
        $update_query = "UPDATE blogs SET view_count = view_count + 1 WHERE id = :id";
        $update_stmt = $db->prepare($update_query);
        $update_stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $update_stmt->execute();
        
        // Get related books
        $books_query = "SELECT * FROM related_books WHERE blog_id = :blog_id ORDER BY id ASC";
        $books_stmt = $db->prepare($books_query);
        $books_stmt->bindParam(':blog_id', $id, PDO::PARAM_INT);
        $books_stmt->execute();
        $related_books = $books_stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Format the related books data
        $formatted_books = array_map(function($book) {
            return [    
                'id' => (int)$book['id'],
                'blog_id' => (int)$book['blog_id'],
                'title' => $book['title'],
                'author' => $book['author'],
                'purchase_link' => $book['purchase_link'],
                'cover_image' => getFullImageUrl($book['cover_image']),
                'description' => $book['description'],
                'price' => $book['price'],
                'created_at' => $book['created_at']
            ];
        }, $related_books);
        
        // Get related blogs/articles
        $related_blogs = getRelatedBlogs($db, $id, $blog['category_id'], $blog['tags']);
        
        $blog = formatBlog($blog);
        $blog['related_books'] = $formatted_books;
        $blog['related_blogs'] = $related_blogs;
        
        sendResponse(['blog' => $blog]);
        
    } catch (PDOException $e) {
        sendResponse(['error' => 'Database query failed: ' . $e->getMessage()], 500);
    }
}

function getBlogBySlug($db, $slug) {
    try {
        $query = "SELECT b.id, b.title, b.slug, b.content, b.excerpt, b.featured_image, b.featured_image_2, 
                         b.category_id, b.tags, b.meta_title, b.meta_description, b.is_featured, b.status, 
                         b.view_count, b.created_at, b.updated_at, c.name as category_name, c.slug as category_slug 
                  FROM blogs b 
                  LEFT JOIN categories c ON b.category_id = c.id 
                  WHERE b.slug = :slug AND b.status = 'published'";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':slug', $slug);
        $stmt->execute();
        
        $blog = $stmt->fetch();
        
        if (!$blog) {
            sendResponse(['error' => 'Blog not found'], 404);
        }
        
        // Increment view count
        $update_query = "UPDATE blogs SET view_count = view_count + 1 WHERE slug = :slug";
        $update_stmt = $db->prepare($update_query);
        $update_stmt->bindParam(':slug', $slug);
        $update_stmt->execute();
        
        // Get related books
        $books_query = "SELECT * FROM related_books WHERE blog_id = :blog_id ORDER BY id ASC";
        $books_stmt = $db->prepare($books_query);
        $books_stmt->bindParam(':blog_id', $blog['id'], PDO::PARAM_INT);
        $books_stmt->execute();
        $related_books = $books_stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Format the related books data
        $formatted_books = array_map(function($book) {
            return [
                'id' => (int)$book['id'],
                'blog_id' => (int)$book['blog_id'],
                'title' => $book['title'],
                'author' => $book['author'],
                'purchase_link' => $book['purchase_link'],
                'cover_image' => getFullImageUrl($book['cover_image']),
                'description' => $book['description'],
                'price' => $book['price'],
                'created_at' => $book['created_at']
            ];
        }, $related_books);
        
        // Get related blogs/articles
        $related_blogs = getRelatedBlogs($db, $blog['id'], $blog['category_id'], $blog['tags']);
        
        $blog = formatBlog($blog);
        $blog['related_books'] = $formatted_books;
        $blog['related_blogs'] = $related_blogs;
        
        sendResponse(['blog' => $blog]);
        
    } catch (PDOException $e) {
        sendResponse(['error' => 'Database query failed: ' . $e->getMessage()], 500);
    }
}

function getRelatedBlogs($db, $current_blog_id, $category_id, $tags, $limit = 6) {
    try {
        // Build query to find related blogs based on:
        // 1. Same category (highest priority)
        // 2. Matching tags (secondary priority)
        // Exclude the current blog
        
        $query = "SELECT b.id, b.title, b.slug, b.excerpt, b.featured_image, 
                         b.category_id, b.view_count, b.created_at, 
                         c.name as category_name, c.slug as category_slug";
        
        // Add score calculation for relevance
        if ($tags) {
            $tag_array = explode(',', $tags);
            $tag_conditions = [];
            foreach ($tag_array as $tag) {
                $tag_conditions[] = "b.tags LIKE " . $db->quote('%' . trim($tag) . '%');
            }
            $tag_match = implode(' OR ', $tag_conditions);
            $query .= ", (CASE WHEN b.category_id = :category_id THEN 2 ELSE 0 END + 
                          CASE WHEN ($tag_match) THEN 1 ELSE 0 END) as relevance_score";
        } else {
            $query .= ", (CASE WHEN b.category_id = :category_id THEN 2 ELSE 0 END) as relevance_score";
        }
        
        $query .= " FROM blogs b 
                    LEFT JOIN categories c ON b.category_id = c.id 
                    WHERE b.id != :current_blog_id 
                    AND b.status = 'published'";
        
        // Add category or tag matching condition
        if ($tags) {
            $tag_array = explode(',', $tags);
            $tag_conditions = [];
            foreach ($tag_array as $tag) {
                $tag_conditions[] = "b.tags LIKE " . $db->quote('%' . trim($tag) . '%');
            }
            $tag_match = implode(' OR ', $tag_conditions);
            $query .= " AND (b.category_id = :category_id OR ($tag_match))";
        } else {
            $query .= " AND b.category_id = :category_id";
        }
        
        // Order by relevance score first, then by creation date
        $query .= " ORDER BY relevance_score DESC, b.created_at DESC LIMIT :limit";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':current_blog_id', $current_blog_id, PDO::PARAM_INT);
        $stmt->bindParam(':category_id', $category_id, PDO::PARAM_INT);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        
        $related_blogs = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Format the related blogs
        $formatted_related_blogs = array_map(function($blog) {
            return [
                'id' => (int)$blog['id'],
                'title' => $blog['title'],
                'slug' => $blog['slug'],
                'excerpt' => $blog['excerpt'],
                'featured_image' => getFullImageUrl($blog['featured_image']),
                'category_id' => (int)$blog['category_id'],
                'category_name' => $blog['category_name'],
                'category_slug' => $blog['category_slug'],
                'view_count' => (int)$blog['view_count'],
                'created_at' => $blog['created_at']
            ];
        }, $related_blogs);
        
        return $formatted_related_blogs;
        
    } catch (PDOException $e) {
        error_log('Error fetching related blogs: ' . $e->getMessage());
        return [];
    }
}

function formatBlog($blog) {
    if (!$blog) return $blog;
    
    // Get featured images and convert to full URLs
    $featured_image = $blog['featured_image'];
    $featured_image_2 = isset($blog['featured_image_2']) ? $blog['featured_image_2'] : null;
    
    // Filter out external URLs (only keep uploaded images or null)
    if ($featured_image && strpos($featured_image, 'http') === 0 && strpos($featured_image, '/uploads/') === false) {
        $featured_image = null;
    }
    if ($featured_image_2 && strpos($featured_image_2, 'http') === 0 && strpos($featured_image_2, '/uploads/') === false) {
        $featured_image_2 = null;
    }
    
    // Convert to full URLs
    $featured_image = getFullImageUrl($featured_image);
    $featured_image_2 = getFullImageUrl($featured_image_2);
    
    return [
        'id' => (int)$blog['id'],
        'title' => $blog['title'],
        'slug' => $blog['slug'],
        'content' => $blog['content'],
        'excerpt' => $blog['excerpt'],
        'featured_image' => $featured_image,
        'featured_image_2' => $featured_image_2,
        'category_id' => (int)$blog['category_id'],
        'category_name' => $blog['category_name'],
        'category_slug' => $blog['category_slug'],
        'category' => [
            'id' => (int)$blog['category_id'],
            'name' => $blog['category_name'],
            'slug' => $blog['category_slug']
        ],
        'tags' => $blog['tags'] ? explode(',', $blog['tags']) : [],
        'meta_title' => $blog['meta_title'] ?? '',
        'meta_description' => $blog['meta_description'] ?? '',
        'is_featured' => (bool)$blog['is_featured'],
        'status' => $blog['status'],
        'view_count' => (int)$blog['view_count'],
        'created_at' => $blog['created_at'],
        'updated_at' => $blog['updated_at']
    ];
}
?>