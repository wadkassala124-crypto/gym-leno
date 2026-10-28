import { Member } from './types';

export function formatEgyptianPhoneForWhatsApp(phone: string): string {
  let cleaned = (phone || '').replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0020')) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = '20' + cleaned.substring(1);
  } else if (!cleaned.startsWith('20') && cleaned.length === 10) {
    cleaned = '20' + cleaned;
  }
  return cleaned;
}

export function calculateDaysRemaining(endDate: string): number {
  if (!endDate) return 999;
  const end = new Date(endDate);
  const now = new Date();
  const utcEnd = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  const utcNow = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.ceil((utcEnd - utcNow) / (1000 * 60 * 60 * 24));
}

export interface ReminderMessageParams {
  fullName?: string;
  planName?: string;
  daysRemaining?: number;
  endDate?: string;
  membershipCode?: string;
}

export function buildWhatsAppReminderMessage(
  first: Partial<Member> | string | undefined,
  second?: string | ReminderMessageParams,
  third?: number,
  fourth?: string
): string {
  let template = '';
  let fullName = 'المشترك';
  let planName = 'الاشتراك الرياضي';
  let daysRemaining = 4;
  let endDate = '';
  let membershipCode = '';

  if (typeof first === 'string' || first === undefined) {
    template = first || '';
    if (second && typeof second === 'object') {
      fullName = second.fullName || 'المشترك';
      planName = second.planName || 'الاشتراك الرياضي';
      daysRemaining = second.daysRemaining ?? 4;
      endDate = second.endDate || '';
      membershipCode = second.membershipCode || '';
    }
  } else {
    // first is Partial<Member>
    fullName = first.fullName || 'المشترك';
    endDate = first.endDate || '';
    membershipCode = first.membershipCode || '';
    planName = typeof second === 'string' ? second : 'الاشتراك الرياضي';
    daysRemaining = typeof third === 'number' ? third : 4;
    template = fourth || '';
  }

  const defaultTemplate =
    template ||
    'مرحباً كابتن {الاسم} 💪\nنود تذكيرك من إدارة GYM & LENO بأن اشتراكك ({الباقة}) متبقي عليه {الأيام_المتبقية} أيام وسينتهي بتاريخ {تاريخ_الانتهاء}.\n\nفخورون بالتزامك ونتائجك معنا! لتجديد اشتراكك والحفاظ على استمرارية تدريبك دون انقطاع، يمكنك التجديد أونلاين عبر الرابط:\nhttps://gym-leno.vercel.app/#pricing\n\nأو يمكنك الرد مباشرة على هذه المحادثة لتأكيد التجديد.\nدمت قوياً وموفقاً دائماً! 🏋️‍♂️\nفريق GYM & LENO';

  let daysText = `${daysRemaining}`;
  if (daysRemaining <= 0) daysText = 'اليوم (ينتهي اليوم)';
  else if (daysRemaining === 1) daysText = 'يوم واحد (ينتهي غداً)';
  else if (daysRemaining === 2) daysText = 'يومان';

  return defaultTemplate
    .replace(/{الاسم}/g, fullName)
    .replace(/{الباقة}/g, planName)
    .replace(/{الأيام_المتبقية}/g, daysText)
    .replace(/{تاريخ_الانتهاء}/g, endDate)
    .replace(/{كود_العضوية}/g, membershipCode)
    .replace(/{رابط_الموقع}/g, 'https://gym-leno.vercel.app/#pricing');
}
