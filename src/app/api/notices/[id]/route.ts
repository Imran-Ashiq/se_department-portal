import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateNoticeSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  content: z.string().min(1, 'Content is required').optional(),
  category: z.enum(['GENERAL', 'EXAMS', 'EVENTS']).optional(),
  attachmentUrl: z.string().optional(),
  attachmentType: z.string().optional(),
  thumbnailUrl: z.string().optional(),
});

// GET /api/notices/[id] - Fetch a single notice
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

    const notice = await db.notice.findUnique({
      where: { id },
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

    if (!notice) {
      return NextResponse.json({ error: 'Notice not found' }, { status: 404 });
    }

    return NextResponse.json(notice);
  } catch (error) {
    console.error('Error fetching notice:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching notice' },
      { status: 500 }
    );
  }
}

// PUT /api/notices/[id] - Update a notice
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

    const notice = await db.notice.findUnique({
      where: { id },
    });

    if (!notice) {
      return NextResponse.json({ error: 'Notice not found' }, { status: 404 });
    }

    // Check permissions: SUPER_ADMIN can edit any notice, ADMIN can only edit their own
    if (session.user.role !== 'SUPER_ADMIN' && notice.authorId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only edit your own notices' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = updateNoticeSchema.parse(body);

    const updatedNotice = await db.notice.update({
      where: { id },
      data: validatedData,
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

    return NextResponse.json(updatedNotice);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error updating notice:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating notice' },
      { status: 500 }
    );
  }
}

// DELETE /api/notices/[id] - Delete a notice
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notice = await db.notice.findUnique({
      where: { id },
    });

    if (!notice) {
      return NextResponse.json({ error: 'Notice not found' }, { status: 404 });
    }

    // Check permissions: SUPER_ADMIN can delete any notice, ADMIN can only delete their own
    if (session.user.role !== 'SUPER_ADMIN' && notice.authorId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own notices' },
        { status: 403 }
      );
    }

    await db.notice.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    console.error('Error deleting notice:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting notice' },
      { status: 500 }
    );
  }
}
