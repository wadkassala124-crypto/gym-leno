import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'png';
    const download = searchParams.get('download') === 'true';
    const color = searchParams.get('color') || '#000000';
    const bg = searchParams.get('bg') || '#ffffff';
    
    // Always target the official website URL
    const targetUrl = 'https://gym-leno.vercel.app';

    if (format === 'svg') {
      const svg = await QRCode.toString(targetUrl, {
        type: 'svg',
        errorCorrectionLevel: 'H',
        margin: 2,
        color: {
          dark: color,
          light: bg,
        },
      });

      return new NextResponse(svg, {
        headers: {
          'Content-Type': 'image/svg+xml; charset=utf-8',
          'Cache-Control': 'public, max-age=31536000, immutable',
          ...(download ? { 'Content-Disposition': 'attachment; filename="gym-leno-qr.svg"' } : {}),
        },
      });
    }

    // Default PNG buffer
    const buffer = await QRCode.toBuffer(targetUrl, {
      type: 'png',
      width: 1200,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: color,
        light: bg,
      },
    });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
        ...(download ? { 'Content-Disposition': 'attachment; filename="gym-leno-qr.png"' } : {}),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
