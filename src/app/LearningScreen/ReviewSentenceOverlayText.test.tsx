import { render, screen } from '@testing-library/react';
import { pinyin } from 'pinyin-pro';
import { chinese, japanese } from '@/app/languages';
import ReviewSentenceOverlayText, {
  ColoredPhraseBreakdown,
} from './ReviewSentenceOverlayText';
import {
  PLAYBACK_CAPTION_PLATE_CLASS,
  PLAYBACK_CAPTION_SECONDARY_TEXT_CLASS,
} from './playbackCaptionSurface';

const vocab = [
  { meaning: 'really want to', surfaceForm: '好想' },
  { meaning: 'at', surfaceForm: '在' },
  { meaning: 'on-site', surfaceForm: '现场' },
];

describe('ReviewSentenceOverlayText', () => {
  it('shows the plain sentence and English when there is no breakdown', () => {
    render(
      <ReviewSentenceOverlayText
        targetLang='好想在现场'
        baseLang='I really want to see it'
        showEnglish
        languageSelectedState={chinese}
      />,
    );

    const target = screen.getByTestId(
      'learning-screen-review-sentence-target-lang',
    );
    expect(target).toHaveTextContent('好想在现场');
    expect(target).toHaveClass('text-white');
    const base = screen.getByTestId('learning-screen-review-sentence-base-lang');
    expect(base).toHaveTextContent('I really want to see it');
    expect(base).toHaveClass(PLAYBACK_CAPTION_SECONDARY_TEXT_CLASS);
    expect(
      screen.queryByTestId('learning-screen-review-sentence-pinyin'),
    ).not.toBeInTheDocument();
  });

  it('shows the sentence meaning in place of the base language', () => {
    render(
      <ReviewSentenceOverlayText
        targetLang='好想在现场'
        baseLang='I really want to see it'
        meaning='I really want to be there'
        showEnglish
        languageSelectedState={chinese}
      />,
    );

    expect(
      screen.getByTestId('learning-screen-review-sentence-base-lang'),
    ).toHaveTextContent('I really want to be there');
    expect(screen.queryByText('I really want to see it')).not.toBeInTheDocument();
  });

  it('keeps the base language when meaning is unavailable', () => {
    render(
      <ReviewSentenceOverlayText
        targetLang='好想在现场'
        baseLang='I really want to see it'
        meaning='n/a'
        showEnglish
        languageSelectedState={chinese}
      />,
    );

    expect(
      screen.getByTestId('learning-screen-review-sentence-base-lang'),
    ).toHaveTextContent('I really want to see it');
  });

  it('shows colored pieces, pinyin, then English for a broken-down Chinese sentence', () => {
    render(
      <ReviewSentenceOverlayText
        targetLang='好想在现场'
        baseLang='I really want to see it'
        showEnglish
        vocab={vocab}
        sentenceStructure='好想 + 在 + 现场'
        languageSelectedState={chinese}
      />,
    );

    const target = screen.getByTestId(
      'learning-screen-review-sentence-target-lang',
    );
    const pieces = target.querySelectorAll('span');
    expect(pieces).toHaveLength(3);
    expect(pieces[0]).toHaveTextContent('好想');
    expect(pieces[0]).toHaveStyle({ color: '#1f77b4' });
    expect(pieces[1]).toHaveStyle({ color: '#ff7f0e' });

    const pinyinLine = screen.getByTestId(
      'learning-screen-review-sentence-pinyin',
    );
    const pinyinParts = pinyinLine.querySelectorAll('span');
    expect(pinyinParts).toHaveLength(3);
    expect(pinyinParts[0]).toHaveStyle({ color: '#1f77b4' });
    expect(pinyinParts[0].textContent).toBe(
      pinyin('好想', { toneType: 'symbol', separator: '\u2009' }),
    );
    expect(pinyinParts[1]).toHaveStyle({ color: '#ff7f0e' });
    expect(pinyinParts[1].textContent).toContain(
      pinyin('在', { toneType: 'symbol', separator: '\u2009' }),
    );
    expect(pinyinLine.nextElementSibling).toHaveAttribute(
      'data-testid',
      'learning-screen-review-sentence-base-lang',
    );
  });

  it('gives a breakdown chip the caption plate and keeps piece colors', () => {
    render(
      <ColoredPhraseBreakdown
        pieces={[
          { surfaceForm: '好想', index: 0 },
          { surfaceForm: '在', index: 1 },
        ]}
        languageSelectedState={chinese}
        testId='breakdown-chip'
        pinyinTestId='breakdown-chip-pinyin'
        chip
      />,
    );

    const chip = screen.getByTestId('breakdown-chip');
    for (const className of PLAYBACK_CAPTION_PLATE_CLASS.split(' ')) {
      expect(chip).toHaveClass(className);
    }
    expect(chip.querySelector('span')).toHaveStyle({ color: '#1f77b4' });
  });

  it('hides pinyin for a non-Chinese breakdown', () => {
    render(
      <ReviewSentenceOverlayText
        targetLang='この発言'
        baseLang='this statement'
        showEnglish
        vocab={[{ meaning: 'this', surfaceForm: 'この' }]}
        sentenceStructure='この + 発言'
        languageSelectedState={japanese}
      />,
    );

    expect(
      screen.queryByTestId('learning-screen-review-sentence-pinyin'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId('learning-screen-review-sentence-base-lang'),
    ).toBeInTheDocument();
  });
});
