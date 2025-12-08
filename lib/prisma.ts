import { PrismaClient } from '../app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Prisma 7 configuration
const getPrismaConfig = () => {
  const databaseUrl = process.env.DATABASE_URL || '';
  
  if (databaseUrl.startsWith('prisma+')) {
    // Using Prisma Accelerate
    return {
      accelerateUrl: databaseUrl,
    };
  }
  
  // For direct PostgreSQL connections, use @prisma/adapter-pg
  if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
    try {
      const pool = new Pool({ connectionString: databaseUrl });
      const adapter = new PrismaPg(pool);
      return {
        adapter,
      };
    } catch (error) {
      console.error('Failed to create postgres adapter:', error);
      return {};
    }
  }
  
  return {};
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(getPrismaConfig() as any);

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;

