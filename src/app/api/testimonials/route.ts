import { NextResponse } from 'next/server';
import {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const testimonials = await getTestimonials();
    return NextResponse.json({ success: true, data: testimonials });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch testimonials' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.nameAr && !body.nameEn) {
      return NextResponse.json(
        { success: false, error: 'اسم المشترك مطلوب' },
        { status: 400 }
      );
    }
    const newTestimonial = await createTestimonial(body);
    return NextResponse.json({
      success: true,
      data: newTestimonial,
      message: 'تم إضافة رأي المشترك بنجاح',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create testimonial' },
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
        { success: false, error: 'معرف التقييم مطلوب (ID is required)' },
        { status: 400 }
      );
    }
    const updated = await updateTestimonial(id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'التقييم غير موجود' },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      data: updated,
      message: 'تم تحديث رأي المشترك بنجاح',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update testimonial' },
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
        { success: false, error: 'معرف التقييم مطلوب (ID is required)' },
        { status: 400 }
      );
    }
    const deleted = await deleteTestimonial(id);
    return NextResponse.json({
      success: deleted,
      message: deleted ? 'تم حذف التقييم بنجاح' : 'التقييم غير موجود',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete testimonial' },
      { status: 500 }
    );
  }
}
