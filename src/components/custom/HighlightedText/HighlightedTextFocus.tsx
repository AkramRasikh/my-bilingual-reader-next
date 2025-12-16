import clsx from 'clsx';

const HighlightedTextFocus = ({
  highlightedTextState,
  isLoadingState,
}: {
  highlightedTextState: string;
  isLoadingState?: boolean;
}) => (
  <p
    data-testid='highlighted-text-focus'
    className={clsx(
      'my-auto bg-blue-100 rounded px-1 text-sm',
      isLoadingState ? 'opacity-25' : '',
    )}
  >
    {highlightedTextState}
  </p>
);

export default HighlightedTextFocus;
