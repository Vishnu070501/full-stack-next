import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST() {
  try {
    // Get refresh token from cookie
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken || !JWT_SECRET) {
      return NextResponse.json(
        { message: 'No refresh token' },
        { status: 401 }
      );
    }

    // Used here for verifying refresh token
    const decoded = jwt.verify(refreshToken, JWT_SECRET!) as { userId: string };

    // Used here for creating new access token
    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      JWT_SECRET!,
      { expiresIn: '15m' }
    );

    return NextResponse.json({ accessToken: newAccessToken });
  } catch (_error) {
    console.error('Refresh error:', _error);
    return NextResponse.json(
      { message: 'Invalid refresh token' },
      { status: 401 }
    );
  }
}