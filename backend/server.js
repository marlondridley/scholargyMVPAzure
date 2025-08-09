// ✅ Server startup with Azure-safe port handling and robust frontend serving
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// 🚀 Azure-safe port override (startup.js should also set this)
const PORT = process.env.PORT && process.env.PORT !== '8081'
  ? process.env.PORT
  : 8080;
console.log(`📢 Server starting on PORT=${PORT} (Azure override allowed)`);

// --- Middleware & Security ---

// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
}));

// Basic security
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Bot & suspicious path blocking
app.use((req, res, next) => {
  const ua = req.headers['user-agent'] || '';
  const suspiciousUA = [/bot/i, /crawler/i, /spider/i, /scanner/i, /robots/i];
  const suspiciousPaths = [/robots\d+\.txt/i, /\.env/i, /wp-admin/i, /phpmyadmin/i, /admin/i];
  
  if (suspiciousUA.some(p => p.test(ua))) {
    console.log(`🚫 Blocked suspicious request from: ${ua}`);
    return res.status(403).json({ error: 'Access denied' });
  }
  if (suspiciousPaths.some(p => p.test(req.path))) {
    console.log(`🚫 Blocked suspicious path: ${req.path}`);
    return res.status(404).json({ error: 'Not found' });
  }
  next();
});

// --- Static frontend handling ---
const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'build');
console.log(`📁 Serving static files from: ${frontendBuildPath}`);
app.use(express.static(frontendBuildPath));

// --- Startup sequence ---
const startServer = async () => {
  try {
    console.log('🔄 Initializing services...');

    // Validate environment
    const { validateEnvironment } = require('./utils/envValidation');
    validateEnvironment();

    // Connect to DB and cache
    const { connectDB, getDB } = require('./db');
    const { connectCache, checkRedisHealth } = require('./cache');
    const db = await connectDB();
    await connectCache();

    if (!db) {
      console.warn('⚠️ Database connection failed, running with mock data...');
    } else {
      console.log('✅ Database and cache connected');
    }

    // Initialize services
    await require('./services/scholarshipService').initialize();
    await require('./services/careerService').initialize();
    await require('./services/userService').initialize();
    console.log('✅ All services initialized');

    // Routes
    app.use('/api/articles', require('./routes/articles'));
    app.use('/api/institutions', require('./routes/institutions'));
    app.use('/api/probability', require('./routes/probability'));
    app.use('/api/rag', require('./routes/rag'));
    app.use('/api/scholarships', require('./routes/scholarships'));
    app.use('/api/profile', require('./routes/profile'));
    app.use('/api/search', require('./routes/search'));
    app.use('/api/matching', require('./routes/matching'));
    app.use('/api/user', require('./routes/user'));
    app.use('/api/report', require('./routes/report'));
    app.use('/api/forecaster', require('./routes/forecaster'));
    app.use(require('./routes/StudentVue'));
    console.log('✅ All API routes configured');

    // Health check
    app.get('/health', async (req, res) => {
      try {
        const redisHealth = await checkRedisHealth();
        const dbStatus = getDB() ? 'connected' : 'disconnected';
        res.json({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          services: { database: dbStatus, redis: redisHealth.status, server: 'running' },
          redis: redisHealth
        });
      } catch (error) {
        res.status(500).json({
          status: 'unhealthy',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // React SPA fallback
    app.get('*', (req, res) => {
      const indexPath = path.join(frontendBuildPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        console.error(`❌ Frontend index.html missing at ${indexPath}`);
        res.status(404).json({ error: 'Frontend not found' });
      }
    });

    // Start server
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server is live on port ${PORT}`);
    });

    // Graceful shutdown
    const shutdown = (signal) => {
      console.log(`🛑 ${signal} received - shutting down gracefully...`);
      server.close(() => {
        console.log('✅ Server closed successfully');
        process.exit(0);
      });
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Fatal: Failed to start server:', error);
    process.exit(1);
  }
};

// Global error handlers
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
  process.exit(1);
});

startServer();
