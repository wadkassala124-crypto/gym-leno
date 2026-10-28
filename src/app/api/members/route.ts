import { NextResponse } from 'next/server';
import { getMembers, createMember, updateMember, deleteMember } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const members = await getMembers();
    return NextResponse.json({ success: true, data: members });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch members' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newMember = await createMember(body);
    return NextResponse.json({ success: true, data: newMember, message: 'Member created successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create member' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Member ID is required' }, { status: 400 });
    }
    const updated = await updateMember(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Member not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated, message: 'Member updated successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update member' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Member ID is required' }, { status: 400 });
    }
    const deleted = await deleteMember(id);
    return NextResponse.json({ success: deleted, message: deleted ? 'Member deleted' : 'Member not found' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete member' }, { status: 500 });
  }
}
