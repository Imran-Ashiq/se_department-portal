import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: 'Rate limit test endpoint',
    timestamp: new Date().toISOString(),
    ip: req.ip ?? req.headers.get('x-forwarded-for') ?? 'unknown',
  });
}
