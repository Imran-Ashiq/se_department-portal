import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateApplicationSchema = z.object({
  status: z.enum(['PENDING', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED']).optional(),
});

const remarkSchema = z.object({
  content: z.string().min(1, 'Remark content is required'),
});

// GET /api/applications/[id] - Fetch a single application
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const application = await db.application.findUnique({
      where: { id },
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
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Check permissions: Students can only see their own applications
    if (session.user.role === 'STUDENT' && application.studentId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching application' },
      { status: 500 }
    );
  }
}

// PUT /api/applications/[id] - Update application status (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can update applications' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = updateApplicationSchema.parse(body);

    const updatedApplication = await db.application.update({
      where: { id },
      data: validatedData,
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
    });

    return NextResponse.json(updatedApplication);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating application' },
      { status: 500 }
    );
  }
}

// POST /api/applications/[id]/remarks - Add a remark to an application (admin only)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can add remarks' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = remarkSchema.parse(body);

    const remark = await db.remark.create({
      data: {
        ...validatedData,
        authorId: session.user.id,
        applicationId: id,
      },
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
    });

    return NextResponse.json(remark, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error creating remark:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating remark' },
      { status: 500 }
    );
  }
}
