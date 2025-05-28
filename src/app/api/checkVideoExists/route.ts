// app/api/checkVideoExists/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    const response = await fetch(url, {
      method: 'HEAD',
    });

    if (!response.ok) {
      return NextResponse.json({ exists: false }, { status: 200 });
    }

    const contentType = response.headers.get('Content-Type');
    const isVideo =
      contentType?.startsWith('video/') ||
      contentType === 'application/octet-stream' ||
      /\.(mp4|mov|avi|mkv|webm)$/i.test(url);

    return NextResponse.json({ exists: isVideo }, { status: 200 });
  } catch (err) {
    console.error('Error checking video URL:', err);
    return NextResponse.json({ exists: false }, { status: 500 });
  }
}
