'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useFetchData } from '@/app/Providers/FetchDataProvider';
import useLearningScreen from './useLearningScreen';
import {
  loadCloudflareReviewAudio,
  loadNetflixReviewAudio,
  resolveNetflixReviewAudio,
  type LocalReviewClip,
  type ReviewClip,
  type NetflixReviewItem,
  type NetflixReviewRange,
} from './netflix-review-audio';

export default function NetflixReviewAudio() {
  const {selectedContentState, postSnippetsMemoized, postWordsMemoized, postSentencesMemoized} =
    useLearningScreen();
  const {languageSelectedState} = useFetchData();
  const [localClips, setLocalClips] = useState<LocalReviewClip[]>([]);
  const [cloudClips, setCloudClips] = useState<ReviewClip[]>([]);
  const [cloudStatus, setCloudStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const episodeId = selectedContentState.id;
  useEffect(() => {
    const assets = process.env.NEXT_PUBLIC_CLOUDFLARE_ASSETS_URL;
    if (!assets) {
      setCloudStatus('unavailable');
      return;
    }
    const controller = new AbortController();
    setCloudStatus('loading');
    setCloudClips([]);
    loadCloudflareReviewAudio(languageSelectedState.toLowerCase(), episodeId, assets, controller.signal)
      .then(clips => {
        if (controller.signal.aborted) return;
        setCloudClips(clips);
        setCloudStatus('ready');
      }, () => {
        if (!controller.signal.aborted) setCloudStatus('unavailable');
      });
    return () => controller.abort();
  }, [episodeId, languageSelectedState]);
  const clips = [...localClips, ...cloudClips];
  const snippet = postSnippetsMemoized[0];
  const word = postWordsMemoized[0];
  const sentence = postSentencesMemoized[0];
  const target: NetflixReviewItem | undefined = snippet ? {kind: 'snippet', item: snippet}
    : word ? {kind: 'word', item: word} : sentence ? {kind: 'sentence', item: sentence} : undefined;
  const range = target && (
    resolveNetflixReviewAudio(target, selectedContentState.content, localClips) ||
    resolveNetflixReviewAudio(target, selectedContentState.content, cloudClips)
  );

  return (
    <section className='space-y-2 rounded-lg border p-3' aria-label='Netflix review audio'>
      <h2 className='font-semibold'>Netflix review audio</h2>
      {cloudStatus === 'loading' && <p role='status'>Checking Cloudflare for review audio…</p>}
      {cloudStatus === 'unavailable' && <p role='status'>Cloudflare review audio is unavailable. You can use a local export.</p>}
      {cloudStatus === 'ready' && !cloudClips.length && <p role='status'>No review audio has been uploaded for this episode.</p>}
      {cloudClips.length > 0 && <p className='text-sm'>{cloudClips.length} Cloudflare audio clips available</p>}
      <label className='block text-sm'>
        Choose exported audio folder
        <input className='block max-w-full' type='file' multiple
          ref={input => {input?.setAttribute('webkitdirectory', '');}}
          disabled={loading}
          onChange={async event => {
            const input = event.currentTarget;
            if (!input.files?.length) return;
            setError('');
            setLoading(true);
            try {
              setLocalClips(await loadNetflixReviewAudio(Array.from(input.files), selectedContentState.id));
            } catch (error) {
              setError(error instanceof Error ? error.message : 'Could not open the exported audio.');
            } finally {
              input.value = '';
              setLoading(false);
            }
          }}
        />
      </label>
      {error && <p role='alert'>{error}</p>}
      {localClips.length > 0 && <p className='text-sm'>{localClips.length} local audio clips loaded</p>}
      {target && range && <ReviewRangePlayer
        key={JSON.stringify([target.item.id, range.clip.filename, range.start, range.end])}
        range={range}
      />}
      {target && !range && clips.length > 0 && <p role='status'>
        {clips.some(clip => clip.cueRanges === undefined)
          ? 'This export lacks confirmed sentence coverage. Re-export in Saved recordings to check audio for this item.'
          : 'No recorded audio for this review item.'}
      </p>}
    </section>
  );
}

function ReviewRangePlayer({range}: {range: NetflixReviewRange}) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const player = ref.current;
    if (!player) return;
    const local = 'file' in range.clip;
    const url = 'file' in range.clip ? URL.createObjectURL(range.clip.file) : range.clip.url;
    player.src = url;
    return () => {
      player.pause();
      player.removeAttribute('src');
      if (local) URL.revokeObjectURL(url);
    };
  }, [range.clip]);

  useEffect(() => {
    const player = ref.current;
    if (!player || !playing) return;
    let frame = 0;
    function stopAtEnd() {
      if (!player || player.paused) return;
      if (player.currentTime >= range.end) player.pause();
      else frame = requestAnimationFrame(stopAtEnd);
    }
    frame = requestAnimationFrame(stopAtEnd);
    return () => cancelAnimationFrame(frame);
  }, [playing, range.end]);

  return (
    <>
      <audio ref={ref} preload='none'
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={() => {
          const player = ref.current;
          if (player && player.currentTime >= range.end) player.pause();
        }}
      />
      <Button type='button' onClick={async () => {
        const player = ref.current;
        if (!player) return;
        if (!player.paused) {
          player.pause();
          return;
        }
        setError('');
        try {
          player.currentTime = range.start;
          await player.play();
        } catch {
          setError('Could not play this recorded audio.');
        }
      }}>{playing ? 'Pause audio' : 'Play review audio'}</Button>
      {error && <p role='alert'>{error}</p>}
    </>
  );
}
