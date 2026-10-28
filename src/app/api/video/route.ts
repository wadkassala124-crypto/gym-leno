import { NextResponse } from 'next/server';
import { getVideoConfig, updateVideoConfig } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const video = await getVideoConfig();
    return NextResponse.json({ success: true, data: video });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch video config' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const updated = await updateVideoConfig(body);
    return NextResponse.json({ success: true, data: updated, message: 'Video config updated successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update video config' }, { status: 500 });
  }
}
