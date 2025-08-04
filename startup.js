const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Scholargy MVP on Azure App Service...');

// Set environment variables for Azure
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PORT = process.env.PORT || 8080;

// Start the backend server
const serverPath = path.join(__dirname, 'backend', 'server.js');
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

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  server.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  server.kill('SIGINT');
}); 