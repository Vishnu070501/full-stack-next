import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request: Request) {
  try {
    // Get token from header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ') || !JWT_SECRET) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    // Verify token with non-null assertion
    const decoded = jwt.verify(token, JWT_SECRET!) as { userId: string };

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (_error) {
    console.error('Auth error:', _error);
    return NextResponse.json(
      { message: 'Invalid token' },
      { status: 401 }
    );
  }
}