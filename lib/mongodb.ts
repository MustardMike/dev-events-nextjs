// lib/mongodb.ts
import mongoose, { ConnectOptions, Mongoose } from "mongoose";

/**
 * Extend NodeJS global to cache Mongoose connection across hot reloads
 * in development mode. This prevents creating multiple connections.
 */
declare global {
  // eslint-disable-next-line no-var
  var mongoose: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  };
}

// Connection URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

// Options for Mongoose connection
const options: ConnectOptions = {
  bufferCommands: false, // Disable mongoose buffering; better for performance
};

let cached = global.mongoose; // Cached connection across hot reloads

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB using Mongoose.
 * Uses cached connection if already established.
 */
async function connectToDatabase(): Promise<Mongoose> {
  if (cached.conn) {
    // Return existing connection
    return cached.conn;
  }

  if (!cached.promise) {
    // Create new connection promise
    cached.promise = mongoose.connect(MONGODB_URI, options).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectToDatabase;
