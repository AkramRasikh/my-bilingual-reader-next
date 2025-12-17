'use client';

import { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { v4 as uuidv4 } from 'uuid';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import NetflixTranscriptItem from './NetflixTranscriptItem';

export default function NetflixPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoMetadata, setVideoMetadata] = useState<{
    duration: number;
    sizeInMB: number;
  } | null>(null);
  const [textFile, setTextFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState<string>('');
  const [formattedData, setFormattedData] = useState<
    Array<{
      id: string;
      targetLang: string;
      baseLang: string;
      time: number;
    }>
  >([]);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoOffset, setVideoOffset] = useState<number>(0);

  const parseTextContent = (text: string) => {
    // Split by newlines to get individual lines
    const lines = text.trim().split('\n');

    console.log('## total lines', lines.length);

    const parsed = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines or header line
      if (!line || line.startsWith('Time')) continue;

      console.log('## processing line', i, line);

      // Split by tabs to get columns: Time, Subtitle, Translation
      const columns = line
        .split('\t')
        .map((col) => col.trim())
        .filter((col) => col);

      if (columns.length < 3) {
        console.log('## skipping line - not enough columns', columns.length);
        continue;
      }

      // Parse timestamp (format: HH:MM:SS)
      const timeMatch = columns[0].match(/(\d{2}):(\d{2}):(\d{2})/);
      if (!timeMatch) {
        console.log('## skipping line - no time match', columns[0]);
        continue;
      }

      const hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      const seconds = parseInt(timeMatch[3]);
      const totalSeconds = hours * 3600 + minutes * 60 + seconds;

      // Column 1 is targetLang (Japanese), Column 2 is baseLang (English)
      // Remove all whitespace from Japanese text
      const targetLang = (columns[1] || '').replace(/\s+/g, '');
      const baseLang = columns[2] || '';

      parsed.push({
        id: uuidv4(),
        targetLang,
        baseLang,
        time: parseFloat(totalSeconds.toFixed(3)),
      });
    }

    console.log('## parsed count', parsed.length);
    return parsed;
  };

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
      // console.log('## e.target', e.target);

      const text = e.target?.result as string;
      // console.log('## text', text);

      setTextContent(text);

      // Parse and format the data
      const formatted = parseTextContent(text);
      console.log('## formatted', formatted);

      setFormattedData(formatted);
    };
    reader.readAsText(file);
    setTextFile(file);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  const playFromHere = (time: number) => {
    if (videoRef.current) {
      // Apply offset: video time = transcript time + offset
      videoRef.current.currentTime = time + videoOffset;
      videoRef.current.play();
      setIsVideoPlaying(true);

      // Find the item with this time and set it as currently playing
      const item = formattedData.find((d) => d.time === time);
      if (item) {
        setCurrentPlayingId(item.id);
      }
    }
  };

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }
  };

  const handleVideoPlay = () => {
    setIsVideoPlaying(true);
  };

  const handleVideoPause = () => {
    setIsVideoPlaying(false);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && formattedData.length > 0) {
      // Subtract offset from video time to match transcript time
      const currentTime = videoRef.current.currentTime - videoOffset;
      
      // Find the current transcript item based on adjusted video time
      // Find the last item whose time is <= currentTime
      let currentItem = formattedData[0];
      for (let i = 0; i < formattedData.length; i++) {
        if (formattedData[i].time <= currentTime) {
          currentItem = formattedData[i];
        } else {
          break;
        }
      }
      
      setCurrentPlayingId(currentItem.id);
    }
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
                    ref={videoRef}
                    src={videoUrl}
                    controls
                    preload='metadata'
                    className='w-full rounded-md border'
                    onPlay={handleVideoPlay}
                    onPause={handleVideoPause}
                    onTimeUpdate={handleTimeUpdate}
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
                <div className='mt-6 space-y-4'>
                  <div className='bg-muted p-4 rounded-md'>
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
                        <span className='font-medium text-foreground'>
                          Size:
                        </span>{' '}
                        {videoMetadata.sizeInMB} MB
                      </p>
                    </div>
                  </div>

                  <div className='bg-muted p-4 rounded-md'>
                    <Label htmlFor='video-offset' className='font-semibold text-sm mb-2 block'>
                      Video Offset (seconds)
                    </Label>
                    <p className='text-xs text-muted-foreground mb-2'>
                      Adjust if video and subtitles are out of sync. Positive values start video later.
                    </p>
                    <Input
                      id='video-offset'
                      type='number'
                      step='0.1'
                      value={videoOffset}
                      onChange={(e) => setVideoOffset(parseFloat(e.target.value) || 0)}
                      className='w-32'
                      placeholder='0'
                    />
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
                    <Collapsible>
                      <CollapsibleTrigger className='flex items-center gap-2 w-full bg-muted p-4 rounded-md hover:bg-muted/80'>
                        <ChevronDown className='h-4 w-4' />
                        <h3 className='font-semibold text-sm'>File Contents</h3>
                      </CollapsibleTrigger>
                      <CollapsibleContent className='bg-muted p-4 rounded-md mt-2'>
                        <pre className='text-xs text-muted-foreground whitespace-pre-wrap max-h-96 overflow-y-auto'>
                          {textContent}
                        </pre>
                      </CollapsibleContent>
                    </Collapsible>
                  )}

                  {formattedData.length > 0 && (
                    <div className='space-y-2'>
                      <h3 className='font-semibold text-sm mb-2'>
                        Transcript ({formattedData.length} entries):
                      </h3>
                      <div className='flex flex-col space-y-2 max-h-96 overflow-y-auto pr-2'>
                        {formattedData.map((item, index) => (
                          <NetflixTranscriptItem
                            key={item.id}
                            item={item}
                            index={index}
                            thisIsPlaying={currentPlayingId === item.id}
                            isVideoPlaying={isVideoPlaying}
                            handlePause={handlePause}
                            playFromHere={playFromHere}
                          />
                        ))}
                      </div>
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
