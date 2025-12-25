import { NextRequest, NextResponse } from 'next/server';
import { deleteVideoCloudflare } from '@/app/shared-apis/delete-video-cloudflare';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filePath } = body;

    if (!filePath) {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 },
      );
    }

    const success = await deleteVideoCloudflare({
      key: filePath,
    });

    if (success) {
      return NextResponse.json(
        { message: 'Video deleted successfully' },
        { status: 200 },
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to delete video' },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error('Error in deleteVideo API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
