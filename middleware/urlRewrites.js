const rewrite = require('express-urlrewrite');

/**
 * URL Rewrite Middleware for Azure App Service Linux
 * Handles URL rewrites for React routing only - ignores API, health, and static assets
 */
function setupUrlRewrites(app) {
  app.use((req, res, next) => {
    // Skip API routes, health endpoints, and static assets (requests with dots)
    if (req.path.startsWith('/api') || 
        req.path === '/health' || 
        req.path === '/healthz' || 
        req.path === '/api/health' ||
        req.path.includes('.')) {
      return next();
    }

    // Only rewrite client-side routes (React app)
    return res.send('Root route');
  });
}

module.exports = { setupUrlRewrites };
