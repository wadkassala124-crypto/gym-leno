import { NextResponse } from 'next/server';
import { getMedia, addMedia, deleteMedia } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const media = await getMedia();
    return NextResponse.json({ success: true, data: media });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch media library' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, name, type, sizeFormatted, tags } = body;

    if (!url || !name) {
      return NextResponse.json({ success: false, error: 'Media URL and Name are required' }, { status: 400 });
    }

    const item = await addMedia({
      url,
      name,
      type: type || 'image',
      sizeFormatted: sizeFormatted || '1.0 MB',
      tags: tags || ['Custom'],
    });

    return NextResponse.json({ success: true, data: item, message: 'Media uploaded/registered successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to add media' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Media ID is required' }, { status: 400 });
    }
    const deleted = await deleteMedia(id);
    return NextResponse.json({ success: deleted, message: deleted ? 'Media removed' : 'Media not found' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete media' }, { status: 500 });
  }
}
