import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { NextRequest } from 'next/server';
import { verifyJwt } from '@/lib/jwt';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyJwt(token);
    if (!decoded || !decoded.userId) {  // Fixed this line
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    if (task.userId !== decoded.userId) {  // Fixed this line
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json({ message: 'Error fetching task' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyJwt(token);
    if (!decoded || !decoded.userId) {  // Fixed this line
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, status } = await request.json();
    const { id } = params;

    // Ensure task exists and belongs to the user
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    if (task.userId !== decoded.userId) {  // Fixed this line
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title: title ?? task.title,
        description: description ?? task.description,
        status: status ?? task.status,
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error updating task' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      const token = req.headers.get('authorization')?.split(' ')[1];
      if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
  
      const decoded = verifyJwt(token);
      if (!decoded || !decoded.userId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
  
      const { id } = params;
  
      // Find the task
      const task = await prisma.task.findUnique({
        where: { id },
      });
  
      if (!task) {
        return NextResponse.json({ message: 'Task not found' }, { status: 404 });
      }
  
      // Check if the task belongs to the authenticated user
      if (task.userId !== decoded.userId) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }
  
      // Delete the task
      await prisma.task.delete({
        where: { id },
      });
  
      return NextResponse.json({ message: 'Task deleted successfully' });
    } catch (error) {
      console.error('Error deleting task:', error);
      return NextResponse.json({ message: 'Error deleting task' }, { status: 500 });
    }
  }
