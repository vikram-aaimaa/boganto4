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
        getBannerImages($db);
        break;
    
    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}

function getBannerImages($db) {
    try {
        // Include blog information in the query for enhanced banner functionality
        $query = "SELECT b.*, bl.slug as blog_slug, bl.title as blog_title 
                  FROM banner_images b 
                  LEFT JOIN blogs bl ON b.blog_id = bl.id 
                  WHERE b.is_active = 1 
                  ORDER BY b.sort_order ASC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $banners = $stmt->fetchAll();
        
        // Format banner data with enhanced blog linking
        $formatted_banners = array_map(function($banner) {
            return [
                'id' => (int)$banner['id'],
                'title' => $banner['title'],
                'subtitle' => $banner['subtitle'],
                'image_url' => $banner['image_url'],
                'link_url' => $banner['link_url'],
                'blog_id' => $banner['blog_id'] ? (int)$banner['blog_id'] : null,
                'blog_slug' => $banner['blog_slug'],
                'blog_title' => $banner['blog_title'],
                'sort_order' => (int)$banner['sort_order'],
                // Generate proper blog link URL from slug if available
                'blog_link' => $banner['blog_slug'] ? '/blog/' . $banner['blog_slug'] : $banner['link_url']
            ];
        }, $banners);
        
        sendResponse(['banners' => $formatted_banners]);
        
    } catch (PDOException $e) {
        sendResponse(['error' => 'Database query failed: ' . $e->getMessage()], 500);
    }
}
?>