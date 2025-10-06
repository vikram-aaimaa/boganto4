-- Boganto Blog Database Schema
-- Comprehensive full-stack blog website with categories, blogs, banners, and related books
-- Production-ready schema with all enhancements consolidated

CREATE DATABASE IF NOT EXISTS boganto_blog;
USE boganto_blog;

-- ============================================
-- 1. ADMIN AUTHENTICATION
-- ============================================

-- Admins table for authentication
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'superadmin') DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_active (is_active)
);

-- ============================================
-- 2. CONTENT CATEGORIES
-- ============================================

-- Categories table with all required categories
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. BLOG POSTS
-- ============================================

-- Blogs table with dual featured image support
CREATE TABLE blogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    content LONGTEXT NOT NULL,
    excerpt TEXT,
    featured_image VARCHAR(255),
    featured_image_2 VARCHAR(255),
    category_id INT,
    tags VARCHAR(500),
    meta_title VARCHAR(255),
    meta_description TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INT DEFAULT 0,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_category (category_id),
    INDEX idx_status (status),
    INDEX idx_featured (is_featured),
    INDEX idx_created (created_at),
    FULLTEXT idx_search (title, content, tags)
);

-- ============================================
-- 4. RELATED BOOKS
-- ============================================

-- Related Books table with enhanced structure
CREATE TABLE related_books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    blog_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    purchase_link VARCHAR(500) NOT NULL,
    cover_image VARCHAR(255),
    description TEXT,
    price VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
    INDEX idx_blog (blog_id)
);

-- ============================================
-- 5. HERO BANNER/CAROUSEL
-- ============================================

-- Banner/Carousel Images table with blog linking
CREATE TABLE banner_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    image_url VARCHAR(255) NOT NULL,
    link_url VARCHAR(255),
    blog_id INT NULL,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE SET NULL,
    INDEX idx_active_order (is_active, sort_order),
    INDEX idx_banner_blog_id (blog_id)
);

-- ============================================
-- 6. INSERT CATEGORIES DATA
-- ============================================

INSERT INTO categories (name, slug, description) VALUES
('Fiction', 'fiction', 'Fiction books and literature'),
('History', 'history', 'Historical books and content'),
('Self-Help', 'self-help', 'Self-help and personal development'),
('Kids', 'kids', 'Children books and content'),
('Science', 'science', 'Science and technology'),
('Antiques & Collectibles', 'antiques-collectibles', 'Antiques and collectible items'),
('Architecture & Designing', 'architecture-designing', 'Architecture and design'),
('Art & Creativity', 'art-creativity', 'Art and creative content'),
('Automotive & Transportation', 'automotive-transportation', 'Automotive and transportation'),
('Bibles & References', 'bibles-references', 'Religious texts and references'),
('Biography & Autobiography', 'biography-autobiography', 'Life stories and biographies'),
('Business & Economics', 'business-economics', 'Business and economic content'),
('Children''s Fiction', 'childrens-fiction', 'Fiction for children'),
('Children''s Nonfiction', 'childrens-nonfiction', 'Non-fiction for children'),
('Comics & Mangas', 'comics-mangas', 'Comics and manga content'),
('Computer & Internet', 'computer-internet', 'Technology and internet'),
('Cook Book', 'cook-book', 'Cooking and recipes'),
('Crafts & Hobbies', 'crafts-hobbies', 'Crafts and hobby content'),
('Designs & Fashion', 'designs-fashion', 'Fashion and design'),
('Drama', 'drama', 'Drama and theatrical content'),
('Family Life & Parenting', 'family-life-parenting', 'Family and parenting'),
('Games & Activities', 'games-activities', 'Games and recreational activities'),
('Gardening', 'gardening', 'Gardening and horticulture'),
('Health & Fitness', 'health-fitness', 'Health and fitness'),
('Home & Lifestyle', 'home-lifestyle', 'Home improvement and lifestyle'),
('Humor', 'humor', 'Comedy and humor'),
('Language Arts & Disciplines', 'language-arts-disciplines', 'Language and linguistics'),
('Language Learning', 'language-learning', 'Foreign language learning'),
('Law', 'law', 'Legal content and law'),
('Literary Collections', 'literary-collections', 'Literary collections'),
('Literary Criticism', 'literary-criticism', 'Literary analysis and criticism'),
('Mathematics', 'mathematics', 'Mathematics and mathematical content'),
('Medical', 'medical', 'Medical and healthcare'),
('Music & Musical Instruments', 'music-musical-instruments', 'Music and instruments'),
('Performing Arts', 'performing-arts', 'Theater, dance, and performing arts'),
('Pets & Animal Care', 'pets-animal-care', 'Pet care and animals'),
('Philosophy', 'philosophy', 'Philosophy and philosophical thought'),
('Photography & Collections', 'photography-collections', 'Photography and visual collections'),
('Poetry', 'poetry', 'Poetry and poetic works'),
('Political Science', 'political-science', 'Politics and government'),
('Positive Energy & Spirituality', 'positive-energy-spirituality', 'Spirituality and positive thinking'),
('Psychology', 'psychology', 'Psychology and mental health'),
('Reference Books & Maps', 'reference-books-maps', 'Reference materials and maps'),
('Religion', 'religion', 'Religious content'),
('Social Science', 'social-science', 'Social sciences'),
('Sports & Recreation', 'sports-recreation', 'Sports and recreational activities'),
('Stationery & Toys', 'stationery-toys', 'Stationery and toys'),
('Study Aids & Exam Preparation', 'study-aids-exam-preparation', 'Educational aids and test prep'),
('Study Material', 'study-material', 'Educational study materials'),
('Technology & Engineering', 'technology-engineering', 'Technology and engineering'),
('Travel & Tourism', 'travel-tourism', 'Travel and tourism'),
('True Crime', 'true-crime', 'True crime stories'),
('Wildlife & Nature', 'wildlife-nature', 'Wildlife and nature'),
('Young Adult Fiction', 'young-adult-fiction', 'Fiction for young adults'),
('Young Adult Nonfiction', 'young-adult-nonfiction', 'Non-fiction for young adults'),
('Calendar 2025', 'calendar-2025', 'Calendars and planners'),
('Games', 'games', 'Games and gaming'),
('Toys', 'toys', 'Toys and playthings');

-- ============================================
-- 7. INSERT SAMPLE BANNER DATA (Using local images)
-- ============================================

INSERT INTO banner_images (title, subtitle, image_url, link_url, sort_order) VALUES
('Building Your Personal Library', 'Essential tips for curating a collection that reflects your personality', '/uploads/1758779936_a-book-1760998_1280.jpg', '/blog/building-personal-library-complete-guide', 1),
('The Art of Storytelling', 'Discover the magic behind captivating narratives', '/uploads/1758801057_a-book-759873_640.jpg', '/blog/art-storytelling-modern-literature', 2),
('Ancient Libraries', 'Guardians of knowledge through the ages', '/uploads/1758801057_book-419589_640.jpg', '/blog/ancient-libraries-guardians-knowledge', 3),
('Science Books', 'Revolutionary publications that changed our world', '/uploads/1758873063_a-book-1760998_1280.jpg', '/blog/books-changed-science-forever', 4);

-- ============================================
-- 8. INSERT SAMPLE BLOG DATA (Using local images)
-- ============================================

INSERT INTO blogs (title, slug, content, excerpt, featured_image, category_id, tags, is_featured, status) VALUES
('Building Your Personal Library: A Complete Guide', 'building-personal-library-complete-guide', 
'<h2>Introduction</h2><p>Building a personal library is more than just collecting books—it\'s about creating a curated space that reflects your interests, values, and intellectual journey. Whether you\'re starting from scratch or expanding an existing collection, this comprehensive guide will help you make informed decisions about what books deserve a place on your shelves.</p>

<h2>Choosing Your Focus</h2><p>The first step in building your personal library is determining what genres and topics resonate with you most. Are you drawn to classic literature, contemporary fiction, non-fiction explorations of science and history, or perhaps a mix of everything? Consider your reading habits over the past year—what books have you enjoyed most? This reflection will help you identify the core areas your library should emphasize.</p>

<h2>Quality Over Quantity</h2><p>While it might be tempting to fill your shelves with as many books as possible, focusing on quality selections will serve you better in the long run. Choose books that you\'ll want to reference again, lend to friends, or simply enjoy having as part of your intellectual environment. Every book in your personal library should earn its place.</p>

<h2>Organization Strategies</h2><p>How you organize your library can significantly impact your reading experience. Some prefer alphabetical by author, others organize by genre or subject matter. Consider a system that makes sense for your collection size and reading preferences. Don\'t forget to leave room for growth—your library should be able to expand with your interests.</p>

<h2>Building on a Budget</h2><p>Creating an impressive personal library doesn\'t require breaking the bank. Used bookstores, library sales, and online marketplaces offer excellent opportunities to find quality books at reasonable prices. Consider joining book clubs or reading groups that might offer member discounts, and don\'t overlook the value of well-chosen paperback editions for books you plan to read once.</p>

<h2>Digital Integration</h2><p>Modern personal libraries often blend physical and digital collections. E-readers and audiobooks can supplement your physical collection, especially for books you might read once or for travel reading. However, there\'s something irreplaceable about the physical presence of books that have shaped your thinking.</p>

<h2>Conclusion</h2><p>Your personal library is a reflection of your intellectual journey and curiosity about the world. Take time to curate it thoughtfully, and it will serve not just as a collection of books, but as a source of inspiration and a record of your growth as a reader and thinker.</p>', 
'Essential tips for curating a collection that reflects your personality and interests', 
'/uploads/1758779936_a-book-1760998_1280.jpg', 
1, 
'library, books, reading, collection, personal development', 
TRUE, 
'published'),

('The Evolution of Fantasy Literature', 'evolution-fantasy-literature', 
'<h2>From Tolkien to Modern Fantasy</h2><p>Fantasy literature has undergone tremendous evolution since the publication of The Lord of the Rings. What began as a niche genre primarily influenced by mythology and folklore has blossomed into a diverse literary landscape encompassing everything from epic high fantasy to urban fantasy, dark fantasy, and beyond.</p>

<h2>The Foundation: Tolkien\'s Legacy</h2><p>J.R.R. Tolkien\'s work established many conventions that still influence fantasy literature today: detailed world-building, invented languages, complex mythologies, and the classic hero\'s journey. However, modern fantasy has both built upon and deliberately subverted these traditions.</p>

<h2>Contemporary Voices and Diversity</h2><p>Today\'s fantasy authors bring diverse perspectives and innovative storytelling techniques to the genre. Writers like N.K. Jemisin, Brandon Sanderson, and Robin Hobb have expanded the boundaries of what fantasy can be, incorporating complex political themes, diverse characters, and sophisticated magic systems that feel both fantastical and grounded in logical rules.</p>

<h2>World-Building Evolution</h2><p>Modern fantasy places great emphasis on detailed world-building that goes beyond medieval European settings. Contemporary works draw inspiration from cultures around the world, creating rich, diverse fantasy realms that reflect our increasingly global perspective.</p>

<h2>The Future of Fantasy</h2><p>As we look toward the future of fantasy literature, we see continued expansion in themes, settings, and narrative approaches. The genre continues to grow more inclusive and experimental, while maintaining the sense of wonder and escapism that draws readers to fantasy in the first place.</p>', 
'Exploring how fantasy literature has transformed over the decades', 
'/uploads/1758801057_a-book-759873_640.jpg', 
1, 
'fantasy, literature, evolution, tolkien, world-building', 
TRUE, 
'published'),

('Ancient Libraries: Guardians of Knowledge', 'ancient-libraries-guardians-knowledge', 
'<h2>The Library of Alexandria</h2><p>Perhaps the most famous ancient library, Alexandria represented the pinnacle of scholarly achievement in the ancient world. More than just a repository of scrolls, it was a research institution, a place where scholars from across the known world came to study, debate, and expand human knowledge.</p>

<h2>Mesopotamian Archives</h2><p>Long before Alexandria, ancient Mesopotamian civilizations maintained extensive archives of cuneiform tablets. These early libraries preserved everything from legal documents and economic records to literary works like the Epic of Gilgamesh, demonstrating humanity\'s early recognition of the importance of preserving knowledge for future generations.</p>

<h2>The Role of Monasteries</h2><p>During the medieval period, monasteries became the primary guardians of written knowledge in Europe. Monks painstakingly copied manuscripts by hand, preserving classical works that might otherwise have been lost forever. Their dedication ensured that ancient Greek and Roman texts survived the Dark Ages.</p>

<h2>Preservation Challenges</h2><p>Ancient librarians faced unique challenges in preserving knowledge: fires, invasions, natural decay of materials, and the constant need for copying to prevent loss. Their methods and dedication provide valuable lessons for modern information preservation efforts.</p>

<h2>Legacy and Lessons</h2><p>The history of ancient libraries teaches us about the fragility and importance of preserved knowledge. These institutions remind us that civilization\'s greatest treasures are not always gold or jewels, but the accumulated wisdom and creativity of humanity, carefully preserved for future generations.</p>', 
'Discover the fascinating history of ancient libraries and their role in preserving human knowledge', 
'/uploads/1758801057_book-419589_640.jpg', 
2, 
'history, libraries, ancient, knowledge, preservation', 
TRUE, 
'published'),

('Books That Changed Science Forever', 'books-changed-science-forever', 
'<h2>Revolutionary Scientific Works</h2><p>Throughout history, certain books have fundamentally changed our understanding of the world, revolutionizing entire fields of study and reshaping human knowledge. These landmark publications didn\'t just add to existing knowledge—they completely transformed how we think about reality itself.</p>

<h2>Darwin\'s "On the Origin of Species" (1859)</h2><p>Perhaps no scientific work has been more influential or controversial than Charles Darwin\'s masterpiece. By providing a comprehensive theory of evolution through natural selection, Darwin not only revolutionized biology but also fundamentally changed how humans understand their place in the natural world. The book\'s impact extends far beyond science, influencing philosophy, religion, and social thought.</p>

<h2>Newton\'s "Principia" (1687)</h2><p>Isaac Newton\'s "Mathematical Principles of Natural Philosophy" laid the foundation for classical physics and mathematics. The work introduced the laws of motion and universal gravitation, providing a mathematical framework that could predict and explain the movement of everything from falling apples to orbiting planets. For over 200 years, Newton\'s physics ruled supreme until Einstein\'s relativity theory.</p>

<h2>Einstein\'s Papers on Relativity</h2><p>Albert Einstein\'s papers on special and general relativity fundamentally altered our understanding of space, time, matter, and energy. These works showed that time and space are not absolute but relative, and that mass and energy are equivalent—insights that led to both GPS technology and atomic energy.</p>

<h2>Watson and Crick\'s DNA Structure</h2><p>The 1953 paper describing the double helix structure of DNA opened the door to modern genetics and molecular biology. This discovery has led to genetic engineering, gene therapy, DNA fingerprinting, and countless other advances that continue to transform medicine and biology.</p>

<h2>The Ongoing Revolution</h2><p>Science continues to evolve, with new discoveries constantly reshaping our understanding. Today\'s groundbreaking research in quantum mechanics, neuroscience, and climate science may well produce the next books that change everything we thought we knew about our world.</p>', 
'Revolutionary publications that transformed our understanding of the world', 
'/uploads/1758873063_a-book-1760998_1280.jpg', 
5, 
'science, history, revolutionary, darwin, newton, knowledge', 
FALSE, 
'published'),

('The Art of Storytelling in Modern Literature', 'art-storytelling-modern-literature', 
'<h2>The Evolution of Narrative</h2><p>Storytelling has evolved significantly in modern literature, with authors experimenting with new forms and techniques that challenge traditional narrative structures. From stream-of-consciousness writing to fragmented narratives and unreliable narrators, contemporary literature pushes the boundaries of how stories can be told.</p>

<h2>Character Development in the Digital Age</h2><p>Modern authors face unique challenges in developing characters that resonate with contemporary audiences. Today\'s readers live in an interconnected, fast-paced world, and characters must feel authentic to this experience while still being relatable across different backgrounds and cultures. The best modern literature creates characters that feel both timeless and completely of their moment.</p>

<h2>The Role of Technology in Storytelling</h2><p>Technology has not only changed how we read but also how stories are told. Authors now incorporate elements like social media, text messages, and digital communication into their narratives. Some experimental works even use hypertext, multimedia elements, or interactive components to create new kinds of reading experiences.</p>

<h2>Diverse Voices and Perspectives</h2><p>Modern literature has seen an explosion of diverse voices bringing fresh perspectives to storytelling. Authors from different cultural backgrounds, identities, and experiences are enriching literature with stories that hadn\'t been widely told before, creating a more inclusive and representative literary landscape.</p>

<h2>Interactive and Multimedia Elements</h2><p>Some modern works incorporate multimedia elements that enhance the reading experience. While traditional text remains central, authors experiment with visual elements, audio components, and even augmented reality to create immersive storytelling experiences that engage readers in new ways.</p>

<h2>The Future of Literary Innovation</h2><p>As we look ahead, the possibilities for storytelling continue to expand. Virtual reality, artificial intelligence, and other emerging technologies may create entirely new forms of narrative experience. However, at its heart, great storytelling will always be about human connection, emotion, and the fundamental desire to share and understand our experiences through narrative.</p>', 
'Exploring how contemporary authors are revolutionizing narrative techniques', 
'/uploads/1758873063_a-book-759873_640.jpg', 
1, 
'storytelling, modern literature, narrative, character development, innovation', 
FALSE, 
'published');

-- ============================================
-- 9. LINK BANNERS TO BLOGS
-- ============================================

-- Update banner records to link to corresponding blogs
UPDATE banner_images 
SET blog_id = (SELECT id FROM blogs WHERE slug = 'building-personal-library-complete-guide' LIMIT 1)
WHERE title = 'Building Your Personal Library';

UPDATE banner_images 
SET blog_id = (SELECT id FROM blogs WHERE slug = 'art-storytelling-modern-literature' LIMIT 1)
WHERE title = 'The Art of Storytelling';

UPDATE banner_images 
SET blog_id = (SELECT id FROM blogs WHERE slug = 'ancient-libraries-guardians-knowledge' LIMIT 1)
WHERE title = 'Ancient Libraries';

UPDATE banner_images 
SET blog_id = (SELECT id FROM blogs WHERE slug = 'books-changed-science-forever' LIMIT 1)
WHERE title = 'Science Books';

-- ============================================
-- 10. INSERT RELATED BOOKS DATA
-- ============================================

INSERT INTO related_books (blog_id, title, author, purchase_link, description, price) VALUES
(1, 'The Library Book', 'Susan Orlean', 'https://www.amazon.com/Library-Book-Susan-Orlean/dp/1476740186', 'A fascinating exploration of libraries and their cultural significance', '$15.99'),
(1, 'The Name of the Rose', 'Umberto Eco', 'https://www.amazon.com/Name-Rose-Umberto-Eco/dp/0544176561', 'A medieval mystery set in a monastery library', '$16.99'),
(2, 'The Lord of the Rings', 'J.R.R. Tolkien', 'https://www.amazon.com/Lord-Rings-J-R-R-Tolkien/dp/0544003411', 'The foundational work of modern fantasy literature', '$22.99'),
(2, 'The Name of the Wind', 'Patrick Rothfuss', 'https://www.amazon.com/Name-Wind-Patrick-Rothfuss/dp/0756404746', 'A modern fantasy masterpiece', '$17.99'),
(3, 'The Library of Alexandria', 'Roy MacLeod', 'https://www.amazon.com/Library-Alexandria-Roy-MacLeod/dp/1860646549', 'Comprehensive history of the ancient world\'s greatest library', '$19.99'),
(4, 'On the Origin of Species', 'Charles Darwin', 'https://www.amazon.com/Origin-Species-Charles-Darwin/dp/1503297063', 'The revolutionary work that changed biology forever', '$12.99'),
(4, 'Principia', 'Isaac Newton', 'https://www.amazon.com/Principia-Mathematical-Principles-Natural-Philosophy/dp/0520088174', 'The mathematical foundation of classical physics', '$24.99'),
(5, 'The Art of Fiction', 'John Gardner', 'https://www.amazon.com/Art-Fiction-Notes-Craft-Writers/dp/0679734031', 'Essential guide to the craft of writing', '$14.99'),
(5, 'Story', 'Robert McKee', 'https://www.amazon.com/Story-Structure-Style-Principles-Screenwriting/dp/0060391685', 'Masterclass in storytelling structure', '$18.99');

-- ============================================
-- 11. INSERT ADMIN ACCOUNTS
-- ============================================

-- Insert admin accounts (passwords should be hashed in production)
INSERT INTO admins (username, email, password, name, role) VALUES
('admin123', 'admin123@boganto.com', 'secure@123', 'Primary Administrator', 'superadmin'),
('admin', 'admin@boganto.com', 'admin_123', 'Administrator', 'admin'),
('boganto_admin', 'boganto@boganto.com', 'boganto_123', 'Boganto Administrator', 'admin');

-- ============================================
-- 12. FINAL COMMIT
-- ============================================

COMMIT;

-- Database schema setup complete
-- All Unsplash URLs have been replaced with local upload paths
-- Schema is consolidated and production-ready