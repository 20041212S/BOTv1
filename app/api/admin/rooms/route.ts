import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET - List all rooms
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rooms = await prisma.room.findMany({
      orderBy: [{ buildingName: 'asc' }, { floor: 'asc' }, { roomCode: 'asc' }],
    });

    return NextResponse.json(rooms);
  } catch (error) {
    console.error('Rooms GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new room
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { roomCode, buildingName, floor, textDirections, latitude, longitude } = body;

    if (!roomCode || !buildingName || !floor) {
      return NextResponse.json(
        { error: 'Room code, building name, and floor are required' },
        { status: 400 }
      );
    }

    const room = await prisma.room.create({
      data: {
        roomCode,
        buildingName,
        floor,
        textDirections,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorId: user.userId,
        action: 'ROOM_CREATE',
        entityType: 'Room',
        entityId: room.id,
        severity: 'INFO',
      },
    });

    return NextResponse.json(room);
  } catch (error) {
    console.error('Rooms POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

