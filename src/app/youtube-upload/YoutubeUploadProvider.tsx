'use client';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import useMapTranscriptToSeconds from '../LearningScreen/hooks/useMapTranscriptToSeconds';
import { useFetchData } from '../Providers/FetchDataProvider';

const YoutubeUploadContext = createContext(null);

export function useYoutubeUpload() {
  return useContext(YoutubeUploadContext);
}

export type LanguageOption = 'japanese' | 'chinese' | 'arabic' | 'french' | '';

export interface FormData {
  url: string;
  language: LanguageOption;
  title: string;
}

export function YoutubeUploadProvider({ children }) {
  const [form, setForm] = useState<FormData>({
    url: '',
    language: '',
    title: '',
  });

  const youtubeMediaRef = useRef<HTMLAudioElement | HTMLVideoElement | null>(
    null,
  );
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoTitleState, setVideoTitleState] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [transcriptState, setTranscriptState] = useState([]);
  const [publicAudioUrlState, setPublicAudioUrlState] = useState('');
  const [secondsState, setSecondsState] = useState([]);
  const [onlyShowNonBaseLangState, setOnlyShowNonBaseLangState] =
    useState(false);
  const masterPlay =
    secondsState?.length > 0 ? secondsState[Math.floor(currentTime)] : '';

  const transcriptItemsNoBaseLang = useMemo(
    () =>
      transcriptState?.filter(
        (item) =>
          !item?.baseLang ||
          item?.baseLang === '' ||
          item?.baseLang?.trim() === '',
      ),
    [transcriptState],
  );

  const numberOfBaseLangLessItems = transcriptItemsNoBaseLang?.length;

  const { dispatchContent, setToastMessageState } = useFetchData();

  useMapTranscriptToSeconds({
    ref: youtubeMediaRef,
    content: transcriptState,
    secondsState,
    setSecondsState,
    setLoopSecondsState: () => {},
    loopTranscriptState: [],
  });

  const handleTimeUpdate = () => {
    if (youtubeMediaRef.current) {
      setCurrentTime(youtubeMediaRef.current.currentTime);
    }
  };

  const handlePause = () => {
    youtubeMediaRef.current.pause();
  };

  const playFromHere = (time) => {
    youtubeMediaRef.current.currentTime = time;
    youtubeMediaRef.current.play();
  };

  const uploadContentToDb = async () => {
    try {
      const res = await fetch('/api/uploadYoutubeContent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: form.url,
          title: form.title,
          language: form.language.toLowerCase(),
          publicAudioUrl: publicAudioUrlState,
          publicVideoUrl: publicAudioUrlState
            .replace(/\.mp3$/, '.mp4')
            .replace('youtube', 'youtube-video'),
          transcript: transcriptState.map(({ originalIndex, ...rest }) => rest),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(
          `Success! ${data.contentUploaded ? 'Content uploaded ' : ''} ${
            data.audioUploaded ? 'Audio uploaded' : ''
          }`,
        );

        if (res?.newContentData) {
          dispatchContent({
            type: 'addContent',
            newContentData: res.newContentData,
          });
          setToastMessageState('New content added!');
        }
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkYoutubeVideoLoads = async () => {
      if (form.url && !videoTitleState) {
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
          console.log('## Video exists!');
          setVideoTitleState(data.title);
        } catch (err) {
          console.error('Fetch failed:', err);
        }
      }
    };

    if (form?.url === '' && videoTitleState) {
      setVideoTitleState('');
    }
    if (form?.url === '' && title) {
      setVideoTitleState('');
    }
    checkYoutubeVideoLoads();
  }, [form, videoTitleState]);

  const getYoutubeData = async () => {
    try {
      const res = await fetch('/api/getYoutubeVideo', {
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
        setTranscriptState(
          data.transcript.map((item, index) => ({
            ...item,
            originalIndex: index,
          })),
        );
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
        videoTitleState,
        getYoutubeData,
        transcriptState,
        setTranscriptState,
        publicAudioUrlState,
        youtubeMediaRef,
        handleTimeUpdate,
        masterPlay,
        uploadContentToDb,
        handlePause,
        playFromHere,
        isVideoPlaying,
        setIsVideoPlaying,
        onlyShowNonBaseLangState,
        setOnlyShowNonBaseLangState,
        numberOfBaseLangLessItems,
      }}
    >
      {children}
    </YoutubeUploadContext.Provider>
  );
}
