import { prisma } from './prisma';

export async function searchKnowledge(query: string, limit = 5) {
  if (!query || !query.trim()) return [];

  const results = await prisma.knowledge.findMany({
    where: {
      OR: [
        { text: { contains: query, mode: 'insensitive' } },
        { name: { contains: query, mode: 'insensitive' } },
      ],
    },
    take: limit,
  });

  return results;
}

