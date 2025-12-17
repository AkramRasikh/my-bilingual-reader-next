'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function NetflixPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoMetadata, setVideoMetadata] = useState<{
    duration: number;
    sizeInMB: number;
  } | null>(null);
  const [textFile, setTextFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState<string>('');

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Revoke previous object URL to avoid memory leaks
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }

    setVideoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setVideoUrl(objectUrl);

    // Get video size in MB
    const sizeInMB = file.size / (1024 * 1024);

    // Get video duration
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      const duration = video.duration;

      setVideoMetadata({
        duration,
        sizeInMB: parseFloat(sizeInMB.toFixed(2)),
      });
    };

    video.src = objectUrl;
  };

  const handleTextFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Read the text file contents
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setTextContent(text);
    };
    reader.readAsText(file);
    setTextFile(file);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className='min-h-screen p-8'>
      <h1 className='text-3xl font-bold mb-8'>Netflix Upload</h1>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        {/* Left Side - Video Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Video Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div>
                <Label htmlFor='video-upload'>Select Video File</Label>
                <Input
                  id='video-upload'
                  type='file'
                  accept='video/*'
                  onChange={handleVideoUpload}
                  className='mt-2 cursor-pointer'
                />
              </div>

              {videoUrl && (
                <div className='mt-4'>
                  <video
                    src={videoUrl}
                    controls
                    preload='metadata'
                    className='w-full rounded-md border'
                  >
                    <source
                      src={videoUrl}
                      type={videoFile?.type || 'video/webm'}
                    />
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}

              {videoFile && videoMetadata && (
                <div className='mt-6 space-y-2 bg-muted p-4 rounded-md'>
                  <h3 className='font-semibold text-sm mb-2'>
                    Video Metadata:
                  </h3>
                  <div className='text-sm space-y-1'>
                    <p className='text-muted-foreground'>
                      <span className='font-medium text-foreground'>
                        File Name:
                      </span>{' '}
                      {videoFile.name}
                    </p>
                    <p className='text-muted-foreground'>
                      <span className='font-medium text-foreground'>
                        Duration:
                      </span>{' '}
                      {formatDuration(videoMetadata.duration)}
                    </p>
                    <p className='text-muted-foreground'>
                      <span className='font-medium text-foreground'>Size:</span>{' '}
                      {videoMetadata.sizeInMB} MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Side - Text File Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Text File Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div>
                <Label htmlFor='text-upload'>Select Text File</Label>
                <Input
                  id='text-upload'
                  type='file'
                  accept='.txt'
                  onChange={handleTextFileUpload}
                  disabled={!videoFile}
                  className='mt-2 cursor-pointer disabled:cursor-not-allowed'
                />
              </div>

              {!videoFile && (
                <p className='text-sm text-muted-foreground italic'>
                  Please upload a video first to enable text file upload
                </p>
              )}

              {textFile && (
                <div className='mt-6 space-y-4'>
                  <div className='space-y-2 bg-muted p-4 rounded-md'>
                    <h3 className='font-semibold text-sm mb-2'>Text File:</h3>
                    <div className='text-sm space-y-1'>
                      <p className='text-muted-foreground'>
                        <span className='font-medium text-foreground'>
                          File Name:
                        </span>{' '}
                        {textFile.name}
                      </p>
                      <p className='text-muted-foreground'>
                        <span className='font-medium text-foreground'>
                          Size:
                        </span>{' '}
                        {(textFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>

                  {textContent && (
                    <div className='bg-muted p-4 rounded-md'>
                      <h3 className='font-semibold text-sm mb-2'>
                        File Contents:
                      </h3>
                      <pre className='text-xs text-muted-foreground whitespace-pre-wrap max-h-96 overflow-y-auto'>
                        {textContent}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
