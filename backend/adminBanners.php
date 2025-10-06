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
        getBanners($db);
        break;
    
    case 'POST':
        addBanner($db);
        break;
    
    case 'PUT':
        updateBanner($db);
        break;
    
    case 'DELETE':
        if (isset($_GET['id'])) {
            deleteBanner($db, $_GET['id']);
        } else {
            sendResponse(['error' => 'Banner ID required for deletion'], 400);
        }
        break;
    
    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}

function getBanners($db) {
    try {
        $query = "SELECT b.*, bl.title as blog_title, bl.slug as blog_slug 
                  FROM banner_images b 
                  LEFT JOIN blogs bl ON b.blog_id = bl.id 
                  ORDER BY b.sort_order ASC, b.created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $banners = $stmt->fetchAll();
        
        // Format banner data
        $formatted_banners = array_map(function($banner) {
            return [
                'id' => (int)$banner['id'],
                'title' => $banner['title'],
                'subtitle' => $banner['subtitle'],
                'image_url' => $banner['image_url'],
                'link_url' => $banner['link_url'],
                'blog_id' => $banner['blog_id'] ? (int)$banner['blog_id'] : null,
                'blog_title' => $banner['blog_title'],
                'blog_slug' => $banner['blog_slug'],
                'sort_order' => (int)$banner['sort_order'],
                'is_active' => (bool)$banner['is_active'],
                'created_at' => $banner['created_at']
            ];
        }, $banners);
        
        sendResponse(['banners' => $formatted_banners]);
        
    } catch (PDOException $e) {
        sendResponse(['error' => 'Database query failed: ' . $e->getMessage()], 500);
    }
}

function addBanner($db) {
    try {
        // Check banner count limit (max 4 banners)
        $count_query = "SELECT COUNT(*) as count FROM banner_images WHERE is_active = 1";
        $count_stmt = $db->prepare($count_query);
        $count_stmt->execute();
        $count_result = $count_stmt->fetch();
        
        if ($count_result['count'] >= 4) {
            sendResponse(['error' => 'Maximum of 4 active banners allowed. Please deactivate or delete an existing banner first.'], 400);
        }
        
        // Get form data
        $title = isset($_POST['title']) ? sanitizeInput($_POST['title']) : null;
        $subtitle = isset($_POST['subtitle']) ? sanitizeInput($_POST['subtitle']) : '';
        $blog_id = isset($_POST['blog_id']) ? (int)$_POST['blog_id'] : null;
        $sort_order = isset($_POST['sort_order']) ? (int)$_POST['sort_order'] : 0;
        $is_active = isset($_POST['is_active']) ? (bool)$_POST['is_active'] : true;
        
        // Validation
        if (!$title || !$blog_id) {
            sendResponse(['error' => 'Title and blog selection are required'], 400);
        }
        
        // Validate blog exists
        $blog_query = "SELECT id, slug FROM blogs WHERE id = :blog_id AND status = 'published'";
        $blog_stmt = $db->prepare($blog_query);
        $blog_stmt->bindParam(':blog_id', $blog_id, PDO::PARAM_INT);
        $blog_stmt->execute();
        $blog = $blog_stmt->fetch();
        
        if (!$blog) {
            sendResponse(['error' => 'Selected blog not found or not published'], 400);
        }
        
        // Handle file upload
        $image_url = null;
        if (isset($_FILES['banner_image'])) {
            $image_url = uploadFile($_FILES['banner_image'], 'banners');
            if (!$image_url && $_FILES['banner_image']['error'] !== UPLOAD_ERR_NO_FILE) {
                sendResponse(['error' => 'Failed to upload banner image'], 400);
            }
        }
        
        if (!$image_url) {
            sendResponse(['error' => 'Banner image is required'], 400);
        }
        
        // Auto-generate link_url from blog slug
        $link_url = '/blog/' . $blog['slug'];
        
        // Auto-adjust sort_order if not provided
        if ($sort_order === 0) {
            $max_order_query = "SELECT MAX(sort_order) as max_order FROM banner_images";
            $max_order_stmt = $db->prepare($max_order_query);
            $max_order_stmt->execute();
            $max_order_result = $max_order_stmt->fetch();
            $sort_order = ($max_order_result['max_order'] ?? 0) + 1;
        }
        
        // Insert banner
        $query = "INSERT INTO banner_images (title, subtitle, image_url, link_url, blog_id, sort_order, is_active) 
                  VALUES (:title, :subtitle, :image_url, :link_url, :blog_id, :sort_order, :is_active)";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':subtitle', $subtitle);
        $stmt->bindParam(':image_url', $image_url);
        $stmt->bindParam(':link_url', $link_url);
        $stmt->bindParam(':blog_id', $blog_id, PDO::PARAM_INT);
        $stmt->bindParam(':sort_order', $sort_order, PDO::PARAM_INT);
        $stmt->bindParam(':is_active', $is_active, PDO::PARAM_BOOL);
        
        $stmt->execute();
        $banner_id = $db->lastInsertId();
        
        sendResponse([
            'message' => 'Banner created successfully', 
            'banner_id' => $banner_id,
            'image_url' => $image_url,
            'link_url' => $link_url
        ], 201);
        
    } catch (PDOException $e) {
        sendResponse(['error' => 'Failed to create banner: ' . $e->getMessage()], 500);
    }
}

function updateBanner($db) {
    try {
        // Check if this is a form data request (with files) or JSON request
        $isFormData = isset($_POST['id']);
        
        if ($isFormData) {
            // Handle form data with potential file uploads
            $id = isset($_POST['id']) ? (int)$_POST['id'] : null;
            $title = isset($_POST['title']) ? sanitizeInput($_POST['title']) : null;
            $subtitle = isset($_POST['subtitle']) ? sanitizeInput($_POST['subtitle']) : '';
            $blog_id = isset($_POST['blog_id']) ? (int)$_POST['blog_id'] : null;
            $sort_order = isset($_POST['sort_order']) ? (int)$_POST['sort_order'] : 0;
            $is_active = isset($_POST['is_active']) ? (bool)$_POST['is_active'] : true;
            
            // Handle file upload for update
            $image_url = null;
            $updateImage = false;
            
            if (isset($_FILES['banner_image']) && $_FILES['banner_image']['error'] === UPLOAD_ERR_OK) {
                $image_url = uploadFile($_FILES['banner_image'], 'banners');
                if (!$image_url) {
                    sendResponse(['error' => 'Failed to upload banner image'], 400);
                }
                $updateImage = true;
            }
            
        } else {
            // Handle JSON data for regular updates
            $input = json_decode(file_get_contents('php://input'), true);
            
            $id = isset($input['id']) ? (int)$input['id'] : null;
            $title = isset($input['title']) ? sanitizeInput($input['title']) : null;
            $subtitle = isset($input['subtitle']) ? sanitizeInput($input['subtitle']) : '';
            $blog_id = isset($input['blog_id']) ? (int)$input['blog_id'] : null;
            $sort_order = isset($input['sort_order']) ? (int)$input['sort_order'] : 0;
            $is_active = isset($input['is_active']) ? (bool)$input['is_active'] : true;
            $updateImage = false;
        }
        
        if (!$id || !$title || !$blog_id) {
            sendResponse(['error' => 'ID, title, and blog selection are required'], 400);
        }
        
        // Validate blog exists
        $blog_query = "SELECT id, slug FROM blogs WHERE id = :blog_id AND status = 'published'";
        $blog_stmt = $db->prepare($blog_query);
        $blog_stmt->bindParam(':blog_id', $blog_id, PDO::PARAM_INT);
        $blog_stmt->execute();
        $blog = $blog_stmt->fetch();
        
        if (!$blog) {
            sendResponse(['error' => 'Selected blog not found or not published'], 400);
        }
        
        // Auto-generate link_url from blog slug
        $link_url = '/blog/' . $blog['slug'];
        
        // Update banner with or without image
        if ($updateImage) {
            $query = "UPDATE banner_images SET title = :title, subtitle = :subtitle, image_url = :image_url, 
                      link_url = :link_url, blog_id = :blog_id, sort_order = :sort_order, is_active = :is_active 
                      WHERE id = :id";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->bindParam(':title', $title);
            $stmt->bindParam(':subtitle', $subtitle);
            $stmt->bindParam(':image_url', $image_url);
            $stmt->bindParam(':link_url', $link_url);
            $stmt->bindParam(':blog_id', $blog_id, PDO::PARAM_INT);
            $stmt->bindParam(':sort_order', $sort_order, PDO::PARAM_INT);
            $stmt->bindParam(':is_active', $is_active, PDO::PARAM_BOOL);
        } else {
            // Regular update without image changes
            $query = "UPDATE banner_images SET title = :title, subtitle = :subtitle, link_url = :link_url, 
                      blog_id = :blog_id, sort_order = :sort_order, is_active = :is_active WHERE id = :id";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->bindParam(':title', $title);
            $stmt->bindParam(':subtitle', $subtitle);
            $stmt->bindParam(':link_url', $link_url);
            $stmt->bindParam(':blog_id', $blog_id, PDO::PARAM_INT);
            $stmt->bindParam(':sort_order', $sort_order, PDO::PARAM_INT);
            $stmt->bindParam(':is_active', $is_active, PDO::PARAM_BOOL);
        }
        
        $stmt->execute();
        
        sendResponse(['message' => 'Banner updated successfully', 'link_url' => $link_url]);
        
    } catch (PDOException $e) {
        sendResponse(['error' => 'Failed to update banner: ' . $e->getMessage()], 500);
    }
}

function deleteBanner($db, $id) {
    try {
        $query = "DELETE FROM banner_images WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            sendResponse(['message' => 'Banner deleted successfully']);
        } else {
            sendResponse(['error' => 'Banner not found'], 404);
        }
        
    } catch (PDOException $e) {
        sendResponse(['error' => 'Failed to delete banner: ' . $e->getMessage()], 500);
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