const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Data files (for demo, use JSON files)
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const files = {
  blog: path.join(DATA_DIR, 'blog.json'),
  reviews: path.join(DATA_DIR, 'reviews.json'),
  bookings: path.join(DATA_DIR, 'bookings.json'),
  corpBookings: path.join(DATA_DIR, 'corpBookings.json'),
  posters: path.join(DATA_DIR, 'posters.json')
};

// Helper to read/write JSON
function readData(file) {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function writeData(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (HTML, CSS, JS, images)
app.use(express.static(path.join(__dirname, 'tour')));

// Multer for image uploads (posters/blog)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// --- BLOG API ---
app.get('/api/blog', (req, res) => {
  res.json(readData(files.blog));
});
app.post('/api/blog', upload.single('image'), (req, res) => {
  const posts = readData(files.blog);
  const { title, content } = req.body;
  let image = req.body.image;
  if (req.file) {
    image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
  }
  const post = { id: Date.now().toString(), title, content, image };
  posts.push(post);
  writeData(files.blog, posts);
  res.json(post);
});
app.delete('/api/blog/:id', (req, res) => {
  let posts = readData(files.blog);
  posts = posts.filter(p => p.id !== req.params.id);
  writeData(files.blog, posts);
  res.json({ success: true });
});

// --- REVIEWS API ---
app.get('/api/reviews/pending', (req, res) => {
  const reviews = readData(files.reviews);
  res.json(reviews.filter(r => r.status !== 'approved'));
});
app.get('/api/reviews/approved', (req, res) => {
  const reviews = readData(files.reviews);
  res.json(reviews.filter(r => r.status === 'approved'));
});
app.post('/api/reviews', (req, res) => {
  const reviews = readData(files.reviews);
  const review = { ...req.body, id: Date.now().toString(), status: 'pending', date: new Date().toISOString() };
  reviews.push(review);
  writeData(files.reviews, reviews);
  res.json(review);
});
app.post('/api/reviews/:id/approve', (req, res) => {
  const reviews = readData(files.reviews);
  const idx = reviews.findIndex(r => r.id === req.params.id);
  if (idx !== -1) {
    reviews[idx].status = 'approved';
    reviews[idx].approvedDate = new Date().toISOString();
    writeData(files.reviews, reviews);
    res.json(reviews[idx]);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});
app.post('/api/reviews/:id/reject', (req, res) => {
  let reviews = readData(files.reviews);
  reviews = reviews.filter(r => r.id !== req.params.id);
  writeData(files.reviews, reviews);
  res.json({ success: true });
});

// --- BOOKINGS API ---
app.get('/api/bookings', (req, res) => {
  res.json(readData(files.bookings));
});
app.post('/api/bookings', (req, res) => {
  const bookings = readData(files.bookings);
  const booking = { ...req.body, id: Date.now().toString(), submittedAt: new Date().toISOString(), status: 'pending' };
  bookings.push(booking);
  writeData(files.bookings, bookings);
  res.json(booking);
});
app.post('/api/bookings/:id/status', (req, res) => {
  const bookings = readData(files.bookings);
  const idx = bookings.findIndex(b => b.id === req.params.id);
  if (idx !== -1) {
    bookings[idx].status = req.body.status || 'pending';
    bookings[idx].statusUpdatedAt = new Date().toISOString();
    writeData(files.bookings, bookings);
    res.json(bookings[idx]);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

// --- CORPORATE BOOKINGS API ---
app.get('/api/corp-bookings', (req, res) => {
  res.json(readData(files.corpBookings));
});
app.post('/api/corp-bookings', (req, res) => {
  const corpBookings = readData(files.corpBookings);
  const booking = { ...req.body, id: Date.now().toString(), submitted: new Date().toISOString() };
  corpBookings.push(booking);
  writeData(files.corpBookings, corpBookings);
  res.json(booking);
});

// --- POSTERS API ---
app.get('/api/posters', (req, res) => {
  res.json(readData(files.posters));
});
app.post('/api/posters', upload.single('image'), (req, res) => {
  const posters = readData(files.posters);
  const { title, description, order } = req.body;
  let image = req.body.image;
  if (req.file) {
    image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
  }
  const poster = { id: Date.now().toString(), title, description, image, order: parseInt(order) || 1, addedAt: new Date().toISOString() };
  posters.push(poster);
  posters.sort((a, b) => (a.order || 1) - (b.order || 1));
  writeData(files.posters, posters);
  res.json(poster);
});
app.delete('/api/posters/:id', (req, res) => {
  let posters = readData(files.posters);
  posters = posters.filter(p => p.id !== req.params.id);
  writeData(files.posters, posters);
  res.json({ success: true });
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});