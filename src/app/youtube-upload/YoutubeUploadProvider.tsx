'use client';
import { createContext, useContext, useEffect, useState } from 'react';

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
      }}
    >
      {children}
    </YoutubeUploadContext.Provider>
  );
}
