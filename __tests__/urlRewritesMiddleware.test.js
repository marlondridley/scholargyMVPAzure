const request = require('supertest');
const express = require('express');
const { setupUrlRewrites } = require('../middleware/urlRewrites');

describe('URL Rewrites Middleware', () => {
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
    
    app.get('/health', (req, res) => {
      res.json({ status: 'healthy' });
    });
    
    app.get('/healthz', (req, res) => {
      res.json({ status: 'healthy' });
    });
    
    app.get('/', (req, res) => {
      res.send('Root route');
    });
    
    // Setup URL rewrites AFTER adding test routes
    setupUrlRewrites(app);
  });

  test('should allow API routes to pass through', async () => {
    const response = await request(app)
      .get('/api/test')
      .expect(200);
    
    expect(response.body.message).toBe('API route working');
  });

  test('should allow API health endpoint to pass through', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);
    
    expect(response.body.status).toBe('healthy');
  });

  test('should allow health endpoint to pass through', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body.status).toBe('healthy');
  });

  test('should allow healthz endpoint to pass through', async () => {
    const response = await request(app)
      .get('/healthz')
      .expect(200);
    
    expect(response.body.status).toBe('healthy');
  });

  test('should rewrite React routes to root', async () => {
    const response = await request(app)
      .get('/dashboard')
      .expect(200);
    
    expect(response.text).toBe('Root route');
  });

  test('should rewrite profile route to root', async () => {
    const response = await request(app)
      .get('/profile')
      .expect(200);
    
    expect(response.text).toBe('Root route');
  });

  test('should rewrite scholarships route to root', async () => {
    const response = await request(app)
      .get('/scholarships')
      .expect(200);
    
    expect(response.text).toBe('Root route');
  });

  test('should rewrite career-forecaster route to root', async () => {
    const response = await request(app)
      .get('/career-forecaster')
      .expect(200);
    
    expect(response.text).toBe('Root route');
  });

  test('should rewrite compare-colleges route to root', async () => {
    const response = await request(app)
      .get('/compare-colleges')
      .expect(200);
    
    expect(response.text).toBe('Root route');
  });

  test('should rewrite matching route to root', async () => {
    const response = await request(app)
      .get('/matching')
      .expect(200);
    
    expect(response.text).toBe('Root route');
  });

  test('should rewrite login route to root', async () => {
    const response = await request(app)
      .get('/login')
      .expect(200);
    
    expect(response.text).toBe('Root route');
  });

  test('should rewrite register route to root', async () => {
    const response = await request(app)
      .get('/register')
      .expect(200);
    
    expect(response.text).toBe('Root route');
  });

  test('should rewrite reset-password route to root', async () => {
    const response = await request(app)
      .get('/reset-password')
      .expect(200);
    
    expect(response.text).toBe('Root route');
  });

  test('should rewrite unknown routes to root', async () => {
    const response = await request(app)
      .get('/some-unknown-route')
      .expect(200);
    
    expect(response.text).toBe('Root route');
  });
});
