import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { mobile, email, userType } = await request.json();

    // Validate required fields
    if (!mobile || !email || !userType) {
      return NextResponse.json(
        { error: 'Missing required fields: mobile, email, userType' },
        { status: 400 }
      );
    }

    // Validate userType
    const validUserTypes = ['student', 'guest', 'parent'];
    if (!validUserTypes.includes(userType.toLowerCase())) {
      return NextResponse.json(
        { error: 'Invalid userType. Must be: student, guest, or parent' },
        { status: 400 }
      );
    }

    // Create client user
    const clientUser = await prisma.clientUser.create({
      data: {
        mobile: mobile.trim(),
        email: email.trim().toLowerCase(),
        userType: userType.toLowerCase(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'User registered successfully',
        user: clientUser,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error registering client user:', error);
    return NextResponse.json(
      { error: 'Failed to register user', details: error.message },
      { status: 500 }
    );
  }
}
