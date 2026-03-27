import SnippetReview from '.';
import { ComponentProps } from 'react';

type SnippetOverlayProps = ComponentProps<typeof SnippetReview>;

const SnippetOverlay = (props: SnippetOverlayProps) => {
  return <SnippetReview {...props} />;
};

export default SnippetOverlay;
