// startup.js — Ensures Azure runs backend on a safe port (never 8081) & builds frontend if needed
const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Scholargy MVP on Azure App Service...');
console.log(`📦 Node.js version: ${process.version}`);

// Detect Azure environment
const runningInAzure = !!process.env.WEBSITE_SITE_NAME;
console.log(`☁️ Running in Azure: ${runningInAzure ? 'Yes' : 'No'}`);
if (runningInAzure) {
  console.log(`🔹 Azure App Name: ${process.env.WEBSITE_SITE_NAME}`);
}

// Force NODE_ENV
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// 🚀 Force default to 8080 if Azure didn't set one or set it to 8081
process.env.PORT = (process.env.PORT && process.env.PORT !== '8081')
  ? process.env.PORT
  : 8080;

// ===== 1. Build Frontend =====
try {
  const frontendPath = path.join(__dirname, 'frontend');
  const buildPath = path.join(frontendPath, 'build');

  if (runningInAzure || !fs.existsSync(buildPath)) {
    console.log('📦 Building frontend...');
    execSync('npm install', { cwd: frontendPath, stdio: 'inherit' });
    execSync('npm run build', { cwd: frontendPath, stdio: 'inherit' });
    console.log('✅ Frontend build complete.');
  } else {
    console.log('ℹ️ Frontend build already exists. Skipping rebuild.');
  }
} catch (err) {
  console.error('❌ Failed to build frontend:', err);
  process.exit(1);
}

// ===== 2. Start Backend =====
const serverPath = path.join(__dirname, 'backend', 'server.js');
console.log(`📡 Starting backend server at: ${serverPath}`);

// Ensure backend/server.js exists
if (!fs.existsSync(serverPath)) {
  console.error(`❌ Server file not found at: ${serverPath}`);
  console.log(`📁 Current directory contents: ${fs.readdirSync(__dirname).join(', ')}`);
  process.exit(1);
}

// Launch backend
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

// ===== Unified graceful shutdown =====
const shutdown = (signal) => {
  console.log(`🛑 ${signal} received - forwarding to backend...`);
  server.kill(signal);
  // Exit if backend hasn't shut down after timeout
  setTimeout(() => {
    console.warn('⚠️ Backend did not shut down in time, forcing exit.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
