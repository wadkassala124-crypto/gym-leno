import { NextResponse } from 'next/server';
import { getPrograms, createProgram, updateProgram, deleteProgram } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const programs = await getPrograms();
    return NextResponse.json({ success: true, data: programs });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch programs' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newProg = await createProgram(body);
    return NextResponse.json({ success: true, data: newProg, message: 'Program created successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create program' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Program ID is required' }, { status: 400 });
    }
    const updated = await updateProgram(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Program not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated, message: 'Program updated successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update program' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Program ID is required' }, { status: 400 });
    }
    const deleted = await deleteProgram(id);
    return NextResponse.json({ success: deleted, message: deleted ? 'Program deleted' : 'Program not found' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete program' }, { status: 500 });
  }
}
