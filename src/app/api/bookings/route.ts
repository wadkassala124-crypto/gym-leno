import { NextResponse } from 'next/server';
import {
  getBookings,
  createBooking,
  updateBookingStatus,
  updateBooking,
  deleteBooking,
  getPlans,
  getPaymentMethods,
  getTrainers,
  lookupMembershipOrOrder,
} from '@/lib/db';
import { checkRateLimit, getClientIp, sanitizeString } from '@/lib/security';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lookup = searchParams.get('lookup')?.trim();

    if (lookup) {
      const match = await lookupMembershipOrOrder(lookup);
      return NextResponse.json({ success: true, data: match });
    }

    // Pass forceFresh=true to ensure we always get latest bookings from Cloud Store
    let bookings = await getBookings(true);

    const status = searchParams.get('status');
    if (status && status !== 'all') {
      bookings = bookings.filter((b) => b.status === status);
    }

    return NextResponse.json({ success: true, data: bookings });
  } catch (error) {
    console.error('Failed to fetch bookings:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);

    // Rate Limiting: Max 10 bookings per 10 minutes per IP
    const rateLimit = checkRateLimit(`booking-create:${clientIp}`, 10, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `تم تجاوز الحد المسموح لإرسال الطلبات مؤقتاً. يرجى الانتظار ${rateLimit.resetInSec} ثانية والمحاولة مجدداً.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      customerName,
      gender,
      phone,
      email,
      planId,
      preferredShift,
      paymentMethodId,
      transactionRef,
      proofImageUrl,
      trainerId,
    } = body;

    // 1. Validate & Sanitize Customer Name
    const cleanName = sanitizeString(customerName);
    if (!cleanName || cleanName.length < 2) {
      return NextResponse.json({ success: false, error: 'يرجى إدخال اسم صحيح لا يقل عن حرفين' }, { status: 400 });
    }

    // 2. Validate Phone (Egypt / International valid phone format)
    const cleanPhone = (phone || '').replace(/[\s-]/g, '').trim();
    if (!cleanPhone || !/^\+?[0-9]{8,15}$/.test(cleanPhone)) {
      return NextResponse.json({ success: false, error: 'رقم الهاتف غير صالح، يرجى كتابة رقم هاتف صحيح' }, { status: 400 });
    }

    // 3. Server-side Plan & Price Verification (Prevents price tampering)
    const availablePlans = await getPlans();
    const verifiedPlan = availablePlans.find((p) => p.id === planId && p.isActive);
    if (!verifiedPlan) {
      return NextResponse.json({ success: false, error: 'الباقة المحددة غير صالحة أو غير مفعلة' }, { status: 400 });
    }

    // 4. Server-side Payment Method Verification
    const availablePayments = await getPaymentMethods();
    const verifiedPayment = availablePayments.find((pm) => pm.id === paymentMethodId && pm.isActive);
    if (!verifiedPayment) {
      return NextResponse.json({ success: false, error: 'طريقة الدفع المحددة غير مفعلة حالياً' }, { status: 400 });
    }

    // 4.1 Server-side Trainer Verification & Fee Calculation
    let trainerFeeEGP = 0;
    if (trainerId) {
      const trainers = await getTrainers();
      const verifiedTrainer = trainers.find((t) => t.id === trainerId);
      if (verifiedTrainer && typeof verifiedTrainer.priceEGP === 'number') {
        trainerFeeEGP = Math.max(0, verifiedTrainer.priceEGP);
      }
    }

    const planPriceEGP = verifiedPlan.priceEGP;
    const totalAmountEGP = planPriceEGP + trainerFeeEGP;

    // 5. Create Booking with SERVER-CALCULATED amount (Plan + Trainer) and save to persistent cloud storage
    const booking = await createBooking({
      customerName: cleanName,
      gender: gender === 'female' ? 'female' : 'male',
      phone: cleanPhone,
      email: (email || '').trim(),
      planId: verifiedPlan.id,
      trainerId: trainerId || undefined,
      planPriceEGP,
      trainerFeeEGP,
      preferredShift: (preferredShift || '').trim() || (gender === 'female' ? 'الفترة الصباحية (سيدات)' : 'الفترة المسائية (رجال)'),
      paymentMethodId: verifiedPayment.id,
      transactionRef: (transactionRef || '').trim(),
      proofImageUrl: proofImageUrl || '',
      totalAmountEGP, // strictly enforced: Plan Price + Trainer Fee
    });

    return NextResponse.json({
      success: true,
      data: booking,
      message: 'تم تسجيل طلب الاشتراك بنجاح وهو الآن قيد مراجعة واعتماد الإدارة',
    });
  } catch (error) {
    console.error('Failed to create booking:', error);
    return NextResponse.json({ success: false, error: 'فشل تسجيل الطلب' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'معرف الطلب مطلوب' }, { status: 400 });
    }

    // Check if full edit is requested
    const isFullEdit =
      body.customerName !== undefined ||
      body.phone !== undefined ||
      body.startDate !== undefined ||
      body.endDate !== undefined ||
      body.totalAmountEGP !== undefined ||
      body.planId !== undefined ||
      body.trainerId !== undefined ||
      body.preferredShift !== undefined;

    if (isFullEdit) {
      const updated = await updateBooking(id, body);
      if (!updated) {
        return NextResponse.json({ success: false, error: 'الطلب غير موجود' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        data: updated,
        message: 'تم تعديل بيانات الطلب بنجاح',
      });
    }

    // Otherwise standard status update
    const { status, adminNotes } = body;
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ success: false, error: 'حالة الطلب غير صالحة' }, { status: 400 });
    }

    const updated = await updateBookingStatus(id, status, adminNotes);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'الطلب غير موجود' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: `تم تحديث حالة الطلب إلى: ${status}`,
    });
  } catch (error) {
    console.error('Failed to update booking:', error);
    return NextResponse.json({ success: false, error: 'فشل تحديث الطلب' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id');
    if (!id) {
      try {
        const body = await req.json();
        id = body?.id;
      } catch {}
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'معرف الطلب مطلوب للحذف' }, { status: 400 });
    }

    const deleted = await deleteBooking(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'الطلب غير موجود أو تعذر حذفه' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'تم حذف الطلب بنجاح',
    });
  } catch (error) {
    console.error('Failed to delete booking:', error);
    return NextResponse.json({ success: false, error: 'فشل حذف الطلب' }, { status: 500 });
  }
}
