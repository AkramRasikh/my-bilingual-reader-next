import { useEffect } from 'react';

type UseSnippetLoopEventsParams = {
  hasSnippetText: boolean;
  matchEndKey: number;
  matchStartKey: number;
  targetLangLength: number;
  onAdjustLength: (delta: number) => void;
  onShiftStart: (delta: number) => void;
  onSaveSnippet?: () => Promise<void> | void;
};

const useSnippetLoopEvents = ({
  hasSnippetText,
  matchEndKey,
  matchStartKey,
  targetLangLength,
  onAdjustLength,
  onShiftStart,
  onSaveSnippet,
}: UseSnippetLoopEventsParams) => {
  useEffect(() => {
    const handleAdjustLength = (event: Event) => {
      const customEvent = event as CustomEvent<{ delta?: number }>;
      const delta = customEvent.detail?.delta ?? 0;
      if (!delta) return;

      if (delta < 0 && !(matchEndKey > matchStartKey + 1)) return;
      if (delta > 0 && !(matchEndKey < targetLangLength)) return;

      onAdjustLength(delta);
    };

    const handleShiftStart = (event: Event) => {
      const customEvent = event as CustomEvent<{ delta?: number }>;
      const delta = customEvent.detail?.delta ?? 0;
      if (!delta) return;

      if (delta < 0 && matchStartKey <= 0) return;
      if (delta > 0 && matchEndKey >= targetLangLength) return;

      onShiftStart(delta);
    };

    const handleSave = async () => {
      if (!hasSnippetText) return;

      if (onSaveSnippet) {
        await onSaveSnippet();
      }
    };

    window.addEventListener('snippet-loop-adjust-length', handleAdjustLength);
    window.addEventListener('snippet-loop-shift-start', handleShiftStart);
    if (onSaveSnippet) {
      window.addEventListener('snippet-loop-save', handleSave);
    }

    return () => {
      window.removeEventListener(
        'snippet-loop-adjust-length',
        handleAdjustLength,
      );
      window.removeEventListener('snippet-loop-shift-start', handleShiftStart);
      if (onSaveSnippet) {
        window.removeEventListener('snippet-loop-save', handleSave);
      }
    };
  }, [
    hasSnippetText,
    matchEndKey,
    matchStartKey,
    targetLangLength,
    onAdjustLength,
    onShiftStart,
    onSaveSnippet,
  ]);
};

export default useSnippetLoopEvents;
