// Secret key for HMAC token signing (falls back to hardcoded salt if env not set)
const AUTH_SECRET = process.env.AUTH_SECRET || 'gym-leno-super-secure-production-key-2026';
const encoder = new TextEncoder();

export interface AdminTokenPayload {
  username: string;
  role: 'admin';
  exp: number; // Expiration timestamp (ms)
}

/**
 * 1. Cryptographically signs a token with HMAC-SHA256 using standard Web Crypto API (100% Edge & Node compatible)
 */
export async function createSignedToken(username: string, maxAgeHours: number = 24 * 7): Promise<string> {
  const payload: AdminTokenPayload = {
    username: username.toLowerCase().trim(),
    role: 'admin',
    exp: Date.now() + maxAgeHours * 60 * 60 * 1000,
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(AUTH_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payloadBase64)
  );

  const signatureBase64 = Buffer.from(signatureBuffer).toString('base64url');
  return `${payloadBase64}.${signatureBase64}`;
}

/**
 * 2. Verifies and parses a signed token using Web Crypto API verify (constant-time secure verification)
 */
export async function verifySignedToken(token: string | null | undefined): Promise<AdminTokenPayload | null> {
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return null;
  }

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadBase64, signatureBase64] = parts;

  try {
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(AUTH_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const sigBytes = Buffer.from(signatureBase64, 'base64url');
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      encoder.encode(payloadBase64)
    );

    if (!isValid) return null;

    const payload: AdminTokenPayload = JSON.parse(
      Buffer.from(payloadBase64, 'base64url').toString('utf-8')
    );

    // Check expiration
    if (!payload.exp || Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * 3. In-memory IP Rate Limiting to prevent brute-force attacks and DoS
 */
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetInSec: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetInSec: Math.ceil(windowMs / 1000) };
  }

  if (record.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetInSec: Math.max(0, Math.ceil((record.resetAt - now) / 1000)),
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: limit - record.count,
    resetInSec: Math.ceil((record.resetAt - now) / 1000),
  };
}

/**
 * 4. Helper to extract client IP safely
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return '127.0.0.1';
}

/**
 * 5. Sanitize HTML tags to prevent XSS (Cross-Site Scripting)
 */
export function sanitizeString(input: string | undefined | null): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '') // remove HTML tags
    .replace(/[<>"'&]/g, (char) => {
      switch (char) {
        case '<':
          return '&lt;';
        case '>':
          return '&gt;';
        case '"':
          return '&quot;';
        case "'":
          return '&#x27;';
        case '&':
          return '&amp;';
        default:
          return char;
      }
    })
    .trim();
}

/**
 * 6. File extension and MIME whitelist validation for images
 */
const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.heic'];

export function isAllowedImage(filename: string, mimeType: string): boolean {
  const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase();
  const isExtValid = ALLOWED_IMAGE_EXTENSIONS.includes(ext);
  const isMimeValid = ALLOWED_IMAGE_MIMES.includes(mimeType.toLowerCase());
  return isExtValid && isMimeValid;
}
