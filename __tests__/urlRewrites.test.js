const request = require('supertest');
const express = require('express');
const { setupUrlRewrites } = require('../middleware/urlRewrites');

describe('URL Rewrites for Azure App Service Linux', () => {
  let app;

  beforeEach(() => {
    app = express();
    setupUrlRewrites(app);
    
    // Add test routes
    app.get('/api/test', (req, res) => {
      res.json({ message: 'API route working' });
    });
    
    app.get('/health', (req, res) => {
      res.json({ status: 'healthy' });
    });
    
    app.get('/', (req, res) => {
      res.send('React app fallback');
    });
  });

  test('should rewrite API routes correctly', async () => {
    const response = await request(app)
      .get('/api/test')
      .expect(200);
    
    expect(response.body.message).toBe('API route working');
  });

  test('should handle health check endpoint', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body.status).toBe('healthy');
  });

  test('should rewrite React routes to root', async () => {
    const response = await request(app)
      .get('/dashboard')
      .expect(200);
    
    expect(response.text).toBe('React app fallback');
  });

  test('should rewrite static asset routes', async () => {
    // This test verifies the rewrite rules are applied
    // The actual static file serving would be handled by express.static
    const response = await request(app)
      .get('/js/app.js')
      .expect(404); // Should fall through to React app
    
    expect(response.text).toBe('React app fallback');
  });
});
