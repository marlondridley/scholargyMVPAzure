// startup.js — Ensures Azure runs backend on a safe port (never 8081)
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Scholargy MVP on Azure App Service...');
console.log(`📦 Node.js version: ${process.version}`);

// Force NODE_ENV and PORT defaults
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// 🚀 Force default to 8080 if Azure didn't set one or set it to 8081
process.env.PORT = (process.env.PORT && process.env.PORT !== '8081')
  ? process.env.PORT
  : 8080;

// Correctly point to backend server.js
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

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  server.kill('SIGTERM');
});
process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  server.kill('SIGINT');
});
