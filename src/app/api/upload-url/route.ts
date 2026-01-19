import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const uploadUrlSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.string().min(1, 'File type is required'),
});

// GET /api/upload-url - Generate pre-signed URL for file upload
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get('fileName');
    const fileType = searchParams.get('fileType');

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: 'fileName and fileType are required' },
        { status: 400 }
      );
    }

    // For development, return a placeholder URL
    // In production, you would integrate with AWS S3, Cloudflare R2, or similar services
    // to generate a real pre-signed URL for secure file uploads
    
    const uploadUrl = `https://example.com/upload/${fileName}`;
    const fileUrl = `https://example.com/files/${fileName}`;

    return NextResponse.json({
      uploadUrl,
      fileUrl,
      message: 'Use the uploadUrl to upload your file directly to storage',
    });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return NextResponse.json(
      { error: 'An error occurred while generating upload URL' },
      { status: 500 }
    );
  }
}

// POST /api/upload-url - Alternative method to generate upload URL
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = uploadUrlSchema.parse(body);

    // For development, return a placeholder URL
    const uploadUrl = `https://example.com/upload/${validatedData.fileName}`;
    const fileUrl = `https://example.com/files/${validatedData.fileName}`;

    return NextResponse.json({
      uploadUrl,
      fileUrl,
      message: 'Use the uploadUrl to upload your file directly to storage',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error generating upload URL:', error);
    return NextResponse.json(
      { error: 'An error occurred while generating upload URL' },
      { status: 500 }
    );
  }
}
