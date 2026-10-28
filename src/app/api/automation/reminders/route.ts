import { NextResponse } from 'next/server';
import {
  getMembersExpiringSoon,
  runAutomatedRemindersCheck,
  buildWhatsAppReminderMessage,
  recordMemberReminderSent,
  readDatabase,
  saveDatabase,
} from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customThreshold = searchParams.get('days')
      ? parseInt(searchParams.get('days')!)
      : undefined;

    const db = await readDatabase();
    const defaultTemplate =
      'مرحباً كابتن {الاسم} 💪\nنود تذكيرك من إدارة GYM & LENO بأن اشتراكك ({الباقة}) متبقي عليه {الأيام_المتبقية} أيام وسينتهي بتاريخ {تاريخ_الانتهاء}.\n\nفخورون بالتزامك ونتائجك معنا! لتجديد اشتراكك والحفاظ على استمرارية تدريبك دون انقطاع، يمكنك التجديد الآن عبر الرابط:\nhttps://gym-leno.vercel.app/#pricing\n\nأو يمكنك الرد مباشرة على هذه المحادثة لتأكيد التجديد.\nدمت قوياً وموفقاً دائماً! 🏋️‍♂️\nفريق GYM & LENO';

    const rawConfig = db.settings.reminderConfig || {
      enabled: true,
      daysThreshold: 4,
      messageTemplate: defaultTemplate,
      provider: 'direct_link',
    };

    const config = {
      ...rawConfig,
      messageTemplate: rawConfig.messageTemplate?.trim() || defaultTemplate,
    };

    const threshold = customThreshold ?? config.daysThreshold ?? 4;
    const expiringMembers = await getMembersExpiringSoon(threshold);

    const membersWithLinks = expiringMembers.map((m) => {
      const message = buildWhatsAppReminderMessage(
        m,
        m.planName,
        m.daysRemaining,
        config.messageTemplate
      );
      return {
        ...m,
        messagePreview: message,
        whatsAppUrl: `https://wa.me/${m.whatsAppPhone}?text=${encodeURIComponent(message)}`,
      };
    });

    return NextResponse.json({
      success: true,
      config,
      threshold,
      count: membersWithLinks.length,
      data: membersWithLinks,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch reminder members' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { memberId, threshold } = body;

    // Single member reminder record
    if (memberId) {
      const success = await recordMemberReminderSent(memberId);
      return NextResponse.json({
        success,
        message: success ? 'تم تسجيل إرسال التنبيه للعضو بنجاح' : 'لم يتم العثور على العضو',
      });
    }

    // Batch scan and trigger
    const scanResult = await runAutomatedRemindersCheck(threshold);
    return NextResponse.json({
      success: true,
      data: scanResult,
      message: `تم فحص التنبيهات بنجاح. يوجد ${scanResult.expiringMembersCount} مشترك متبقي على اشتراكهم ${scanResult.thresholdDays} أيام أو أقل.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to execute reminders check' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const db = await readDatabase();

    db.settings.reminderConfig = {
      ...db.settings.reminderConfig,
      ...body,
    };

    await saveDatabase(db);

    return NextResponse.json({
      success: true,
      config: db.settings.reminderConfig,
      message: 'تم حفظ إعدادات وقالب رسالة التذكير بنجاح',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update reminder settings' },
      { status: 500 }
    );
  }
}
