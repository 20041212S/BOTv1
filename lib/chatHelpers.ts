import { prisma } from './prisma';

/**
<<<<<<< HEAD
 * Check if message is a simple greeting
 */
export function isGreeting(message: string): boolean {
  const lowerMessage = message.toLowerCase().trim();
  const greetingPatterns = [
    /^(hi|hello|hey|greetings|good morning|good afternoon|good evening|sup|what's up|wassup)$/i,
    /^(hi|hello|hey)\s*[!.]*$/i,
    /^(hi|hello|hey)\s+(there|everyone|all)$/i,
  ];
  
  return greetingPatterns.some(pattern => pattern.test(lowerMessage));
}

/**
 * Intent detection - improved keyword-based classification
=======
 * Intent detection - simple keyword-based classification
 * TODO: Replace with ML-based intent classification if needed
>>>>>>> a1d329e7bebded139580e38b50022b7bf31cc74a
 */
export function detectIntent(message: string): string {
  const lowerMessage = message.toLowerCase();
  
<<<<<<< HEAD
  // Check for greetings first
  if (isGreeting(message)) {
    return 'GREETING';
  }
  
  // Fees intent - expanded keywords
  if (lowerMessage.includes('fee') || lowerMessage.includes('tuition') || 
      lowerMessage.includes('payment') || lowerMessage.includes('cost') ||
      lowerMessage.includes('price') || lowerMessage.includes('charges')) {
    return 'FEES_INFO';
  }
  
  // Staff/Faculty intent - expanded keywords and department abbreviations
  if (lowerMessage.includes('teacher') || lowerMessage.includes('professor') || 
      lowerMessage.includes('hod') || lowerMessage.includes('faculty') || 
      lowerMessage.includes('staff') || lowerMessage.includes('head') ||
      lowerMessage.includes('faculties') || lowerMessage.includes('facult') ||
      lowerMessage.includes('cse') || lowerMessage.includes('computer science') ||
      lowerMessage.includes('me') || lowerMessage.includes('mechanical') ||
      lowerMessage.includes('ee') || lowerMessage.includes('electrical') ||
      lowerMessage.includes('department') || lowerMessage.includes('dept')) {
    return 'STAFF_INFO';
  }
  
  // Directions intent
  if (lowerMessage.includes('where') || lowerMessage.includes('location') || 
      lowerMessage.includes('room') || lowerMessage.includes('building') || 
      lowerMessage.includes('directions') || lowerMessage.includes('find') ||
      lowerMessage.includes('how to reach') || lowerMessage.includes('how to get')) {
    return 'DIRECTIONS';
  }
  
  // Events intent
  if (lowerMessage.includes('event') || lowerMessage.includes('announcement') || 
      lowerMessage.includes('news') || lowerMessage.includes('upcoming')) {
    return 'EVENTS_INFO';
  }
  
  // Admission intent
  if (lowerMessage.includes('admission') || lowerMessage.includes('admit') ||
      lowerMessage.includes('enroll') || lowerMessage.includes('enrollment') ||
      lowerMessage.includes('apply') || lowerMessage.includes('application')) {
    return 'ADMISSION_INFO';
  }
  
=======
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
  
>>>>>>> a1d329e7bebded139580e38b50022b7bf31cc74a
  return 'GENERAL_INFO';
}

/**
 * Query staff information from database
 */
export async function getStaffInfo(query: string): Promise<any[]> {
<<<<<<< HEAD
  const queryLower = query.toLowerCase().trim();
  
  // Department abbreviation mapping
  const deptMap: { [key: string]: string[] } = {
    'cse': ['computer science', 'cs'],
    'cs': ['computer science', 'cse'],
    'me': ['mechanical', 'mechanical engineering'],
    'ee': ['electrical', 'electrical engineering'],
    'ece': ['electronics', 'electronics and communication'],
  };
  
  // Expand department abbreviations
  const expandedTerms: string[] = [queryLower];
  for (const [abbr, fullNames] of Object.entries(deptMap)) {
    if (queryLower.includes(abbr)) {
      expandedTerms.push(...fullNames);
    }
  }
  
  // SQLite doesn't support case-insensitive mode, so fetch all active staff
  const allStaff = await prisma.staff.findMany({
    where: {
      status: 'ACTIVE',
    },
    take: 50, // Get more to filter
  });
  
  // Filter for case-insensitive matches with expanded terms
  const filtered = allStaff.filter((staff) => {
    const nameLower = staff.name.toLowerCase();
    const deptLower = staff.department.toLowerCase();
    const desigLower = staff.designation.toLowerCase();
    const emailLower = (staff.email || '').toLowerCase();
    
    // Check if any expanded term matches
    return expandedTerms.some(term => {
      // Remove common words for better matching
      const cleanTerm = term.replace(/\b(all|the|tell|me|about|names|faculties|faculty)\b/g, '').trim();
      if (!cleanTerm) return false;
      
      return nameLower.includes(cleanTerm) || 
             deptLower.includes(cleanTerm) || 
             desigLower.includes(cleanTerm) ||
             emailLower.includes(cleanTerm);
    });
  });
  
  // If no specific match, return all staff if query is generic
  if (filtered.length === 0 && (queryLower.includes('all') || queryLower.includes('facult') || queryLower.includes('staff'))) {
    return allStaff.slice(0, 10);
  }
  
  return filtered.slice(0, 10);
=======
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
>>>>>>> a1d329e7bebded139580e38b50022b7bf31cc74a
}

/**
 * Query fee information from database
 */
export async function getFeeInfo(query: string): Promise<any[]> {
<<<<<<< HEAD
  const queryLower = query.toLowerCase();
  
  // SQLite doesn't support case-insensitive mode, so fetch all fees
  // and filter in memory
  const allFees = await prisma.fee.findMany({
    take: 50, // Get more to filter
  });
  
  // Filter for case-insensitive matches
  const filtered = allFees.filter((fee) => {
    const programLower = fee.programName.toLowerCase();
    const yearLower = fee.academicYear.toLowerCase();
    const categoryLower = fee.category.toLowerCase();
    
    return programLower.includes(queryLower) || 
           yearLower.includes(queryLower) || 
           categoryLower.includes(queryLower);
  });
  
  return filtered.slice(0, 10);
=======
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
>>>>>>> a1d329e7bebded139580e38b50022b7bf31cc74a
}

/**
 * Query room/location information from database
 */
export async function getRoomDirections(query: string): Promise<any | null> {
<<<<<<< HEAD
  const queryLower = query.toLowerCase();
  
  // SQLite doesn't support case-insensitive mode, so fetch all rooms
  // and filter in memory
  const allRooms = await prisma.room.findMany({
    take: 50, // Get more to filter
  });
  
  // Try to find by room code first (exact match preferred)
  const roomByCode = allRooms.find((room) => 
    room.roomCode.toLowerCase().includes(queryLower)
  );
  
  if (roomByCode) return roomByCode;
  
  // Then try building name or floor
  const roomByBuilding = allRooms.find((room) => 
    room.buildingName.toLowerCase().includes(queryLower) ||
    room.floor.toLowerCase().includes(queryLower)
  );
  
  return roomByBuilding || null;
=======
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
>>>>>>> a1d329e7bebded139580e38b50022b7bf31cc74a
}

