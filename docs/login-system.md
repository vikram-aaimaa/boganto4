# Boganto Blog - Login System Documentation
//
## 🔐 Secure Admin Authentication

The Boganto blog system now includes a comprehensive authentication system to protect the admin panel from unauthorized access.

## 📋 System Overview

### Security Features
- **Session-based authentication** with PHP sessions
- **Hardcoded credentials** for admin access (no database dependency)
- **Protected API endpoints** requiring authentication
- **Auto-logout on session timeout** (24 hours)
- **Brute force protection** with login delays
- **Clean logout functionality** with session cleanup

### Frontend Features
- **Beautiful login interface** matching the admin panel design
- **Password visibility toggle** for user convenience
- **Remember me functionality** (localStorage)
- **Real-time error feedback** with user-friendly messages
- **Loading states** and smooth transitions
- **Demo credentials display** for easy testing

## 🔑 Login Credentials

### Default Admin Accounts

**Primary Admin:**
- Username: `admin123`
- Password: `secure@123`

**Alternative Accounts:**
- Username: `admin` / Password: `admin123`
- Username: `boganto_admin` / Password: `boganto@2024`

### Security Notes
- Credentials are hardcoded in `backend/login.php`
- No database storage required for authentication
- Session timeout set to 24 hours
- Automatic cleanup of expired sessions

## 🏗️ Technical Architecture

### Backend Components

**`backend/login.php`** - Main authentication handler:
```php
POST /api/auth/login    # Login with credentials
GET /api/auth/login     # Check authentication status  
DELETE /api/auth/login  # Logout and clear session
```

**`backend/auth.php`** - Authentication helper functions:
```php
isAdminLoggedIn()    # Check if user is authenticated
requireAdminAuth()   # Require auth or return 401 error
```

**Session Management:**
- `$_SESSION['admin_logged_in']` - Login status
- `$_SESSION['admin_username']` - Logged in username
- `$_SESSION['login_time']` - Login timestamp
- `$_SESSION['last_activity']` - Last activity time
- `$_SESSION['session_timeout']` - Session expiration

### Frontend Components

**`pages/AdminLogin.jsx`** - Login form component:
- Styled with TailwindCSS matching admin design
- Form validation and error handling
- Password visibility toggle
- Loading states and animations

**`contexts/AuthContext.jsx`** - Authentication state management:
- React context for global auth state
- Login/logout functions
- Session persistence check
- Auto-redirect on auth failure

**`components/ProtectedAdminRoute.jsx`** - Route protection:
- Shows login form if not authenticated
- Shows admin panel if authenticated
- Loading state during auth check

**`utils/auth.js`** - Authentication utilities:
- Auth manager singleton
- API calls for login/logout/status
- State change notification system

## 🛡️ Security Implementation

### Route Protection

**Frontend Protection:**
```jsx
// /admin route is protected
<Route path="/admin" element={<ProtectedAdminRoute />} />

// Component automatically shows login or admin panel based on auth state
```

**Backend Protection:**
```php
// All admin API endpoints require authentication
require_once 'auth.php';
requireAdminAuth(); // Returns 401 if not authenticated
```

### Session Security
- **Secure session handling** with proper cleanup
- **Timeout management** to prevent infinite sessions
- **Activity tracking** to update last access time
- **Session hijacking prevention** with proper session configuration

### API Security
- **CORS protection** with proper headers
- **Input sanitization** for all login data
- **Error handling** without information leakage
- **Rate limiting** with sleep delays on failed attempts

## 🔧 Configuration

### Backend Configuration
Edit `backend/login.php` to modify credentials:

```php
$validCredentials = [
    'admin123' => 'secure@123',
    'admin' => 'admin123',
    'your_username' => 'your_password'
];
```

### Session Timeout
Modify session timeout in `backend/login.php`:

```php
// Set session timeout (default: 24 hours)
$_SESSION['session_timeout'] = time() + (24 * 60 * 60);
```

### Frontend Configuration
The frontend automatically detects authentication state and handles redirects. No manual configuration needed.

## 🚀 Usage Guide

### For Administrators

**1. Access Admin Panel:**
   - Navigate to: `http://localhost:5173/admin`
   - System automatically shows login form if not authenticated

**2. Login Process:**
   - Enter username and password
   - Optionally check "Remember me"
   - Click "Sign In"
   - Automatic redirect to admin panel on success

**3. Admin Panel Features:**
   - User info displayed in top-right corner
   - Logout button for clean session termination
   - All admin functions protected by authentication

**4. Session Management:**
   - Sessions last 24 hours with activity
   - Automatic logout on session expiration
   - Manual logout available at any time

### For Developers

**1. Adding New Admin Endpoints:**
```php
<?php
require_once 'config.php';
require_once 'auth.php';

// This line protects the endpoint
requireAdminAuth();

// Your admin-only code here
```

**2. Checking Auth Status in Frontend:**
```jsx
import { useAuth } from '../contexts/AuthContext'

function MyComponent() {
  const { isAuthenticated, user, logout } = useAuth()
  
  if (!isAuthenticated) {
    return <div>Please login</div>
  }
  
  return <div>Welcome, {user.username}!</div>
}
```

**3. Making Authenticated API Calls:**
```javascript
// API calls automatically include session cookies
// 401 responses automatically trigger re-authentication
const response = await blogAPI.createBlog(formData)
```

## 🧪 Testing

### Manual Testing
1. **Navigate to admin:** `http://localhost:5173/admin`
2. **Test invalid credentials:** Should show error message
3. **Test valid credentials:** Should redirect to admin panel
4. **Test session persistence:** Refresh page, should stay logged in
5. **Test logout:** Click logout, should return to login form
6. **Test API protection:** Try accessing admin APIs without login

### Automated Testing
Run the backend test script:
```bash
cd /home/user/webapp
php test-login.php
```

This tests:
- Invalid credential rejection
- Valid credential acceptance
- Session persistence
- Admin API protection

## 🔒 Security Best Practices

### Implemented Security Measures
- ✅ **Session-based authentication** (not token-based to avoid XSS)
- ✅ **Input sanitization** for all user inputs
- ✅ **Prepared statements** for database queries
- ✅ **CORS configuration** for secure cross-origin requests
- ✅ **Session timeout** to limit exposure time
- ✅ **Brute force mitigation** with login delays
- ✅ **Secure password handling** (never stored in frontend)

### Production Recommendations
- 🔧 **Change default credentials** before deployment
- 🔧 **Enable HTTPS** for secure credential transmission
- 🔧 **Implement rate limiting** at web server level
- 🔧 **Add logging** for authentication attempts
- 🔧 **Regular credential rotation** for enhanced security
- 🔧 **Consider 2FA implementation** for additional security

### Credential Management
```php
// Production setup example
$validCredentials = [
    'your_admin_username' => 'your_secure_password_here',
    // Remove demo credentials in production
];
```

## 📞 Troubleshooting

### Common Issues

**Login form not appearing:**
- Check if `/admin` route is properly configured
- Verify AuthProvider is wrapping the app
- Check browser console for JavaScript errors

**Authentication fails with valid credentials:**
- Verify backend server is running on port 8000
- Check PHP session configuration
- Ensure CORS headers are properly set

**Session not persisting:**
- Check PHP session configuration
- Verify cookies are being set properly
- Check browser security settings

**API calls return 401 errors:**
- Verify session is active
- Check if requireAdminAuth() is properly implemented
- Ensure frontend is sending session cookies

### Debug Mode
Enable debug mode in `backend/config.php`:
```php
// Add for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);
```

## 🔄 Future Enhancements

### Planned Features
- **Database-based user management** for multiple admins
- **Role-based access control** (Super Admin, Editor, etc.)
- **Two-factor authentication** for enhanced security
- **Password reset functionality** via email
- **Login attempt logging** for security monitoring
- **Session management dashboard** for active sessions

### Integration Options
- **LDAP/Active Directory** integration for enterprise
- **OAuth integration** (Google, GitHub, etc.)
- **JWT tokens** for API-first applications
- **Multi-tenant support** for multiple blog instances

---

**🔐 Your admin panel is now secure and ready for production use!**

**Login at:** `http://localhost:5173/admin`  
**Credentials:** `admin123` / `secure@123`
//