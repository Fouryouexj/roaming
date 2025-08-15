# Roaming Nomads Tours - Deployment Guide for HostAfrica.com

## 🚀 Production Deployment Checklist

### Prerequisites
- Node.js version 14+ installed on server
- Apache/Nginx web server
- SSL certificate for HTTPS
- Domain: roamingnomadstours.com

### 1. Server Setup

#### For HostAfrica Shared Hosting:
```bash
# Upload all files via FTP/cPanel File Manager
# Ensure the following directory structure:
/public_html/
├── index.html          # Landing page
├── server.js           # Node.js backend
├── package.json        # Dependencies
├── .htaccess          # Apache configuration
├── data/              # JSON databases
├── uploads/           # User uploaded files
├── img/               # Static images
└── *.html             # All tour pages
```

#### For VPS/Dedicated Server:
```bash
# Clone repository
git clone <repo-url>
cd roaming-nomads-tour

# Install dependencies
npm install

# Start production server
npm run prod
```

### 2. Environment Configuration

Create `.env` file (if not using default values):
```env
PORT=3000
NODE_ENV=production
ADMIN_PASSWORD=your_secure_admin_password
DATA_DIR=./data
UPLOADS_DIR=./uploads
```

### 3. Database Initialization

The system automatically creates these JSON files:
- `data/reviews.json` - Customer reviews
- `data/bookings.json` - Tour bookings  
- `data/corpBookings.json` - Corporate bookings
- `data/contacts.json` - Contact form submissions
- `data/blogPosts.json` - Blog articles
- `data/posters.json` - Featured destination posters

### 4. File Permissions

Ensure proper permissions:
```bash
chmod 755 data/
chmod 644 data/*.json
chmod 755 uploads/
chmod 644 uploads/*
chmod 644 *.html
chmod 644 *.js
chmod 644 *.css
```

### 5. SSL Configuration

Update `.htaccess` to force HTTPS:
```apache
# Uncomment these lines in .htaccess
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]
```

### 6. Performance Optimization

#### Enable Gzip Compression
Already configured in `.htaccess`

#### Browser Caching
Configured for 1 month for static assets

#### Image Optimization
- Compress images before upload
- Use WebP format where possible
- Implement lazy loading (already done)

### 7. Security Configuration

#### Headers (via .htaccess)
- X-Content-Type-Options: nosniff
- X-XSS-Protection: enabled
- X-Frame-Options: SAMEORIGIN
- Content Security Policy

#### File Access Protection
- Sensitive files blocked via .htaccess
- Upload directory secured

### 8. Monitoring & Maintenance

#### Log Files
```bash
# Check application logs
tail -f /var/log/apache2/error.log

# Check Node.js process
pm2 status (if using PM2)
```

#### Backup Strategy
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d)
tar -czf backup_$DATE.tar.gz data/ uploads/
```

### 9. API Endpoints

All endpoints are accessible at:
- `GET /api/reviews` - Get reviews
- `POST /api/reviews` - Submit review  
- `GET /api/bookings` - Get bookings
- `POST /api/bookings` - Create booking
- `GET /api/posters` - Get posters
- `POST /api/posters` - Upload poster
- `GET /api/stats` - Get statistics

### 10. Admin Panel Access

Access admin panel at: `https://yourdomain.com/admin.html`
Default password: `admin123` (CHANGE IMMEDIATELY)

### 11. Testing Checklist

Before going live:
- [ ] All pages load correctly
- [ ] Mobile responsive design works
- [ ] Contact forms submit successfully  
- [ ] Booking forms work with adults/kids logic
- [ ] Review system functions properly
- [ ] Image uploads work
- [ ] SSL certificate active
- [ ] All API endpoints respond
- [ ] Admin panel accessible
- [ ] Mobile toggle menu works
- [ ] Translation widget functions
- [ ] Swiper carousels work smoothly

### 12. Post-Deployment

#### DNS Configuration
Point domain to server IP:
```
A Record: @ -> [Server IP]
A Record: www -> [Server IP]
```

#### Analytics Setup
Add Google Analytics code before `</head>`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### 13. Troubleshooting

#### Common Issues:
1. **Node.js not starting**: Check port availability
2. **Images not loading**: Check file permissions  
3. **Forms not submitting**: Verify API endpoints
4. **Mobile menu not working**: Check Bootstrap JS loading

#### Support:
- Check server error logs
- Verify all dependencies installed
- Ensure proper file permissions
- Test API endpoints manually

---

## 🎯 Production URLs Structure

- **Main Site**: https://roamingnomadstours.com
- **Admin Panel**: https://roamingnomadstours.com/admin.html  
- **API Base**: https://roamingnomadstours.com/api/
- **Uploads**: https://roamingnomadstours.com/uploads/

## 📊 System Requirements

- **Minimum**: 1GB RAM, 10GB Storage
- **Recommended**: 2GB RAM, 20GB Storage
- **Bandwidth**: 100GB/month minimum
- **Node.js**: v14+ 
- **Apache**: v2.4+