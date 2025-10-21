'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import {
  mockPublicUrl,
  squashedMockResponseJapaneseOnly,
} from '../api/getYoutubeVideo/mockResponseTargetOnly';

const YoutubeUploadContext = createContext(null);

export function useYoutubeUpload() {
  return useContext(YoutubeUploadContext);
}

export type LanguageOption = 'japanese' | 'chinese' | 'arabic' | 'french';

export interface FormData {
  url: string;
  language: LanguageOption;
  title: string;
}

export function YoutubeUploadProvider({ children }) {
  const [form, setForm] = useState<FormData>({
    url: '',
    language: 'japanese',
    title: '',
  });

  const [loading, setLoading] = useState(false);
  const [videoIsLoadedState, setVideoIsLoadedState] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [transcriptState, setTranscriptState] = useState();
  const [publicAudioUrlState, setPublicAudioUrlState] = useState('');

  useEffect(() => {
    const checkYoutubeVideoLoads = async () => {
      if (form.url && !videoIsLoadedState) {
        try {
          const res = await fetch(
            `https://www.youtube.com/oembed?url=${encodeURIComponent(
              form.url,
            )}&format=json`,
          );

          if (!res.ok) {
            // 404 or video not embeddable
            console.log('Video cannot be loaded or is private/removed');
            return;
          }

          const data = await res.json();
          console.log('## Video exists! Title:', data.title);
          console.log('## Video exists! DATA:', data);
          setVideoIsLoadedState(data.title);
        } catch (err) {
          console.error('Fetch failed:', err);
        }
      }
    };

    if (form?.url === '' && videoIsLoadedState) {
      setVideoIsLoadedState('');
    }
    checkYoutubeVideoLoads();
  }, [form, videoIsLoadedState]);

  const getYoutubeData = async () => {
    try {
      const res = await fetch('/api/download-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: form.url,
          title: form.title,
          language: form.language,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`Success! File URL: ${data.publicUrl}`);
        setPublicAudioUrlState(data.publicUrl);
        setTranscriptState(data.transcript);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <YoutubeUploadContext.Provider
      value={{
        form,
        setForm,
        loading,
        setLoading,
        message,
        setMessage,
        videoIsLoadedState,
        getYoutubeData,
        transcriptState,
        setTranscriptState,
        publicAudioUrlState,
      }}
    >
      {children}
    </YoutubeUploadContext.Provider>
  );
}
