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
        getAllCategories($db);
        break;
    
    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}

function getAllCategories($db) {
    try {
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : null;
        
        $query = "SELECT c.*, COUNT(b.id) as blog_count 
                  FROM categories c 
                  LEFT JOIN blogs b ON c.id = b.category_id AND b.status = 'published'
                  GROUP BY c.id 
                  ORDER BY c.name ASC";
        
        if ($limit) {
            $query .= " LIMIT :limit";
        }
        
        $stmt = $db->prepare($query);
        
        if ($limit) {
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        }
        
        $stmt->execute();
        $categories = $stmt->fetchAll();
        
        // Format categories data
        $formatted_categories = array_map(function($category) {
            return [
                'id' => (int)$category['id'],
                'name' => $category['name'],
                'slug' => $category['slug'],
                'description' => $category['description'],
                'blog_count' => (int)$category['blog_count'],
                'created_at' => $category['created_at']
            ];
        }, $categories);
        
        sendResponse(['categories' => $formatted_categories]);
        
    } catch (PDOException $e) {
        sendResponse(['error' => 'Database query failed: ' . $e->getMessage()], 500);
    }
}
?>