const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// Data directories
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(__dirname)); // Serve static files
app.use('/uploads', express.static(UPLOADS_DIR));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        await ensureDirectoryExists(UPLOADS_DIR);
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Utility functions
async function ensureDirectoryExists(dir) {
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
    }
}

async function readDataFile(filename, defaultData = []) {
    try {
        await ensureDirectoryExists(DATA_DIR);
        const filePath = path.join(DATA_DIR, filename);
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return defaultData;
    }
}

async function writeDataFile(filename, data) {
    try {
        await ensureDirectoryExists(DATA_DIR);
        const filePath = path.join(DATA_DIR, filename);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing ${filename}:`, error);
        return false;
    }
}

// Initialize data directory
async function initializeServer() {
    await ensureDirectoryExists(DATA_DIR);
    await ensureDirectoryExists(UPLOADS_DIR);
    
    // Create initial data files if they don't exist
    const initialFiles = [
        { name: 'reviews.json', data: { pending: [], approved: [] } },
        { name: 'bookings.json', data: [] },
        { name: 'corpBookings.json', data: [] },
        { name: 'contacts.json', data: [] },
        { name: 'blogPosts.json', data: [] },
        { name: 'posters.json', data: [] }
    ];
    
    for (const file of initialFiles) {
        const exists = await readDataFile(file.name);
        if (exists.length === 0 && !exists.pending) {
            await writeDataFile(file.name, file.data);
        }
    }
}

// API Routes

// Reviews API
app.get('/api/reviews', async (req, res) => {
    try {
        const { status } = req.query;
        const reviews = await readDataFile('reviews.json', { pending: [], approved: [] });
        
        if (status === 'pending') {
            res.json(reviews.pending || []);
        } else if (status === 'approved') {
            res.json(reviews.approved || []);
        } else {
            res.json(reviews);
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

app.post('/api/reviews', async (req, res) => {
    try {
        const review = {
            ...req.body,
            id: Date.now().toString(),
            date: new Date().toISOString(),
            status: 'pending'
        };
        
        const reviews = await readDataFile('reviews.json', { pending: [], approved: [] });
        reviews.pending = reviews.pending || [];
        reviews.pending.push(review);
        
        await writeDataFile('reviews.json', reviews);
        res.status(201).json({ message: 'Review submitted successfully', review });
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit review' });
    }
});

app.post('/api/reviews/approve/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const reviews = await readDataFile('reviews.json', { pending: [], approved: [] });
        
        const reviewIndex = reviews.pending.findIndex(r => r.id === id);
        if (reviewIndex === -1) {
            return res.status(404).json({ error: 'Review not found' });
        }
        
        const [review] = reviews.pending.splice(reviewIndex, 1);
        review.approvedDate = new Date().toISOString();
        review.status = 'approved';
        
        reviews.approved = reviews.approved || [];
        reviews.approved.push(review);
        
        await writeDataFile('reviews.json', reviews);
        res.json({ message: 'Review approved successfully', review });
    } catch (error) {
        res.status(500).json({ error: 'Failed to approve review' });
    }
});

app.delete('/api/reviews/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const reviews = await readDataFile('reviews.json', { pending: [], approved: [] });
        
        reviews.pending = reviews.pending.filter(r => r.id !== id);
        reviews.approved = reviews.approved.filter(r => r.id !== id);
        
        await writeDataFile('reviews.json', reviews);
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete review' });
    }
});

// Bookings API
app.get('/api/bookings', async (req, res) => {
    try {
        const bookings = await readDataFile('bookings.json', []);
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

app.post('/api/bookings', async (req, res) => {
    try {
        const booking = {
            ...req.body,
            id: req.body.id || Date.now().toString(),
            submittedAt: new Date().toISOString(),
            status: 'pending'
        };
        
        const bookings = await readDataFile('bookings.json', []);
        bookings.push(booking);
        
        await writeDataFile('bookings.json', bookings);
        res.status(201).json({ message: 'Booking submitted successfully', booking });
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit booking' });
    }
});

app.put('/api/bookings/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, statusNote } = req.body;
        const bookings = await readDataFile('bookings.json', []);
        
        const booking = bookings.find(b => b.id === id);
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        booking.status = status;
        booking.statusUpdatedAt = new Date().toISOString();
        if (statusNote !== undefined) {
            booking.statusNote = statusNote;
            booking.noteUpdatedAt = new Date().toISOString();
        }
        
        await writeDataFile('bookings.json', bookings);
        res.json({ message: 'Booking status updated successfully', booking });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update booking status' });
    }
});

// Corporate Bookings API
app.get('/api/corp-bookings', async (req, res) => {
    try {
        const corpBookings = await readDataFile('corpBookings.json', []);
        res.json(corpBookings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch corporate bookings' });
    }
});

app.post('/api/corp-bookings', async (req, res) => {
    try {
        const corpBooking = {
            ...req.body,
            id: Date.now().toString(),
            submitted: new Date().toISOString()
        };
        
        const corpBookings = await readDataFile('corpBookings.json', []);
        corpBookings.push(corpBooking);
        
        await writeDataFile('corpBookings.json', corpBookings);
        res.status(201).json({ message: 'Corporate booking submitted successfully', corpBooking });
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit corporate booking' });
    }
});

// Contact Forms API
app.get('/api/contacts', async (req, res) => {
    try {
        const contacts = await readDataFile('contacts.json', []);
        res.json(contacts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch contact forms' });
    }
});

app.post('/api/contacts', async (req, res) => {
    try {
        const contact = {
            ...req.body,
            id: Date.now().toString(),
            submitted: new Date().toISOString()
        };
        
        const contacts = await readDataFile('contacts.json', []);
        contacts.push(contact);
        
        await writeDataFile('contacts.json', contacts);
        res.status(201).json({ message: 'Contact form submitted successfully', contact });
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit contact form' });
    }
});

app.delete('/api/contacts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const contacts = await readDataFile('contacts.json', []);
        
        const filteredContacts = contacts.filter(contact => contact.id !== id);
        await writeDataFile('contacts.json', filteredContacts);
        
        res.json({ message: 'Contact deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete contact' });
    }
});

// Blog Posts API
app.get('/api/blog', async (req, res) => {
    try {
        const blogPosts = await readDataFile('blogPosts.json', []);
        res.json(blogPosts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch blog posts' });
    }
});

app.post('/api/blog', upload.single('image'), async (req, res) => {
    try {
        const { title, content } = req.body;
        let imageUrl = '';
        
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
        } else if (req.body.image) {
            // Handle base64 image data
            imageUrl = req.body.image;
        }
        
        const blogPost = {
            id: Date.now().toString(),
            title,
            content,
            image: imageUrl,
            createdAt: new Date().toISOString()
        };
        
        const blogPosts = await readDataFile('blogPosts.json', []);
        blogPosts.push(blogPost);
        
        await writeDataFile('blogPosts.json', blogPosts);
        res.status(201).json({ message: 'Blog post created successfully', blogPost });
    } catch (error) {
        console.error('Blog creation error:', error);
        res.status(500).json({ error: 'Failed to create blog post' });
    }
});

app.put('/api/blog/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        const blogPosts = await readDataFile('blogPosts.json', []);
        
        const blogPost = blogPosts.find(post => post.id === id);
        if (!blogPost) {
            return res.status(404).json({ error: 'Blog post not found' });
        }
        
        blogPost.title = title || blogPost.title;
        blogPost.content = content || blogPost.content;
        blogPost.updatedAt = new Date().toISOString();
        
        if (req.file) {
            blogPost.image = `/uploads/${req.file.filename}`;
        } else if (req.body.image) {
            blogPost.image = req.body.image;
        }
        
        await writeDataFile('blogPosts.json', blogPosts);
        res.json({ message: 'Blog post updated successfully', blogPost });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update blog post' });
    }
});

app.delete('/api/blog/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const blogPosts = await readDataFile('blogPosts.json', []);
        
        const filteredPosts = blogPosts.filter(post => post.id !== id);
        await writeDataFile('blogPosts.json', filteredPosts);
        
        res.json({ message: 'Blog post deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete blog post' });
    }
});

// Posters API
app.get('/api/posters', async (req, res) => {
    try {
        const posters = await readDataFile('posters.json', []);
        res.json(posters);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch posters' });
    }
});

app.post('/api/posters', upload.single('image'), async (req, res) => {
    try {
        const { title, description, order } = req.body;
        let imageUrl = '';
        
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
        } else if (req.body.image) {
            imageUrl = req.body.image;
        }
        
        const poster = {
            id: Date.now().toString(),
            title,
            description,
            image: imageUrl,
            order: parseInt(order) || 1,
            addedAt: new Date().toISOString()
        };
        
        const posters = await readDataFile('posters.json', []);
        posters.push(poster);
        posters.sort((a, b) => a.order - b.order);
        
        await writeDataFile('posters.json', posters);
        res.status(201).json({ message: 'Poster created successfully', poster });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create poster' });
    }
});

app.delete('/api/posters/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const posters = await readDataFile('posters.json', []);
        
        const filteredPosters = posters.filter(poster => poster.id !== id);
        await writeDataFile('posters.json', filteredPosters);
        
        res.json({ message: 'Poster deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete poster' });
    }
});

// Statistics API
app.get('/api/stats', async (req, res) => {
    try {
        const [reviews, bookings, corpBookings, contacts, blogPosts] = await Promise.all([
            readDataFile('reviews.json', { pending: [], approved: [] }),
            readDataFile('bookings.json', []),
            readDataFile('corpBookings.json', []),
            readDataFile('contacts.json', []),
            readDataFile('blogPosts.json', [])
        ]);
        
        const stats = {
            reviews: {
                pending: (reviews.pending || []).length,
                approved: (reviews.approved || []).length,
                total: (reviews.pending || []).length + (reviews.approved || []).length
            },
            bookings: {
                total: bookings.length,
                pending: bookings.filter(b => b.status === 'pending').length,
                viewed: bookings.filter(b => b.status === 'viewed').length
            },
            corpBookings: corpBookings.length,
            contacts: contacts.length,
            blogPosts: blogPosts.length
        };
        
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Auth API (simple password-based auth for admin)
app.post('/api/auth/login', (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || 'SecurePass123!';
    
    if (password === adminPassword) {
        const token = Buffer.from(`admin:${Date.now()}`).toString('base64');
        res.json({ 
            success: true, 
            message: 'Authentication successful',
            token,
            expiresIn: 3600000 // 1 hour
        });
    } else {
        res.status(401).json({ 
            success: false, 
            message: 'Invalid credentials' 
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
        }
    }
    
    if (error.message === 'Only image files are allowed!') {
        return res.status(400).json({ error: 'Only image files are allowed!' });
    }
    
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Fallback for SPA routing
app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    // Try to serve the requested file
    const filePath = path.join(__dirname, req.path);
    res.sendFile(filePath, (err) => {
        if (err) {
            // If file doesn't exist, serve index.html (for SPA routing)
            res.sendFile(path.join(__dirname, 'index.html'));
        }
    });
});

// Start server
async function startServer() {
    try {
        await initializeServer();
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📁 Data directory: ${DATA_DIR}`);
            console.log(`📸 Uploads directory: ${UPLOADS_DIR}`);
            if (!process.env.ADMIN_PASSWORD) {
                console.log('⚠️  Using default admin password. Set ADMIN_PASSWORD environment variable in production!');
            }
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();