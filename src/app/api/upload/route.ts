import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { addMedia } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const customName = (formData.get('name') as string | null) || '';

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'يرجى اختيار ملف صالح من جهازك' },
        { status: 400 }
      );
    }

    // 50 MB file limit
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: 'حجم الملف كبير جداً. الحد الأقصى هو 50 ميجابايت' },
        { status: 400 }
      );
    }

    // Determine type (image or video)
    const isVideo =
      file.type.startsWith('video/') ||
      /\.(mp4|webm|mov|m4v|ogg)$/i.test(file.name);
    const mediaType: 'image' | 'video' = isVideo ? 'video' : 'image';

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const blobPath = `uploads/${Date.now()}-${safeName}`;
    const sizeFormatted = formatFileSize(file.size);

    let finalUrl = '';

    // 1. Upload to Vercel Blob if available
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(blobPath, file, {
          access: 'public',
        });
        finalUrl = blob.url;
      } catch (blobErr) {
        console.warn('Vercel blob put failed, falling back to local file if writable:', blobErr);
      }
    }

    // 2. Fallback to local /public/uploads if offline or Blob failed
    if (!finalUrl) {
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const filePath = path.join(uploadsDir, `${Date.now()}-${safeName}`);
        fs.writeFileSync(filePath, buffer);
        finalUrl = `/uploads/${path.basename(filePath)}`;
      } catch (localErr) {
        console.error('Local file write failed:', localErr);
      }
    }

    if (!finalUrl) {
      return NextResponse.json(
        { success: false, error: 'فشل حفظ الملف في التخزين السحابي' },
        { status: 500 }
      );
    }

    // Register into Media Library in DB
    const mediaItem = await addMedia({
      url: finalUrl,
      name: customName.trim() || file.name,
      type: mediaType,
      sizeFormatted,
      tags: [mediaType === 'video' ? 'Video' : 'Image', 'Device Upload'],
    });

    return NextResponse.json({
      success: true,
      url: finalUrl,
      data: mediaItem,
      message: 'تم رفع الملف بنجاح وحفظه في التخزين',
    });
  } catch (error) {
    console.error('Error handling upload:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ غير متوقع أثناء رفع الملف' },
      { status: 500 }
    );
  }
}
