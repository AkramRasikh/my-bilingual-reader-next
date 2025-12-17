'use client';

import { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { v4 as uuidv4 } from 'uuid';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, Download } from 'lucide-react';
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [convertedFiles, setConvertedFiles] = useState<{
    mp4?: { fileName: string; filePath: string };
    mp3?: { fileName: string; filePath: string };
  }>({});
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [netflixUrl, setNetflixUrl] = useState<string>('');
  const [language, setLanguage] = useState<string>('japanese');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

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

  const handleConvertVideo = async (format: 'mp3' | 'mp4') => {
    if (!videoFile) return;

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', videoFile);
      formData.append('offset', videoOffset.toString());
      formData.append('format', format);
      formData.append('title', videoTitle);

      const response = await fetch('/api/processVideo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process video');
      }

      const result = await response.json();
      
      // Update converted files state
      setConvertedFiles(prev => ({
        ...prev,
        [format]: {
          fileName: result.fileName,
          filePath: result.filePath,
        },
      }));
    } catch (error) {
      console.error('Error processing video:', error);
      alert('Failed to process video. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadToCloudflareAndFirebase = async () => {
    if (!videoTitle || !netflixUrl || !convertedFiles.mp3 || formattedData.length === 0) {
      alert('Please ensure title, URL, MP3 file, and transcript are available');
      return;
    }

    setIsUploading(true);
    try {
      const response = await fetch('/api/uploadYoutubeContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: netflixUrl,
          title: videoTitle,
          language,
          publicAudioUrl: convertedFiles.mp3.filePath,
          transcript: formattedData,
          origin: 'netflix',
          uploadVideo: !!convertedFiles.mp4,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to upload content');
      }

      const result = await response.json();
      console.log('Upload result:', result);
      
      if (result.contentUploaded && result.audioUploaded) {
        setUploadSuccess(true);
        alert('Content successfully uploaded to Cloudflare and Firebase!');
      } else {
        alert('Upload partially completed. Check console for details.');
      }
    } catch (error) {
      console.error('Error uploading content:', error);
      alert('Failed to upload content. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className='min-h-screen p-8'>
      <h1 className='text-3xl font-bold mb-8'>Netflix Upload</h1>

      {/* Video Info Form */}
      <Card className='mb-8'>
        <CardHeader>
          <CardTitle>Video Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='video-title'>Title</Label>
              <Input
                id='video-title'
                type='text'
                placeholder='Enter video title'
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                className='mt-2'
              />
            </div>
            <div>
              <Label htmlFor='netflix-url'>Netflix URL</Label>
              <Input
                id='netflix-url'
                type='url'
                placeholder='https://www.netflix.com/...'
                value={netflixUrl}
                onChange={(e) => setNetflixUrl(e.target.value)}
                className='mt-2'
              />
            </div>
            <div>
              <Label htmlFor='language'>Language</Label>
              <Input
                id='language'
                type='text'
                placeholder='japanese'
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className='mt-2'
              />
            </div>
          </div>
        </CardContent>
      </Card>

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
                    <Label
                      htmlFor='video-offset'
                      className='font-semibold text-sm mb-2 block'
                    >
                      Video Offset (seconds)
                    </Label>
                    <p className='text-xs text-muted-foreground mb-2'>
                      Adjust if video and subtitles are out of sync. Positive
                      values start video later.
                    </p>
                    <Input
                      id='video-offset'
                      type='number'
                      step='0.1'
                      value={videoOffset}
                      onChange={(e) =>
                        setVideoOffset(parseFloat(e.target.value) || 0)
                      }
                      className='w-32'
                      placeholder='0'
                    />
                  </div>

                  <div className='bg-muted p-4 rounded-md'>
                    <h3 className='font-semibold text-sm mb-2'>
                      Export with Offset
                    </h3>
                    <p className='text-xs text-muted-foreground mb-3'>
                      Export trimmed video/audio starting from the offset time
                    </p>
                    <div className='flex gap-2'>
                      <Button
                        onClick={() => handleConvertVideo('mp4')}
                        disabled={isProcessing || !!convertedFiles.mp4}
                        size='sm'
                        variant='outline'
                      >
                        <Download className='h-4 w-4 mr-2' />
                        {isProcessing ? 'Processing...' : convertedFiles.mp4 ? 'MP4 Created' : 'Convert to MP4'}
                      </Button>
                      <Button
                        onClick={() => handleConvertVideo('mp3')}
                        disabled={isProcessing || !!convertedFiles.mp3}
                        size='sm'
                        variant='outline'
                      >
                        <Download className='h-4 w-4 mr-2' />
                        {isProcessing ? 'Processing...' : convertedFiles.mp3 ? 'MP3 Created' : 'Convert to MP3'}
                      </Button>
                    </div>
                  </div>

                  {(convertedFiles.mp4 || convertedFiles.mp3) && (
                    <div className='bg-muted p-4 rounded-md'>
                      <h3 className='font-semibold text-sm mb-2'>
                        Converted Files
                      </h3>
                      <div className='space-y-2 text-sm'>
                        {convertedFiles.mp4 && (
                          <div className='flex items-center justify-between'>
                            <span className='text-muted-foreground'>
                              Video: {convertedFiles.mp4.fileName}
                            </span>
                            <a
                              href={convertedFiles.mp4.filePath}
                              download
                              className='text-primary hover:underline'
                            >
                              Download
                            </a>
                          </div>
                        )}
                        {convertedFiles.mp3 && (
                          <div className='flex items-center justify-between'>
                            <span className='text-muted-foreground'>
                              Audio: {convertedFiles.mp3.fileName}
                            </span>
                            <a
                              href={convertedFiles.mp3.filePath}
                              download
                              className='text-primary hover:underline'
                            >
                              Download
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {convertedFiles.mp3 && formattedData.length > 0 && videoTitle && netflixUrl && (
                    <div className='bg-muted p-4 rounded-md'>
                      <h3 className='font-semibold text-sm mb-2'>
                        Upload to Cloudflare & Firebase
                      </h3>
                      <p className='text-xs text-muted-foreground mb-3'>
                        Upload audio, video (if available), and transcript data
                      </p>
                      <Button
                        onClick={handleUploadToCloudflareAndFirebase}
                        disabled={isUploading || uploadSuccess}
                        size='sm'
                        variant='default'
                        className='w-full'
                      >
                        {isUploading ? 'Uploading...' : uploadSuccess ? 'Successfully Uploaded!' : 'Upload Content'}
                      </Button>
                    </div>
                  )}
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
