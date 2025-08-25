const request = require('supertest');
const express = require('express');
const path = require('path');

describe('URL Rewrites for Azure App Service Linux', () => {
  let app;

  beforeEach(() => {
    app = express();
    
    // Add test routes BEFORE setting up URL rewrites
    app.get('/api/test', (req, res) => {
      res.json({ message: 'API route working' });
    });
    
    app.get('/api/health', (req, res) => {
      res.json({ status: 'healthy' });
    });
    
    app.get('/healthz', (req, res) => {
      res.json({ status: 'healthy' });
    });
    
    // Simulate the SPA fallback logic from server.js (without URL rewrites)
    app.get('*', (req, res, next) => {
      if (req.method !== 'GET') return next();
      if (req.path.startsWith('/api')) return next();
      if (req.path === '/health' || req.path === '/healthz' || req.path === '/api/health') return next();

      // If it looks like a static file (has a dot), do NOT SPA-fallback → 404
      if (req.path.includes('.')) {
        return res.status(404).send('Not Found');
      }

      // For client routes, return fallback
      return res.status(200).send('React app fallback');
    });
  });

  test('should allow API routes to pass through', async () => {
    const response = await request(app)
      .get('/api/test')
      .expect(200);
    
    expect(response.body.message).toBe('API route working');
  });

  test('should allow health check endpoint to pass through', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);
    
    expect(response.body.status).toBe('healthy');
  });

  test('should allow healthz endpoint to pass through', async () => {
    const response = await request(app)
      .get('/healthz')
      .expect(200);
    
    expect(response.body.status).toBe('healthy');
  });

  test('should return 404 for static assets with dots', async () => {
    const response = await request(app)
      .get('/js/app.js')
      .expect(404);
    
    expect(response.text).toBe('Not Found');
  });

  test('should return 404 for CSS assets', async () => {
    const response = await request(app)
      .get('/css/style.css')
      .expect(404);
    
    expect(response.text).toBe('Not Found');
  });

  test('should return 404 for image assets', async () => {
    const response = await request(app)
      .get('/images/logo.png')
      .expect(404);
    
    expect(response.text).toBe('Not Found');
  });

  test('should rewrite React routes to fallback', async () => {
    const response = await request(app)
      .get('/dashboard')
      .expect(200);
    
    expect(response.text).toBe('React app fallback');
  });

  test('should rewrite profile route to fallback', async () => {
    const response = await request(app)
      .get('/profile')
      .expect(200);
    
    expect(response.text).toBe('React app fallback');
  });

  test('should rewrite scholarships route to fallback', async () => {
    const response = await request(app)
      .get('/scholarships')
      .expect(200);
    
    expect(response.text).toBe('React app fallback');
  });

  test('should rewrite career-forecaster route to fallback', async () => {
    const response = await request(app)
      .get('/career-forecaster')
      .expect(200);
    
    expect(response.text).toBe('React app fallback');
  });

  test('should rewrite compare-colleges route to fallback', async () => {
    const response = await request(app)
      .get('/compare-colleges')
      .expect(200);
    
    expect(response.text).toBe('React app fallback');
  });

  test('should rewrite matching route to fallback', async () => {
    const response = await request(app)
      .get('/matching')
      .expect(200);
    
    expect(response.text).toBe('React app fallback');
  });

  test('should rewrite login route to fallback', async () => {
    const response = await request(app)
      .get('/login')
      .expect(200);
    
    expect(response.text).toBe('React app fallback');
  });

  test('should rewrite register route to fallback', async () => {
    const response = await request(app)
      .get('/register')
      .expect(200);
    
    expect(response.text).toBe('React app fallback');
  });

  test('should rewrite reset-password route to fallback', async () => {
    const response = await request(app)
      .get('/reset-password')
      .expect(200);
    
    expect(response.text).toBe('React app fallback');
  });

  test('should handle unknown routes with fallback', async () => {
    const response = await request(app)
      .get('/some-unknown-route')
      .expect(200);
    
    expect(response.text).toBe('React app fallback');
  });

  test('should handle root route with fallback', async () => {
    const response = await request(app)
      .get('/')
      .expect(200);
    
    expect(response.text).toBe('React app fallback');
  });
});
