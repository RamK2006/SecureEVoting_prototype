#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting SecureVote Demo Setup...\n');

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
  console.log('📦 Installing dependencies...');
  exec('npm install', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Failed to install dependencies:', error);
      return;
    }
    console.log('✅ Dependencies installed\n');
    continueSetup();
  });
} else {
  continueSetup();
}

function continueSetup() {
  // Build shared types
  console.log('🔧 Building shared types...');
  exec('cd packages/shared-types && npm run build', (error) => {
    if (error) {
      console.error('❌ Failed to build shared types:', error);
      return;
    }
    console.log('✅ Shared types built\n');
    
    // Setup contracts
    setupContracts();
  });
}

function setupContracts() {
  console.log('⛓️  Setting up blockchain...');
  
  // Start Hardhat node
  const hardhatNode = spawn('npm', ['run', 'node'], {
    cwd: path.join(__dirname, 'apps/contracts'),
    stdio: 'pipe'
  });
  
  console.log('🔗 Starting local blockchain...');
  
  // Wait for blockchain to start, then deploy contracts
  setTimeout(() => {
    console.log('📋 Deploying smart contracts...');
    exec('cd apps/contracts && npm run deploy', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Failed to deploy contracts:', error);
        return;
      }
      console.log('✅ Smart contracts deployed\n');
      
      // Setup database
      setupDatabase();
    });
  }, 5000);
}

function setupDatabase() {
  console.log('🗄️  Setting up database...');
  
  exec('cd apps/backend && npm run db:generate && npm run db:push', (error) => {
    if (error) {
      console.error('❌ Failed to setup database:', error);
      return;
    }
    console.log('✅ Database setup complete\n');
    
    // Start services
    startServices();
  });
}

function startServices() {
  console.log('🎯 Starting all services...\n');
  
  // Start backend
  console.log('🔧 Starting backend API...');
  const backend = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'apps/backend'),
    stdio: 'inherit'
  });
  
  // Start mobile app
  setTimeout(() => {
    console.log('📱 Starting mobile app...');
    const mobile = spawn('npm', ['start'], {
      cwd: path.join(__dirname, 'apps/mobile'),
      stdio: 'inherit'
    });
  }, 3000);
  
  // Start audit portal
  setTimeout(() => {
    console.log('🌐 Starting audit portal...');
    const audit = spawn('npm', ['run', 'dev'], {
      cwd: path.join(__dirname, 'apps/audit-portal'),
      stdio: 'inherit'
    });
  }, 6000);
  
  console.log('\n🎉 Demo setup complete!');
  console.log('\n📋 Demo URLs:');
  console.log('   Backend API: http://localhost:3000');
  console.log('   Audit Portal: http://localhost:3001');
  console.log('   Mobile App: Scan QR code in terminal\n');
  console.log('📝 Test Credentials:');
  console.log('   National ID: 123456789012');
  console.log('   Password: TestPass123!');
  console.log('   Constituency: const-001\n');
  console.log('🎬 Ready for demo recording!');
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down demo...');
  process.exit(0);
});