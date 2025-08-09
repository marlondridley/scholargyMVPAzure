// startup.js — Fast Azure cold start with safe port & async frontend build
const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Scholargy MVP on Azure App Service...');
console.log(`📦 Node.js version: ${process.version}`);

// Detect Azure
const runningInAzure = !!process.env.WEBSITE_SITE_NAME;
console.log(`☁️ Running in Azure: ${runningInAzure ? 'Yes' : 'No'}`);
if (runningInAzure) {
  console.log(`🔹 Azure App Name: ${process.env.WEBSITE_SITE_NAME}`);
}

// Force NODE_ENV
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Enforce safe port (never 8081)
process.env.PORT =
  process.env.PORT && process.env.PORT !== '8081'
    ? process.env.PORT
    : 8080;

// ===== 1. Start Backend Immediately =====
const serverPath = path.join(__dirname, 'backend', 'server.js');
if (!fs.existsSync(serverPath)) {
  console.error(`❌ Server file not found at: ${serverPath}`);
  process.exit(1);
}
console.log(`📡 Starting backend server at: ${serverPath}`);

const server = spawn('node', [serverPath], {
  stdio: 'inherit',
  env: process.env
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`📡 Server exited with code: ${code}`);
  process.exit(code);
});

// ===== 2. Build Frontend in Background =====
const frontendPath = path.join(__dirname, 'frontend');
const buildPath = path.join(frontendPath, 'build');

if (runningInAzure && !fs.existsSync(buildPath)) {
  console.log('📦 Building frontend in background...');
  exec('npm run build', { cwd: frontendPath }, (err, stdout, stderr) => {
    if (err) {
      console.error('❌ Frontend build failed (background):', err);
    } else {
      console.log('✅ Frontend build completed in background.');
    }
  });
} else {
  console.log('ℹ️ Frontend build exists. Skipping rebuild.');
}

// ===== 3. Graceful Shutdown =====
const shutdown = (signal) => {
  console.log(`🛑 ${signal} received - shutting down gracefully...`);
  server.kill('SIGTERM');
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
