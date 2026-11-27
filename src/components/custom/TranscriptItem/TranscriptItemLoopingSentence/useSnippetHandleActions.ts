import { isTrimmedLang, LanguageEnum } from '@/app/languages';
import { useMemo, useState } from 'react';
import { highlightSnippetTextApprox } from './highlight-snippet-text-approx';
import {
  contractFocusRange,
  expandFocusRange,
  moveFocusRangeLeft,
  moveFocusRangeRight,
} from './snippet-focus-steps';

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

  const isTrimmed = isTrimmedLang(languageSelectedState as LanguageEnum);
  const currentRange = { start: matchStartKey, end: matchEndKey };

  const onContractLength = () => {
    const next = contractFocusRange(targetLang, currentRange, isTrimmed);
    if (!next) return;
    setLengthAdjustmentState(lengthAdjustmentState + (next.end - matchEndKey));
  };

  const onExpandLength = () => {
    const next = expandFocusRange(targetLang, currentRange, isTrimmed);
    if (!next) return;
    setLengthAdjustmentState(lengthAdjustmentState + (next.end - matchEndKey));
  };

  const onMoveLeft = () => {
    const next = moveFocusRangeLeft(targetLang, currentRange, isTrimmed);
    if (!next) return;
    setStartIndexKeyState(startIndexKeyState + (next.start - matchStartKey));
  };

  const onMoveRight = () => {
    const next = moveFocusRangeRight(targetLang, currentRange, isTrimmed);
    if (!next) return;
    setStartIndexKeyState(startIndexKeyState + (next.start - matchStartKey));
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
