import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

// Validation schemas
const noticeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  category: z.enum(['GENERAL', 'EXAMS', 'EVENTS']),
  attachmentUrl: z.string().optional(),
  attachmentType: z.string().optional(),
  thumbnailUrl: z.string().optional(),
});

const updateNoticeSchema = noticeSchema.partial();

// GET /api/notices - Fetch all notices (accessible by all authenticated users)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    const where = category ? { category: category as 'GENERAL' | 'EXAMS' | 'EVENTS' } : {};

    const notices = await db.notice.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(notices);
  } catch (error) {
    console.error('Error fetching notices:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching notices' },
      { status: 500 }
    );
  }
}

// POST /api/notices - Create a new notice (accessible by ADMIN and SUPER_ADMIN)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = noticeSchema.parse(body);

    const notice = await db.notice.create({
      data: {
        ...validatedData,
        authorId: session.user.id,
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

    return NextResponse.json(notice, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error creating notice:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating notice' },
      { status: 500 }
    );
  }
}
