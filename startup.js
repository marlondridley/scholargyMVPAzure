const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Scholargy MVP on Azure App Service...');
console.log(`📦 Node.js version: ${process.version}`);

// Set environment variables for Azure
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PORT = process.env.PORT || 8080;

// Azure will handle npm install automatically
console.log('📦 Dependencies will be installed by Azure Oryx');

// Start the backend server
const serverPath = path.join(__dirname, 'server.js');
console.log(`📡 Starting backend server at: ${serverPath}`);

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log(`✅ node_modules found at: ${nodeModulesPath}`);
  console.log(`📦 node_modules contains: ${fs.readdirSync(nodeModulesPath).length} packages`);
} else {
  console.log(`❌ node_modules NOT FOUND at: ${nodeModulesPath}`);
  console.log(`📁 Current directory contents: ${fs.readdirSync(__dirname).join(', ')}`);
}

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