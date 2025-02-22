// Create the API routes

import { prisma } from "@/lib/db";
import { verifyJwt } from "@/lib/jwt";
import { NextResponse } from "next/server";

// GET only the tasks created by the authenticated user
export async function GET(request: Request) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyJwt(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Fetch only tasks created by this user
    const userId = decoded.userId;
    const tasks = await prisma.task.findMany({
      where: {
        userId: userId, // Filter tasks by userId
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error fetching tasks" },
      { status: 500 }
    );
  }
}

  
export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyJwt(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { title, description } = await request.json();
    if (!title) {
      return NextResponse.json({ message: 'Title is required' }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        userId: decoded.userId, // Extract userId from JWT
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error creating task' }, { status: 500 });
  }
}
    
  