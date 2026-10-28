import { NextResponse } from 'next/server';
import {
  getFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
} from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const faqs = await getFAQs();
    return NextResponse.json({ success: true, data: faqs });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch FAQs' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.questionAr && !body.questionEn) {
      return NextResponse.json(
        { success: false, error: 'نص السؤال مطلوب' },
        { status: 400 }
      );
    }
    if (!body.answerAr && !body.answerEn) {
      return NextResponse.json(
        { success: false, error: 'نص الإجابة مطلوب' },
        { status: 400 }
      );
    }
    const newFAQ = await createFAQ(body);
    return NextResponse.json({
      success: true,
      data: newFAQ,
      message: 'تم إضافة السؤال والإجابة بنجاح',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create FAQ' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرف السؤال مطلوب (ID is required)' },
        { status: 400 }
      );
    }
    const updated = await updateFAQ(id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'السؤال غير موجود' },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      data: updated,
      message: 'تم تحديث السؤال والإجابة بنجاح',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update FAQ' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرف السؤال مطلوب (ID is required)' },
        { status: 400 }
      );
    }
    const deleted = await deleteFAQ(id);
    return NextResponse.json({
      success: deleted,
      message: deleted ? 'تم حذف السؤال بنجاح' : 'السؤال غير موجود',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete FAQ' },
      { status: 500 }
    );
  }
}
