const rewrite = require('express-urlrewrite');

/**
 * URL Rewrite Middleware for Azure App Service Linux
 * Handles URL rewrites for React routing and API endpoints
 */
function setupUrlRewrites(app) {
  // API routes - ensure they're properly handled
  app.use(rewrite('/api/*', '/api/$1'));
  
  // Health check endpoint
  app.use(rewrite('/health', '/health'));
  
  // Static assets
  app.use(rewrite('/static/*', '/static/$1'));
  app.use(rewrite('/js/*', '/js/$1'));
  app.use(rewrite('/css/*', '/css/$1'));
  app.use(rewrite('/images/*', '/images/$1'));
  app.use(rewrite('/assets/*', '/assets/$1'));
  
  // Web app files
  app.use(rewrite('/favicon.ico', '/favicon.ico'));
  app.use(rewrite('/manifest.json', '/manifest.json'));
  app.use(rewrite('/robots.txt', '/robots.txt'));
  
  // React Router paths - handle client-side routing
  // These will be caught by the React app fallback
  app.use(rewrite('/dashboard', '/'));
  app.use(rewrite('/profile', '/'));
  app.use(rewrite('/scholarships', '/'));
  app.use(rewrite('/career-forecaster', '/'));
  app.use(rewrite('/compare-colleges', '/'));
  app.use(rewrite('/matching', '/'));
  app.use(rewrite('/login', '/'));
  app.use(rewrite('/register', '/'));
  app.use(rewrite('/reset-password', '/'));
  
  // Handle any other React routes
  app.use(rewrite('/*', '/'));
}

module.exports = { setupUrlRewrites };
