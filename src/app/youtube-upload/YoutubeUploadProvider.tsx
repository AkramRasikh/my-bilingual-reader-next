'use client';
import { createContext, useContext, useState } from 'react';

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
  const [message, setMessage] = useState<string | null>(null);

  return (
    <YoutubeUploadContext.Provider
      value={{ form, setForm, loading, setLoading, message, setMessage }}
    >
      {children}
    </YoutubeUploadContext.Provider>
  );
}
