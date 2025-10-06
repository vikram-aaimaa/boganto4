<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', '/tmp/php_errors.log');

require_once 'config.php';
require_once 'auth.php';

// Check admin authentication for all admin operations
requireAdminAuth();

$database = new DatabaseConfig();
$db = $database->getConnection();

if (!$db) {
    sendResponse(['error' => 'Database connection failed'], 500);
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        addBlog($db);
        break;
    
    case 'PUT':
        updateBlog($db);
        break;
    
    case 'DELETE':
        if (isset($_GET['id'])) {
            deleteBlog($db, $_GET['id']);
        } else {
            sendResponse(['error' => 'Blog ID required for deletion'], 400);
        }
        break;
    
    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}

function addBlog($db) {
    // Log the incoming request data for debugging
    error_log('POST data: ' . print_r($_POST, true));
    error_log('FILES data: ' . print_r($_FILES, true));
    
    try {
        // Get form data
        $title = isset($_POST['title']) ? sanitizeInput($_POST['title']) : null;
        $content = isset($_POST['content']) ? $_POST['content'] : null;
        $excerpt = isset($_POST['excerpt']) ? sanitizeInput($_POST['excerpt']) : null;
        $category_id = isset($_POST['category_id']) ? (int)$_POST['category_id'] : null;
        $tags = isset($_POST['tags']) ? sanitizeInput($_POST['tags']) : '';
        $meta_title = isset($_POST['meta_title']) ? sanitizeInput($_POST['meta_title']) : $title;
        $meta_description = isset($_POST['meta_description']) ? sanitizeInput($_POST['meta_description']) : $excerpt;
        $is_featured = isset($_POST['is_featured']) ? (bool)$_POST['is_featured'] : false;
        $status = isset($_POST['status']) ? sanitizeInput($_POST['status']) : 'draft';
        
        // Enhanced validation with detailed error messages
        $errors = [];
        if (!$title || trim($title) === '') {
            $errors[] = 'Title is required and cannot be empty';
        }
        if (!$content || trim($content) === '') {
            $errors[] = 'Content is required and cannot be empty';
        }
        if (!$category_id || !is_numeric($category_id)) {
            $errors[] = 'Valid category is required';
        }
        
        if (!empty($errors)) {
            error_log('Validation errors: ' . implode(', ', $errors));
            sendResponse(['error' => 'Validation failed', 'details' => $errors], 422);
        }
        
        // Generate slug
        $slug = generateSlug($title);
        
        // Check if slug already exists
        $check_slug = "SELECT id FROM blogs WHERE slug = :slug";
        $check_stmt = $db->prepare($check_slug);
        $check_stmt->bindParam(':slug', $slug);
        $check_stmt->execute();
        
        if ($check_stmt->fetch()) {
            $slug = $slug . '-' . time();
        }
        
        // Handle file uploads - dual featured images
        $featured_image = null;
        $featured_image_2 = null;
        
        // Handle first featured image
        if (isset($_FILES['featured_image'])) {
            $featured_image = uploadFile($_FILES['featured_image']);
            if (!$featured_image && $_FILES['featured_image']['error'] !== UPLOAD_ERR_NO_FILE) {
                sendResponse(['error' => 'Failed to upload featured image'], 400);
            }
        }
        
        // Handle second featured image
        if (isset($_FILES['featured_image_2'])) {
            $featured_image_2 = uploadFile($_FILES['featured_image_2']);
            if (!$featured_image_2 && $_FILES['featured_image_2']['error'] !== UPLOAD_ERR_NO_FILE) {
                sendResponse(['error' => 'Failed to upload second featured image'], 400);
            }
        }
        
        // Filter out external URLs (only allow uploaded images or null)
        if ($featured_image && (strpos($featured_image, 'http') === 0 && strpos($featured_image, '/uploads/') === false)) {
            $featured_image = null;
        }
        if ($featured_image_2 && (strpos($featured_image_2, 'http') === 0 && strpos($featured_image_2, '/uploads/') === false)) {
            $featured_image_2 = null;
        }
        
        // Generate excerpt if not provided
        if (!$excerpt && $content) {
            $excerpt = substr(strip_tags($content), 0, 200) . '...';
        }
        
        // Insert blog with dual featured images
        $query = "INSERT INTO blogs (title, slug, content, excerpt, featured_image, featured_image_2, category_id, tags, meta_title, meta_description, is_featured, status) 
                  VALUES (:title, :slug, :content, :excerpt, :featured_image, :featured_image_2, :category_id, :tags, :meta_title, :meta_description, :is_featured, :status)";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':slug', $slug);
        $stmt->bindParam(':content', $content);
        $stmt->bindParam(':excerpt', $excerpt);
        $stmt->bindParam(':featured_image', $featured_image);
        $stmt->bindParam(':featured_image_2', $featured_image_2);
        $stmt->bindParam(':category_id', $category_id, PDO::PARAM_INT);
        $stmt->bindParam(':tags', $tags);
        $stmt->bindParam(':meta_title', $meta_title);
        $stmt->bindParam(':meta_description', $meta_description);
        $stmt->bindParam(':is_featured', $is_featured, PDO::PARAM_BOOL);
        $stmt->bindParam(':status', $status);
        
        $stmt->execute();
        $blog_id = $db->lastInsertId();
        
        // Handle related books
        if (isset($_POST['related_books']) && $_POST['related_books']) {
            $related_books = json_decode($_POST['related_books'], true);
            if ($related_books && is_array($related_books)) {
                addRelatedBooks($db, $blog_id, $related_books);
            }
        }
        
        sendResponse(['message' => 'Blog created successfully', 'blog_id' => $blog_id, 'slug' => $slug], 201);
        
    } catch (PDOException $e) {
        error_log('PDO Exception in addBlog: ' . $e->getMessage());
        error_log('PDO Error trace: ' . $e->getTraceAsString());
        sendResponse(['error' => 'Database error occurred', 'details' => $e->getMessage()], 500);
    } catch (Exception $e) {
        error_log('General Exception in addBlog: ' . $e->getMessage());
        error_log('Error trace: ' . $e->getTraceAsString());
        sendResponse(['error' => 'An unexpected error occurred', 'details' => $e->getMessage()], 500);
    }
}

function updateBlog($db) {
    try {
        // Check if this is a form data request (with files) or JSON request
        $isFormData = isset($_POST['id']);
        
        if ($isFormData) {
            // Handle form data with potential file uploads
            $id = isset($_POST['id']) ? (int)$_POST['id'] : null;
            $title = isset($_POST['title']) ? sanitizeInput($_POST['title']) : null;
            $content = isset($_POST['content']) ? $_POST['content'] : null;
            $excerpt = isset($_POST['excerpt']) ? sanitizeInput($_POST['excerpt']) : null;
            $category_id = isset($_POST['category_id']) ? (int)$_POST['category_id'] : null;
            $tags = isset($_POST['tags']) ? sanitizeInput($_POST['tags']) : '';
            $meta_title = isset($_POST['meta_title']) ? sanitizeInput($_POST['meta_title']) : null;
            $meta_description = isset($_POST['meta_description']) ? sanitizeInput($_POST['meta_description']) : null;
            $is_featured = isset($_POST['is_featured']) ? (bool)$_POST['is_featured'] : false;
            $status = isset($_POST['status']) ? sanitizeInput($_POST['status']) : 'draft';
            
            // Handle file uploads for update
            $featured_image = null;
            $featured_image_2 = null;
            $updateImages = false;
            
            // Handle first featured image
            if (isset($_FILES['featured_image']) && $_FILES['featured_image']['error'] === UPLOAD_ERR_OK) {
                $featured_image = uploadFile($_FILES['featured_image']);
                if (!$featured_image) {
                    sendResponse(['error' => 'Failed to upload featured image'], 400);
                }
                $updateImages = true;
            }
            
            // Handle second featured image
            if (isset($_FILES['featured_image_2']) && $_FILES['featured_image_2']['error'] === UPLOAD_ERR_OK) {
                $featured_image_2 = uploadFile($_FILES['featured_image_2']);
                if (!$featured_image_2) {
                    sendResponse(['error' => 'Failed to upload second featured image'], 400);
                }
                $updateImages = true;
            }
            
            // Filter out external URLs
            if ($featured_image && (strpos($featured_image, 'http') === 0 && strpos($featured_image, '/uploads/') === false)) {
                $featured_image = null;
            }
            if ($featured_image_2 && (strpos($featured_image_2, 'http') === 0 && strpos($featured_image_2, '/uploads/') === false)) {
                $featured_image_2 = null;
            }
            
        } else {
            // Handle JSON data for regular updates
            $input = json_decode(file_get_contents('php://input'), true);
            
            $id = isset($input['id']) ? (int)$input['id'] : null;
            $title = isset($input['title']) ? sanitizeInput($input['title']) : null;
            $content = isset($input['content']) ? $input['content'] : null;
            $excerpt = isset($input['excerpt']) ? sanitizeInput($input['excerpt']) : null;
            $category_id = isset($input['category_id']) ? (int)$input['category_id'] : null;
            $tags = isset($input['tags']) ? sanitizeInput($input['tags']) : '';
            $meta_title = isset($input['meta_title']) ? sanitizeInput($input['meta_title']) : null;
            $meta_description = isset($input['meta_description']) ? sanitizeInput($input['meta_description']) : null;
            $is_featured = isset($input['is_featured']) ? (bool)$input['is_featured'] : false;
            $status = isset($input['status']) ? sanitizeInput($input['status']) : 'draft';
            $updateImages = false;
        }
        
        if (!$id || !$title || !$content || !$category_id) {
            sendResponse(['error' => 'ID, title, content, and category are required'], 400);
        }
        
        // Update blog with or without images
        if ($updateImages) {
            $query = "UPDATE blogs SET title = :title, content = :content, excerpt = :excerpt, category_id = :category_id, 
                      tags = :tags, meta_title = :meta_title, meta_description = :meta_description, is_featured = :is_featured, 
                      status = :status, updated_at = NOW()";
            
            if ($featured_image !== null) {
                $query .= ", featured_image = :featured_image";
            }
            if ($featured_image_2 !== null) {
                $query .= ", featured_image_2 = :featured_image_2";
            }
            
            $query .= " WHERE id = :id";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->bindParam(':title', $title);
            $stmt->bindParam(':content', $content);
            $stmt->bindParam(':excerpt', $excerpt);
            $stmt->bindParam(':category_id', $category_id, PDO::PARAM_INT);
            $stmt->bindParam(':tags', $tags);
            $stmt->bindParam(':meta_title', $meta_title);
            $stmt->bindParam(':meta_description', $meta_description);
            $stmt->bindParam(':is_featured', $is_featured, PDO::PARAM_BOOL);
            $stmt->bindParam(':status', $status);
            
            if ($featured_image !== null) {
                $stmt->bindParam(':featured_image', $featured_image);
            }
            if ($featured_image_2 !== null) {
                $stmt->bindParam(':featured_image_2', $featured_image_2);
            }
        } else {
            // Regular update without image changes
            $query = "UPDATE blogs SET title = :title, content = :content, excerpt = :excerpt, category_id = :category_id, 
                      tags = :tags, meta_title = :meta_title, meta_description = :meta_description, is_featured = :is_featured, 
                      status = :status, updated_at = NOW() WHERE id = :id";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->bindParam(':title', $title);
            $stmt->bindParam(':content', $content);
            $stmt->bindParam(':excerpt', $excerpt);
            $stmt->bindParam(':category_id', $category_id, PDO::PARAM_INT);
            $stmt->bindParam(':tags', $tags);
            $stmt->bindParam(':meta_title', $meta_title);
            $stmt->bindParam(':meta_description', $meta_description);
            $stmt->bindParam(':is_featured', $is_featured, PDO::PARAM_BOOL);
            $stmt->bindParam(':status', $status);
        }
        
        $stmt->execute();
        
        // Handle related books for form data updates
        if ($isFormData && isset($_POST['related_books']) && $_POST['related_books']) {
            $related_books = json_decode($_POST['related_books'], true);
            if ($related_books && is_array($related_books)) {
                addRelatedBooks($db, $id, $related_books);
            }
        }
        
        sendResponse(['message' => 'Blog updated successfully']);
        
    } catch (PDOException $e) {
        error_log('PDO Exception in updateBlog: ' . $e->getMessage());
        error_log('PDO Error trace: ' . $e->getTraceAsString());
        sendResponse(['error' => 'Database error occurred while updating', 'details' => $e->getMessage()], 500);
    } catch (Exception $e) {
        error_log('General Exception in updateBlog: ' . $e->getMessage());
        error_log('Error trace: ' . $e->getTraceAsString());
        sendResponse(['error' => 'An unexpected error occurred while updating', 'details' => $e->getMessage()], 500);
    }
}

function deleteBlog($db, $id) {
    try {
        $query = "DELETE FROM blogs WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            sendResponse(['message' => 'Blog deleted successfully']);
        } else {
            sendResponse(['error' => 'Blog not found'], 404);
        }
        
    } catch (PDOException $e) {
        error_log('PDO Exception in deleteBlog: ' . $e->getMessage());
        error_log('PDO Error trace: ' . $e->getTraceAsString());
        sendResponse(['error' => 'Database error occurred while deleting', 'details' => $e->getMessage()], 500);
    } catch (Exception $e) {
        error_log('General Exception in deleteBlog: ' . $e->getMessage());
        error_log('Error trace: ' . $e->getTraceAsString());
        sendResponse(['error' => 'An unexpected error occurred while deleting', 'details' => $e->getMessage()], 500);
    }
}

function addRelatedBooks($db, $blog_id, $books) {
    try {
        // Delete existing related books
        $delete_query = "DELETE FROM related_books WHERE blog_id = :blog_id";
        $delete_stmt = $db->prepare($delete_query);
        $delete_stmt->bindParam(':blog_id', $blog_id, PDO::PARAM_INT);
        $delete_stmt->execute();
        
        // Add new related books with cover_image support
        $insert_query = "INSERT INTO related_books (blog_id, title, author, purchase_link, cover_image, description, price) 
                         VALUES (:blog_id, :title, :author, :purchase_link, :cover_image, :description, :price)";
        $insert_stmt = $db->prepare($insert_query);
        
        foreach ($books as $index => $book) {
            if (isset($book['title']) && isset($book['purchase_link'])) {
                // Handle cover image upload for each book
                $cover_image = null;
                $cover_image_key = 'book_cover_' . $index;
                
                if (isset($_FILES[$cover_image_key]) && $_FILES[$cover_image_key]['error'] === UPLOAD_ERR_OK) {
                    $cover_image = uploadFileToSubfolder($_FILES[$cover_image_key], 'book_covers');
                }
                
                // Use provided cover_image if no file was uploaded
                if (!$cover_image && isset($book['cover_image'])) {
                    $cover_image = $book['cover_image'];
                    // Filter out external URLs (only allow uploaded images or null)
                    if (strpos($cover_image, 'http') === 0 && strpos($cover_image, '/uploads/') === false) {
                        $cover_image = null;
                    }
                }
                
                // Prepare variables for binding
                $title = $book['title'];
                $author = $book['author'] ?? '';
                $purchase_link = $book['purchase_link'];
                $description = $book['description'] ?? '';
                $price = $book['price'] ?? '';
                
                $insert_stmt->bindParam(':blog_id', $blog_id, PDO::PARAM_INT);
                $insert_stmt->bindParam(':title', $title);
                $insert_stmt->bindParam(':author', $author);
                $insert_stmt->bindParam(':purchase_link', $purchase_link);
                $insert_stmt->bindParam(':cover_image', $cover_image);
                $insert_stmt->bindParam(':description', $description);
                $insert_stmt->bindParam(':price', $price);
                $insert_stmt->execute();
            }
        }
        
    } catch (PDOException $e) {
        // Log error but don't fail the main operation
        error_log('Failed to add related books: ' . $e->getMessage());
    }
}

// Helper function for file uploads with subfolder support
function uploadFileToSubfolder($file, $subfolder = '') {
    $upload_dir = '../uploads/';
    
    // Create subfolder if specified
    if ($subfolder) {
        $upload_dir .= $subfolder . '/';
        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0755, true);
        }
    }
    
    // Check for upload errors
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return false;
    }
    
    // Validate file type
    $allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    $file_type = $file['type'];
    
    if (!in_array($file_type, $allowed_types)) {
        return false;
    }
    
    // Validate file size (5MB max)
    $max_size = 5 * 1024 * 1024; // 5MB
    if ($file['size'] > $max_size) {
        return false;
    }
    
    // Generate unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid() . '_' . time() . '.' . $extension;
    $file_path = $upload_dir . $filename;
    
    // Move uploaded file
    if (move_uploaded_file($file['tmp_name'], $file_path)) {
        // Return relative path from webroot
        return '/uploads/' . ($subfolder ? $subfolder . '/' : '') . $filename;
    }
    
    return false;
}
?>