import { NextResponse } from 'next/server';
import {
  createSignedToken,
  verifySignedToken,
  checkRateLimit,
  getClientIp,
} from '@/lib/security';

// Allowed usernames for Yassin
const ALLOWED_USERS = ['admin', 'yassin', 'yassinanwar'];
// Specific password requested by Yassin
const REQUIRED_PASSWORD = process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD !== 'admin123'
  ? process.env.ADMIN_PASSWORD
  : 'YassinAnwar123';

export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);
    const body = await req.json();
    const { username, password, action } = body;

    // Handle Logout
    if (action === 'logout') {
      const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
      response.cookies.delete('gym_admin_token');
      return response;
    }

    // Rate Limiting: Max 8 attempts per 5 minutes per IP
    const rateLimit = checkRateLimit(`login-attempt:${clientIp}`, 8, 5 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `تم حظر محاولات الدخول مؤقتاً لحماية الحساب. يرجى الانتظار ${rateLimit.resetInSec} ثانية والمحاولة مجدداً.`,
        },
        { status: 429 }
      );
    }

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'اسم المستخدم وكلمة المرور مطلوبان' },
        { status: 400 }
      );
    }

    const cleanUser = String(username).trim().toLowerCase();
    const isUserValid = ALLOWED_USERS.includes(cleanUser);
    const isPassValid = password === REQUIRED_PASSWORD || password === 'YassinAnwar123';

    if (isUserValid && isPassValid) {
      // Generate cryptographically signed HMAC token
      const token = await createSignedToken(cleanUser);
      const response = NextResponse.json({
        success: true,
        user: { username: cleanUser, role: 'admin' },
        message: 'تم تسجيل الدخول بنجاح',
      });

      response.cookies.set('gym_admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      {
        success: false,
        error: `اسم المستخدم أو كلمة المرور غير صحيحة (المحاولات المتبقية: ${rateLimit.remaining})`,
      },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json({ success: false, error: 'فشل تسجيل الدخول' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  // Extract and verify signed token from cookie or Authorization header
  const cookieHeader = req.headers.get('cookie') || '';
  const tokenFromCookie = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith('gym_admin_token='))
    ?.replace('gym_admin_token=', '');

  const authHeader = req.headers.get('authorization')?.replace('Bearer ', '').trim();
  const token = tokenFromCookie || authHeader;

  // Cryptographically verify signature and expiration
  const verified = await verifySignedToken(token);

  return NextResponse.json({
    authenticated: Boolean(verified),
    user: verified ? { username: verified.username, role: 'admin' } : null,
  });
}
