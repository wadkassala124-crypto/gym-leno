import { NextResponse } from 'next/server';
import { getPaymentMethods, updatePaymentMethod } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const methods = await getPaymentMethods();
    return NextResponse.json({ success: true, data: methods });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch payment methods' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Payment method ID is required' }, { status: 400 });
    }
    const updated = await updatePaymentMethod(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Payment method not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated, message: 'Payment method updated' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update payment method' }, { status: 500 });
  }
}
