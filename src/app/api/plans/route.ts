import { NextResponse } from 'next/server';
import { getPlans, updatePlan, createPlan, deletePlan } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const plans = await getPlans();
    return NextResponse.json({ success: true, data: plans });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch plans' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newPlan = await createPlan(body);
    return NextResponse.json({ success: true, data: newPlan, message: 'Plan created successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create plan' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Plan ID is required' }, { status: 400 });
    }
    const updated = await updatePlan(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Plan not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated, message: 'Plan updated successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update plan' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Plan ID is required' }, { status: 400 });
    }
    const deleted = await deletePlan(id);
    return NextResponse.json({ success: deleted, message: deleted ? 'Plan deleted' : 'Plan not found' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete plan' }, { status: 500 });
  }
}
