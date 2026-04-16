import { isTrimmedLang, LanguageEnum } from '@/app/languages';
import { useMemo, useState } from 'react';
import { highlightSnippetTextApprox } from './highlight-snippet-text-approx';

export const useSnippetHandleActionsHook = ({
  targetLang,
  focusText,
  isLoadingSaveSnippetState,
  suggestedTextStartIndex,
  languageSelectedState,
}) => {
  const [startIndexKeyState, setStartIndexKeyState] = useState(0);
  const [lengthAdjustmentState, setLengthAdjustmentState] = useState(0);

  const { textMatch, matchStartKey, matchEndKey, before, after } =
    useMemo(() => {
      return highlightSnippetTextApprox(
        targetLang,
        focusText || '',
        isLoadingSaveSnippetState,
        startIndexKeyState,
        lengthAdjustmentState,
        suggestedTextStartIndex,
      );
    }, [
      focusText,
      isLoadingSaveSnippetState,
      startIndexKeyState,
      lengthAdjustmentState,
      suggestedTextStartIndex,
      targetLang,
    ]);

  const onContractLength = () => {
    if (!(matchEndKey > matchStartKey + 1)) return;

    if (!isTrimmedLang(languageSelectedState as LanguageEnum)) {
      let cursor = matchEndKey - 1;

      while (cursor >= matchStartKey && /\s/.test(targetLang[cursor])) {
        cursor -= 1;
      }
      while (cursor >= matchStartKey && !/\s/.test(targetLang[cursor])) {
        cursor -= 1;
      }

      const previousWordStart = Math.max(matchStartKey + 1, cursor + 1);
      const delta = previousWordStart - matchEndKey;
      setLengthAdjustmentState(lengthAdjustmentState + delta);
      return;
    }

    setLengthAdjustmentState(lengthAdjustmentState - 1);
  };

  const onExpandLength = () => {
    if (!(matchEndKey < targetLang.length)) return;

    if (!isTrimmedLang(languageSelectedState as LanguageEnum)) {
      let cursor = matchEndKey;

      while (cursor < targetLang.length && /\s/.test(targetLang[cursor])) {
        cursor += 1;
      }
      while (cursor < targetLang.length && !/\s/.test(targetLang[cursor])) {
        cursor += 1;
      }

      const delta = cursor - matchEndKey;
      setLengthAdjustmentState(lengthAdjustmentState + delta);
      return;
    }

    setLengthAdjustmentState(lengthAdjustmentState + 1);
  };

  const onMoveLeft = () => {
    if (matchStartKey <= 0) return;

    if (!isTrimmedLang(languageSelectedState as LanguageEnum)) {
      let cursor = matchStartKey - 1;

      while (cursor >= 0 && /\s/.test(targetLang[cursor])) {
        cursor -= 1;
      }
      while (cursor >= 0 && !/\s/.test(targetLang[cursor])) {
        cursor -= 1;
      }

      const previousWordStart = Math.max(0, cursor + 1);
      setStartIndexKeyState(previousWordStart - suggestedTextStartIndex);
      return;
    }

    setStartIndexKeyState(startIndexKeyState - 1);
  };

  const onMoveRight = () => {
    if (matchEndKey >= targetLang.length) return;

    if (!isTrimmedLang(languageSelectedState as LanguageEnum)) {
      let cursor = matchStartKey + 1;

      while (cursor < targetLang.length && !/\s/.test(targetLang[cursor])) {
        cursor += 1;
      }
      while (cursor < targetLang.length && /\s/.test(targetLang[cursor])) {
        cursor += 1;
      }

      const nextWordStart = Math.min(cursor, targetLang.length - 1);
      setStartIndexKeyState(nextWordStart - suggestedTextStartIndex);
      return;
    }

    setStartIndexKeyState(startIndexKeyState + 1);
  };

  return {
    onContractLength,
    onExpandLength,
    onMoveLeft,
    onMoveRight,
    textMatch,
    matchStartKey,
    matchEndKey,
    before,
    after,
  };
};
