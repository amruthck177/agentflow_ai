const mongoose = require('mongoose');
const dns = require('dns');
const env = require('./env');

// Set reliable public DNS servers for resolving MongoDB Atlas SRV records on Windows networks
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (dnsErr) {
  // Ignore if custom DNS cannot be set in specific runtime
}

let isConnected = false;
let memoryServer = null;

const connectDB = async () => {
  if (isConnected) return;

  try {
    if (env.MONGODB_URI) {
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 8000,
      });
      isConnected = true;
      console.log('✅ MongoDB Atlas connected successfully:', env.MONGODB_URI.replace(/:([^:@]+)@/, ':****@'));
    } else {
      // In-memory fallback for local dev without MongoDB installed
      console.log('⚠️  MONGODB_URI not set — starting in-memory MongoDB fallback...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const uri = memoryServer.getUri();
      await mongoose.connect(uri);
      isConnected = true;
      console.log('✅ In-memory MongoDB started (data will not persist between restarts)');
    }
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.log('⚠️  Starting in-memory MongoDB fallback...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const uri = memoryServer.getUri();
      await mongoose.connect(uri);
      isConnected = true;
      console.log('✅ In-memory MongoDB started (data will not persist between restarts)');
    } catch (fallbackErr) {
      console.error('❌ In-memory MongoDB also failed:', fallbackErr.message);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
  isConnected = false;
};

module.exports = { connectDB, disconnectDB };
