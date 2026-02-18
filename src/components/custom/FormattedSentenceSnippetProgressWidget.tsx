import React from 'react';
import clsx from 'clsx';

interface FormattedSentenceSnippetProgressWidgetProps {
  played: boolean;
}

const FormattedSentenceSnippetProgressWidget: React.FC<
  FormattedSentenceSnippetProgressWidgetProps
> = ({ played }) => (
  <span
    className={clsx(
      'absolute left-0 top-0 h-0.5 bg-blue-500',
      played ? 'w-full transition-all duration-200' : 'w-0',
    )}
    style={{ borderRadius: '2px', zIndex: 2 }}
  />
);

export default FormattedSentenceSnippetProgressWidget;
