import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const applicationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  attachmentUrl: z.string().optional(),
});

// GET /api/applications - Fetch applications
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Students can only see their own applications
    // Admins and Super Admins can see all applications
    const where =
      session.user.role === 'STUDENT'
        ? { studentId: session.user.id }
        : {};

    const applications = await db.application.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            rollNumber: true,
          },
        },
        remarks: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching applications' },
      { status: 500 }
    );
  }
}

// POST /api/applications - Create a new application (students only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Only students can submit applications' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = applicationSchema.parse(body);

    const application = await db.application.create({
      data: {
        ...validatedData,
        studentId: session.user.id,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            rollNumber: true,
          },
        },
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error creating application:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating application' },
      { status: 500 }
    );
  }
}
