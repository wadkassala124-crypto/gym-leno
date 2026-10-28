import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import fs from 'fs';
import path from 'path';
import { checkRateLimit, getClientIp, isAllowedImage } from '@/lib/security';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);

    // Rate Limiting: Max 10 proof uploads per 10 minutes per IP
    const rateLimit = checkRateLimit(`proof-upload:${clientIp}`, 10, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `تم تجاوز الحد المسموح لرفع الإيصالات مؤقتاً. يرجى الانتظار ${rateLimit.resetInSec} ثانية والمحاولة مجدداً.`,
        },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'يرجى اختيار صورة إشعار أو سكرين شوت التحويل' },
        { status: 400 }
      );
    }

    // 15 MB limit for receipts/screenshots
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: 'حجم الصورة كبير جداً. الحد الأقصى هو 15 ميجابايت' },
        { status: 400 }
      );
    }

    // Strict Security Whitelist: Only valid images (PNG, JPG, WEBP, HEIC) - No SVG/HTML/Executables
    if (!isAllowedImage(file.name, file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'نوع الملف غير مدعوم. يُسمح فقط بالصور بصيغة JPG أو PNG أو WebP أو HEIC.',
        },
        { status: 400 }
      );
    }

    // Sanitize filename to prevent directory traversal or injection
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    const cleanBasename = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 40);
    const safeName = `${cleanBasename}${ext}`;
    const blobPath = `proofs/${Date.now()}-${safeName}`;
    let finalUrl = '';

    // 1. Upload to Vercel Blob cloud storage
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(blobPath, file, {
          access: 'public',
        });
        finalUrl = blob.url;
      } catch (blobErr) {
        console.warn('Vercel blob put failed for proof, falling back to disk:', blobErr);
      }
    }

    // 2. Fallback to local /public/uploads/proofs
    if (!finalUrl) {
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const proofsDir = path.join(process.cwd(), 'public', 'uploads', 'proofs');
        if (!fs.existsSync(proofsDir)) {
          fs.mkdirSync(proofsDir, { recursive: true });
        }
        const filePath = path.join(proofsDir, `${Date.now()}-${safeName}`);
        fs.writeFileSync(filePath, buffer);
        finalUrl = `/uploads/proofs/${path.basename(filePath)}`;
      } catch (localErr) {
        console.error('Local file write failed for proof:', localErr);
      }
    }

    if (!finalUrl) {
      return NextResponse.json(
        { success: false, error: 'فشل حفظ صورة الإشعار، يرجى المحاولة مرة أخرى' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: finalUrl,
      message: 'تم رفع صورة إشعار التحويل بنجاح',
    });
  } catch (error) {
    console.error('Error uploading payment proof:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء رفع صورة الإشعار' },
      { status: 500 }
    );
  }
}
