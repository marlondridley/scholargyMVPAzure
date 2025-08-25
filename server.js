// ✅ Best practice: Load environment variables at the very top.
require('dotenv').config();
// ✅ Add automatic error handling for all async routes.
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const app = express();

// --- Core Server Configuration ---

// 🚀 Enforce never binding to MSI's port 8081, default to 8080 for safety.
const PORT = process.env.PORT && process.env.PORT !== '8081'
  ? process.env.PORT
  : 8080;
console.log(`📢 Server starting on PORT=${PORT} (Azure override allowed)`);

// --- Security & Middleware Setup ---

// Apply rate limiting to all requests to prevent abuse.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Request logging middleware for debugging and monitoring
const { requestLogger } = require('./middleware/requestLogger');
app.use(requestLogger);

// Enable Cross-Origin Resource Sharing (CORS) for all routes.
const corsOptions = {
  origin: [
    'https://gentle-ground-0d24ae71e.1.azurestaticapps.net', // Your Azure Static Web App
    'http://localhost:3000', // Local development
    'http://localhost:3001', // Alternative local port
  ],
  credentials: true, // Allow credentials (cookies, authorization headers)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));
// Parse JSON and URL-encoded request bodies with a 10mb limit.
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Set security-related HTTP headers to protect against common attacks.
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Middleware to block suspicious user agents and path requests.
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

// --- Static File Serving ---

// Determine the path to the frontend build directory based on the environment.
let frontendBuildPath;
if (process.env.NODE_ENV === 'production') {
  frontendBuildPath = path.join(__dirname, 'public');
} else {
  // Development: Auto-detect frontend build path
  const envPath = process.env.FRONTEND_BUILD_PATH;
  if (envPath) {
    frontendBuildPath = envPath;
  } else {
    // For Azure App Service Environment deployment, frontend is in the frontend folder
    const frontendPath = path.join(__dirname, 'frontend', 'build');
    const publicPath = path.join(__dirname, 'public');
    
    if (fs.existsSync(frontendPath)) {
      frontendBuildPath = frontendPath;
    } else if (fs.existsSync(publicPath)) {
      frontendBuildPath = publicPath;
    } else {
      frontendBuildPath = path.join(__dirname, 'public'); // Final fallback
    }
  }
}
console.log(`📁 Serving static files from: ${frontendBuildPath}`);

// Serve static assets (do not auto-serve index.html here; we control SPA fallback below)
app.use(express.static(frontendBuildPath, { index: false, etag: true, maxAge: '1y' }));

// --- Lightweight test-friendly endpoints (JSON) ---
app.get('/api/test', (req, res) => {
  res.json({ message: 'API route working' });
});
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});
app.get('/healthz', (req, res) => {
  res.json({ status: 'healthy' });
});

// --- URL Rewrites for Azure App Service Linux ---
// IMPORTANT: put rewrites AFTER static so assets bypass SPA fallback logic
const { setupUrlRewrites } = require('./middleware/urlRewrites');
setupUrlRewrites(app);

/**
 * 🚀 Main server startup function.
 * Initializes database connections, services, and routes before starting the server.
 */
const startServer = async () => {
  try {
    console.log('🔄 Initializing services...');
    // Validate that all required environment variables are set.
    const { validateEnvironment } = require('./utils/envValidation');
    validateEnvironment();

    // Establish connections to the database and cache.
    const { connectDB, getDB } = require('./db');
    const { connectCache, checkRedisHealth } = require('./cache');
    await connectDB();
    await connectCache();
    console.log('✅ Database and cache connected');

    // Initialize all application services.
    const scholarshipService = require('./services/scholarshipService');
    const careerService = require('./services/careerService');
    const userService = require('./services/userService');
    await scholarshipService.initialize();
    await careerService.initialize();
    await userService.initialize();
    console.log('✅ All services initialized');

    // --- API Routes ---
    app.use('/api/articles', require('./routes/articles'));
    app.use('/api/dashboard', require('./routes/dashboard'));
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
    app.use('/api/studentvue', require('./routes/StudentVue')); // Assuming this is correct
    console.log('✅ All API routes configured');

    // --- Rich health endpoint (kept) ---
    app.get('/health', async (req, res) => {
      const redisHealth = await checkRedisHealth();
      const dbStatus = getDB() ? 'connected' : 'disconnected';
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: { database: dbStatus, redis: redisHealth.status, server: 'running' },
      });
    });

    // --- SPA Fallback for client routes only ---
    app.get('*', (req, res, next) => {
      if (req.method !== 'GET') return next();
      if (req.path.startsWith('/api')) return next();
      if (req.path === '/health' || req.path === '/healthz' || req.path === '/api/health') return next();

      // If it looks like a static file (has a dot), do NOT SPA-fallback → 404
      if (req.path.includes('.')) {
        return res.status(404).send('Not Found');
      }

      const indexPath = path.join(frontendBuildPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        return res.sendFile(indexPath);
      }
      // CI/test case where build isn't present
      return res.status(200).send('SPA fallback (index.html not found)');
    });
    
    // --- Global Express Error Handler ---
    app.use((err, req, res, next) => {
      console.error('❌ Express Error:', err.stack);
      const statusCode = err.statusCode || 500;
      const message = err.message || 'Internal Server Error';
      res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
      });
    });

    // --- Start Server ---
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server is live on port ${PORT}`);
    });

    // --- Graceful Shutdown Logic ---
    const shutdown = (signal) => {
      console.log(`🛑 ${signal} received - shutting down gracefully...`);
      server.close(() => {
        console.log('✅ Server closed successfully');
        process.exit(0);
      });
    };
    process.on('SIGTERM', shutdown('SIGTERM'));
    process.on('SIGINT', shutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Fatal: Failed to start server:', error);
    process.exit(1);
  }
};

// --- Process-level Error Handlers ---
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
  process.exit(1);
});

// Start only when run directly; export app for tests.
if (require.main === module) {
  startServer();
}
module.exports = app;
