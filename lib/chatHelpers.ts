import { prisma } from './prisma';

/**
 * Intent detection - simple keyword-based classification
 * TODO: Replace with ML-based intent classification if needed
 */
export function detectIntent(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('fee') || lowerMessage.includes('tuition') || lowerMessage.includes('payment')) {
    return 'FEES_INFO';
  }
  
  if (lowerMessage.includes('teacher') || lowerMessage.includes('professor') || lowerMessage.includes('hod') || 
      lowerMessage.includes('faculty') || lowerMessage.includes('staff') || lowerMessage.includes('head')) {
    return 'STAFF_INFO';
  }
  
  if (lowerMessage.includes('where') || lowerMessage.includes('location') || lowerMessage.includes('room') || 
      lowerMessage.includes('building') || lowerMessage.includes('directions') || lowerMessage.includes('find')) {
    return 'DIRECTIONS';
  }
  
  if (lowerMessage.includes('event') || lowerMessage.includes('announcement') || lowerMessage.includes('news')) {
    return 'EVENTS_INFO';
  }
  
  return 'GENERAL_INFO';
}

/**
 * Query staff information from database
 */
export async function getStaffInfo(query: string): Promise<any[]> {
  const searchTerms = query.toLowerCase().split(' ');
  
  const staff = await prisma.staff.findMany({
    where: {
      AND: searchTerms.map(term => ({
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { department: { contains: term, mode: 'insensitive' } },
          { designation: { contains: term, mode: 'insensitive' } },
        ],
      })),
      status: 'ACTIVE',
    },
    take: 5,
  });
  
  return staff;
}

/**
 * Query fee information from database
 */
export async function getFeeInfo(query: string): Promise<any[]> {
  const searchTerms = query.toLowerCase().split(' ');
  
  const fees = await prisma.fee.findMany({
    where: {
      OR: [
        { programName: { contains: query, mode: 'insensitive' } },
        { academicYear: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } },
      ],
    },
    take: 10,
  });
  
  return fees;
}

/**
 * Query room/location information from database
 */
export async function getRoomDirections(query: string): Promise<any | null> {
  const searchTerms = query.toLowerCase().split(' ');
  
  // Try to find by room code first
  const roomByCode = await prisma.room.findFirst({
    where: {
      roomCode: { contains: query, mode: 'insensitive' },
    },
  });
  
  if (roomByCode) return roomByCode;
  
  // Then try building name or floor
  const roomByBuilding = await prisma.room.findFirst({
    where: {
      OR: [
        { buildingName: { contains: query, mode: 'insensitive' } },
        { floor: { contains: query, mode: 'insensitive' } },
      ],
    },
  });
  
  return roomByBuilding;
}

