const HighlightedTextFocus = ({
  highlightedTextState,
}: {
  highlightedTextState: string;
}) => (
  <p className='my-auto bg-blue-100 rounded px-1 text-sm'>
    {highlightedTextState}
  </p>
);

export default HighlightedTextFocus;
