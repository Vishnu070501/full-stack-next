import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyJwt } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  return handleRequest(req, async (userId, id) => {
    const task = await prisma.task.findUnique({ where: { id } });

    if (!task) return NextResponse.json({ message: "Task not found" }, { status: 404 });
    if (task.userId !== userId) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    return NextResponse.json(task);
  });
}

export async function PUT(req: NextRequest) {
  return handleRequest(req, async (userId, id) => {
    const { title, description, status } = await req.json();

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return NextResponse.json({ message: "Task not found" }, { status: 404 });
    if (task.userId !== userId) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { title: title ?? task.title, description: description ?? task.description, status: status ?? task.status },
    });

    return NextResponse.json(updatedTask);
  });
}

export async function DELETE(req: NextRequest) {
  return handleRequest(req, async (userId, id) => {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return NextResponse.json({ message: "Task not found" }, { status: 404 });
    if (task.userId !== userId) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    await prisma.task.delete({ where: { id } });

    return NextResponse.json({ message: "Task deleted successfully" });
  });
}

/**
 * 🛠 Helper Function: Extracts `id` from URL and Handles Authentication
 */
async function handleRequest(req: NextRequest, callback: (userId: string, id: string) => Promise<NextResponse>) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded = verifyJwt(token);
    if (!decoded || !decoded.userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    // ✅ Extract ID from URL
    const id = req.nextUrl.pathname.split("/").pop(); 
    if (!id) return NextResponse.json({ message: "Invalid ID" }, { status: 400 });

    return await callback(decoded.userId, id);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
