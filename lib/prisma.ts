import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Lazy initialization - only create client when first accessed
function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  // Safely get and clean DATABASE_URL
  const rawDatabaseUrl = process.env.DATABASE_URL;
  if (!rawDatabaseUrl || typeof rawDatabaseUrl !== 'string') {
    throw new Error('DATABASE_URL environment variable is not set. Please add it to your .env file.');
  }
  
  // Ensure it's a string and clean it
  let databaseUrl: string;
  try {
    databaseUrl = String(rawDatabaseUrl).trim();
    if (databaseUrl) {
      databaseUrl = databaseUrl.replace(/^["']|["']$/g, '');
    }
  } catch (error) {
    throw new Error(`Failed to parse DATABASE_URL: ${error}`);
  }
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is empty after parsing.');
  }
  let client: PrismaClient;

  if (databaseUrl && databaseUrl.startsWith('file:')) {
    // SQLite - use better-sqlite3 adapter (required for Prisma 7)
    try {
      const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
      const Database = require('better-sqlite3');
      const path = require('path');
      
      // Extract database path from DATABASE_URL
      // Format: "file:./prisma/dev.db" or "file:///absolute/path" or "file://relative/path"
      let dbPath = databaseUrl.replace(/^file:/i, '').replace(/^\/+/, '');
      dbPath = dbPath.replace(/^["']|["']$/g, ''); // Remove quotes
      
      // Handle relative paths
      if (dbPath.startsWith('./')) {
        dbPath = dbPath.substring(2);
      }
      
      // Resolve to absolute path
      const absolutePath = path.resolve(process.cwd(), dbPath);
      
      // Create adapter - pass config object with url property
      const adapter = new PrismaBetterSqlite3({
        url: absolutePath,
      });
      
      client = new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : [],
      });
    } catch (error: any) {
      console.error('Failed to initialize SQLite with adapter:', error);
      console.error('Database URL:', databaseUrl);
      console.error('Error details:', error?.message, error?.stack);
      throw new Error(`Failed to initialize Prisma with SQLite: ${error?.message || error}`);
    }
  } else if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
    // PostgreSQL - use adapter
    try {
      const { PrismaPg } = require('@prisma/adapter-pg');
      const { Pool } = require('pg');
      const pool = new Pool({ connectionString: databaseUrl });
      const adapter = new PrismaPg(pool);
      client = new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : [],
      });
    } catch (error) {
      console.error('Failed to create postgres adapter:', error);
      client = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : [],
      });
    }
  } else {
    // Default: try standard client
    client = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : [],
    });
  }

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client;
  }

  return client;
}

// Export a proxy that lazily initializes the client
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
}) as PrismaClient;

export default prisma;

