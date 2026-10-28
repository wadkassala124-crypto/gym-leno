import { NextResponse } from 'next/server';
import { getTrainers, createTrainer, updateTrainer, deleteTrainer } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const trainers = await getTrainers();
    return NextResponse.json({ success: true, data: trainers });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch trainers' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newTrainer = await createTrainer(body);
    return NextResponse.json({ success: true, data: newTrainer, message: 'Trainer added successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to add trainer' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Trainer ID is required' }, { status: 400 });
    }
    const updated = await updateTrainer(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Trainer not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated, message: 'Trainer updated successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update trainer' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Trainer ID is required' }, { status: 400 });
    }
    const deleted = await deleteTrainer(id);
    return NextResponse.json({ success: deleted, message: deleted ? 'Trainer removed' : 'Trainer not found' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete trainer' }, { status: 500 });
  }
}
