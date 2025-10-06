<?php
require_once 'config.php';
require_once 'auth.php';

// Start session for authentication
session_start();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        handleLogin();
        break;
    
    case 'GET':
        checkLoginStatus();
        break;
    
    case 'DELETE':
        handleLogout();
        break;
    
    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}

function handleLogin() {
    try {
        // Get JSON input
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            sendResponse(['success' => false, 'message' => 'Invalid request data'], 400);
        }
        
        $username = isset($input['username']) ? sanitizeInput($input['username']) : '';
        $password = isset($input['password']) ? $input['password'] : '';
        
        // Validate input
        if (empty($username) || empty($password)) {
            sendResponse(['success' => false, 'message' => 'Username and password are required'], 400);
        }
        
        // Check credentials in database
        $database = new DatabaseConfig();
        $db = $database->getConnection();
        
        if (!$db) {
            sendResponse(['success' => false, 'message' => 'Database connection failed'], 500);
        }
        
        // Get admin user from database
        $query = "SELECT * FROM admins WHERE username = :username AND is_active = 1";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':username', $username);
        $stmt->execute();
        $admin = $stmt->fetch();
        
        // Verify password (support both hashed and plain text for backward compatibility)
        $passwordValid = false;
        if ($admin) {
            // Check if password is hashed (starts with $2y$)
            if (substr($admin['password'], 0, 4) === '$2y$') {
                $passwordValid = password_verify($password, $admin['password']);
            } else {
                // Fallback for plain text passwords (backward compatibility)
                $passwordValid = ($admin['password'] === $password);
            }
        }
        
        // Check credentials
        if ($admin && $passwordValid) {
            // Update last login time
            $updateQuery = "UPDATE admins SET last_login = NOW() WHERE id = :id";
            $updateStmt = $db->prepare($updateQuery);
            $updateStmt->bindParam(':id', $admin['id']);
            $updateStmt->execute();
            // Set session variables
            $_SESSION['admin_logged_in'] = true;
            $_SESSION['admin_username'] = $username;
            $_SESSION['login_time'] = time();
            $_SESSION['last_activity'] = time();
            
            // Set session timeout (24 hours)
            $_SESSION['session_timeout'] = time() + (24 * 60 * 60);
            
            sendResponse([
                'success' => true,
                'message' => 'Login successful',
                'user' => [
                    'id' => $admin['id'],
                    'username' => $admin['username'],
                    'name' => $admin['name'],
                    'email' => $admin['email'],
                    'role' => $admin['role'],
                    'login_time' => date('Y-m-d H:i:s', $_SESSION['login_time'])
                ]
            ]);
        } else {
            // Add small delay to prevent brute force attacks
            sleep(1);
            sendResponse(['success' => false, 'message' => 'Invalid credentials'], 401);
        }
        
    } catch (Exception $e) {
        sendResponse(['success' => false, 'message' => 'Login failed: ' . $e->getMessage()], 500);
    }
}

function checkLoginStatus() {
    try {
        if (isAdminLoggedIn()) {
            sendResponse([
                'success' => true,
                'logged_in' => true,
                'user' => [
                    'username' => $_SESSION['admin_username'],
                    'login_time' => date('Y-m-d H:i:s', $_SESSION['login_time']),
                    'last_activity' => date('Y-m-d H:i:s', $_SESSION['last_activity'])
                ]
            ]);
        } else {
            sendResponse([
                'success' => true,
                'logged_in' => false,
                'message' => 'Not logged in'
            ]);
        }
    } catch (Exception $e) {
        sendResponse(['success' => false, 'message' => 'Status check failed: ' . $e->getMessage()], 500);
    }
}

function handleLogout() {
    try {
        // Clear session variables
        if (session_status() === PHP_SESSION_ACTIVE) {
            $_SESSION = [];
            
            // Delete session cookie
            if (isset($_COOKIE[session_name()])) {
                setcookie(session_name(), '', time() - 3600, '/');
            }
            
            // Destroy session
            session_destroy();
        }
        
        sendResponse([
            'success' => true,
            'message' => 'Logout successful'
        ]);
        
    } catch (Exception $e) {
        sendResponse(['success' => false, 'message' => 'Logout failed: ' . $e->getMessage()], 500);
    }
}

// Auth functions are now in auth.php
?>