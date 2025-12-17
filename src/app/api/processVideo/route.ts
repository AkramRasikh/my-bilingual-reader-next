import { NextRequest, NextResponse } from 'next/server';
import ffmpeg from 'fluent-ffmpeg';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const offset = parseFloat(formData.get('offset') as string) || 0;
    const format = formData.get('format') as 'mp3' | 'mp4';
    const title = (formData.get('title') as string) || file.name.replace(/\.[^/.]+$/, '');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Create temp directory if it doesn't exist
    const tempDir = path.join(process.cwd(), 'temp');
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }

    // Create public/netflix directory if it doesn't exist
    const netflixDir = path.join(process.cwd(), 'public', 'netflix');
    if (!existsSync(netflixDir)) {
      await mkdir(netflixDir, { recursive: true });
    }

    // Save uploaded file temporarily
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const inputPath = path.join(tempDir, `input-${Date.now()}${path.extname(file.name)}`);
    await writeFile(inputPath, buffer);

    // Create output filename and path using the title
    const sanitizedTitle = title.replace(/[^a-z0-9-_]/gi, '_');
    const outputFileName = `${sanitizedTitle}.${format}`;
    const outputPath = path.join(netflixDir, outputFileName);

    // Process video with ffmpeg
    await new Promise<void>((resolve, reject) => {
      const command = ffmpeg(inputPath);

      if (offset > 0) {
        command.setStartTime(offset);
      }

      if (format === 'mp3') {
        // Extract audio only
        command
          .noVideo()
          .audioCodec('libmp3lame')
          .audioBitrate('192k')
          .toFormat('mp3');
      } else {
        // Lower quality MP4
        command
          .videoCodec('libx264')
          .size('?x720') // 720p height, maintain aspect ratio
          .videoBitrate('1000k')
          .audioCodec('aac')
          .audioBitrate('128k')
          .toFormat('mp4');
      }

      command
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .save(outputPath);
    });

    // Clean up temp input file
    await unlink(inputPath);

    // Return the filename and path
    return NextResponse.json({
      success: true,
      fileName: outputFileName,
      filePath: `/netflix/${outputFileName}`,
      format,
    });
  } catch (error) {
    console.error('Video processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process video' },
      { status: 500 }
    );
  }
}
