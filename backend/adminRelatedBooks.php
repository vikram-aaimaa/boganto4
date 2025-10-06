<?php
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
    case 'GET':
        if (isset($_GET['blog_id'])) {
            getRelatedBooksByBlog($db, $_GET['blog_id']);
        } else {
            getAllRelatedBooks($db);
        }
        break;
    
    case 'POST':
        addRelatedBook($db);
        break;
    
    case 'PUT':
        updateRelatedBook($db);
        break;
    
    case 'DELETE':
        if (isset($_GET['id'])) {
            deleteRelatedBook($db, $_GET['id']);
        } else {
            sendResponse(['error' => 'Book ID required for deletion'], 400);
        }
        break;
    
    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}

function getAllRelatedBooks($db) {
    try {
        $query = "SELECT rb.*, bl.title as blog_title, bl.slug as blog_slug 
                  FROM related_books rb 
                  LEFT JOIN blogs bl ON rb.blog_id = bl.id 
                  ORDER BY rb.created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $books = $stmt->fetchAll();
        
        // Format book data
        $formatted_books = array_map(function($book) {
            return [
                'id' => (int)$book['id'],
                'blog_id' => (int)$book['blog_id'],
                'blog_title' => $book['blog_title'],
                'blog_slug' => $book['blog_slug'],
                'title' => $book['title'],
                'author' => $book['author'],
                'purchase_link' => $book['purchase_link'],
                'cover_image' => $book['cover_image'],
                'description' => $book['description'],
                'price' => $book['price'],
                'created_at' => $book['created_at']
            ];
        }, $books);
        
        sendResponse(['books' => $formatted_books]);
        
    } catch (PDOException $e) {
        sendResponse(['error' => 'Database query failed: ' . $e->getMessage()], 500);
    }
}

function getRelatedBooksByBlog($db, $blog_id) {
    try {
        $query = "SELECT * FROM related_books WHERE blog_id = :blog_id ORDER BY created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':blog_id', $blog_id, PDO::PARAM_INT);
        $stmt->execute();
        $books = $stmt->fetchAll();
        
        // Format book data
        $formatted_books = array_map(function($book) {
            return [
                'id' => (int)$book['id'],
                'blog_id' => (int)$book['blog_id'],
                'title' => $book['title'],
                'author' => $book['author'],
                'purchase_link' => $book['purchase_link'],
                'cover_image' => $book['cover_image'],
                'description' => $book['description'],
                'price' => $book['price'],
                'created_at' => $book['created_at']
            ];
        }, $books);
        
        sendResponse(['books' => $formatted_books]);
        
    } catch (PDOException $e) {
        sendResponse(['error' => 'Database query failed: ' . $e->getMessage()], 500);
    }
}

function addRelatedBook($db) {
    try {
        // Get form data
        $blog_id = isset($_POST['blog_id']) ? (int)$_POST['blog_id'] : null;
        $title = isset($_POST['title']) ? sanitizeInput($_POST['title']) : null;
        $author = isset($_POST['author']) ? sanitizeInput($_POST['author']) : '';
        $purchase_link = isset($_POST['purchase_link']) ? sanitizeInput($_POST['purchase_link']) : null;
        $description = isset($_POST['description']) ? sanitizeInput($_POST['description']) : '';
        $price = isset($_POST['price']) ? sanitizeInput($_POST['price']) : '';
        
        // Validation
        if (!$blog_id || !$title || !$purchase_link) {
            sendResponse(['error' => 'Blog ID, title, and purchase link are required'], 400);
        }
        
        // Validate blog exists
        $blog_query = "SELECT id FROM blogs WHERE id = :blog_id";
        $blog_stmt = $db->prepare($blog_query);
        $blog_stmt->bindParam(':blog_id', $blog_id, PDO::PARAM_INT);
        $blog_stmt->execute();
        
        if (!$blog_stmt->fetch()) {
            sendResponse(['error' => 'Blog not found'], 400);
        }
        
        // Handle cover image upload
        $cover_image = null;
        if (isset($_FILES['cover_image'])) {
            $cover_image = uploadFile($_FILES['cover_image'], 'book_covers');
            if (!$cover_image && $_FILES['cover_image']['error'] !== UPLOAD_ERR_NO_FILE) {
                sendResponse(['error' => 'Failed to upload book cover image'], 400);
            }
        }
        
        // Insert related book
        $query = "INSERT INTO related_books (blog_id, title, author, purchase_link, cover_image, description, price) 
                  VALUES (:blog_id, :title, :author, :purchase_link, :cover_image, :description, :price)";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':blog_id', $blog_id, PDO::PARAM_INT);
        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':author', $author);
        $stmt->bindParam(':purchase_link', $purchase_link);
        $stmt->bindParam(':cover_image', $cover_image);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':price', $price);
        
        $stmt->execute();
        $book_id = $db->lastInsertId();
        
        sendResponse([
            'message' => 'Related book created successfully', 
            'book_id' => $book_id,
            'cover_image' => $cover_image
        ], 201);
        
    } catch (PDOException $e) {
        sendResponse(['error' => 'Failed to create related book: ' . $e->getMessage()], 500);
    }
}

function updateRelatedBook($db) {
    try {
        // Check if this is a form data request (with files) or JSON request
        $isFormData = isset($_POST['id']);
        
        if ($isFormData) {
            // Handle form data with potential file uploads
            $id = isset($_POST['id']) ? (int)$_POST['id'] : null;
            $blog_id = isset($_POST['blog_id']) ? (int)$_POST['blog_id'] : null;
            $title = isset($_POST['title']) ? sanitizeInput($_POST['title']) : null;
            $author = isset($_POST['author']) ? sanitizeInput($_POST['author']) : '';
            $purchase_link = isset($_POST['purchase_link']) ? sanitizeInput($_POST['purchase_link']) : null;
            $description = isset($_POST['description']) ? sanitizeInput($_POST['description']) : '';
            $price = isset($_POST['price']) ? sanitizeInput($_POST['price']) : '';
            
            // Handle cover image upload for update
            $cover_image = null;
            $updateImage = false;
            
            if (isset($_FILES['cover_image']) && $_FILES['cover_image']['error'] === UPLOAD_ERR_OK) {
                $cover_image = uploadFile($_FILES['cover_image'], 'book_covers');
                if (!$cover_image) {
                    sendResponse(['error' => 'Failed to upload book cover image'], 400);
                }
                $updateImage = true;
            }
            
        } else {
            // Handle JSON data for regular updates
            $input = json_decode(file_get_contents('php://input'), true);
            
            $id = isset($input['id']) ? (int)$input['id'] : null;
            $blog_id = isset($input['blog_id']) ? (int)$input['blog_id'] : null;
            $title = isset($input['title']) ? sanitizeInput($input['title']) : null;
            $author = isset($input['author']) ? sanitizeInput($input['author']) : '';
            $purchase_link = isset($input['purchase_link']) ? sanitizeInput($input['purchase_link']) : null;
            $description = isset($input['description']) ? sanitizeInput($input['description']) : '';
            $price = isset($input['price']) ? sanitizeInput($input['price']) : '';
            $updateImage = false;
        }
        
        if (!$id || !$blog_id || !$title || !$purchase_link) {
            sendResponse(['error' => 'ID, blog ID, title, and purchase link are required'], 400);
        }
        
        // Update related book with or without cover image
        if ($updateImage) {
            $query = "UPDATE related_books SET blog_id = :blog_id, title = :title, author = :author, 
                      purchase_link = :purchase_link, cover_image = :cover_image, description = :description, 
                      price = :price WHERE id = :id";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->bindParam(':blog_id', $blog_id, PDO::PARAM_INT);
            $stmt->bindParam(':title', $title);
            $stmt->bindParam(':author', $author);
            $stmt->bindParam(':purchase_link', $purchase_link);
            $stmt->bindParam(':cover_image', $cover_image);
            $stmt->bindParam(':description', $description);
            $stmt->bindParam(':price', $price);
        } else {
            // Regular update without image changes
            $query = "UPDATE related_books SET blog_id = :blog_id, title = :title, author = :author, 
                      purchase_link = :purchase_link, description = :description, price = :price WHERE id = :id";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->bindParam(':blog_id', $blog_id, PDO::PARAM_INT);
            $stmt->bindParam(':title', $title);
            $stmt->bindParam(':author', $author);
            $stmt->bindParam(':purchase_link', $purchase_link);
            $stmt->bindParam(':description', $description);
            $stmt->bindParam(':price', $price);
        }
        
        $stmt->execute();
        
        sendResponse(['message' => 'Related book updated successfully']);
        
    } catch (PDOException $e) {
        sendResponse(['error' => 'Failed to update related book: ' . $e->getMessage()], 500);
    }
}

function deleteRelatedBook($db, $id) {
    try {
        // Get the book details first to delete associated image file
        $get_query = "SELECT cover_image FROM related_books WHERE id = :id";
        $get_stmt = $db->prepare($get_query);
        $get_stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $get_stmt->execute();
        $book = $get_stmt->fetch();
        
        // Delete the record
        $query = "DELETE FROM related_books WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            // Optionally delete the associated image file
            if ($book && $book['cover_image'] && strpos($book['cover_image'], '/uploads/') === 0) {
                $image_path = '../' . ltrim($book['cover_image'], '/');
                if (file_exists($image_path)) {
                    unlink($image_path);
                }
            }
            
            sendResponse(['message' => 'Related book deleted successfully']);
        } else {
            sendResponse(['error' => 'Related book not found'], 404);
        }
        
    } catch (PDOException $e) {
        sendResponse(['error' => 'Failed to delete related book: ' . $e->getMessage()], 500);
    }
}

// Enhanced upload function with subfolder support
function uploadFile($file, $subfolder = '') {
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