import { fireEvent, render, screen } from '@testing-library/react';
import YoutubeUploadRemoveSlashH from './YoutubeUploadRemoveSlashH';
import { useYoutubeUpload } from './YoutubeUploadProvider';

jest.mock('./YoutubeUploadProvider', () => ({
  useYoutubeUpload: jest.fn(),
}));

const mockedUseYoutubeUpload = useYoutubeUpload as jest.Mock;

describe('YoutubeUploadRemoveSlashH', () => {
  it('shows the count and clears every mark in one click', () => {
    const setTranscriptState = jest.fn();
    const transcriptState = [
      {
        targetLang:
          "Qu'est-ce que c'est\\h que ça ? Qu'est-ce que vous faites chez moi,\\h\\h",
      },
      { targetLang: 'rien' },
    ];
    mockedUseYoutubeUpload.mockReturnValue({
      transcriptState,
      setTranscriptState,
    });

    render(<YoutubeUploadRemoveSlashH />);

    expect(screen.getByRole('button', { name: 'Remove all \\h' })).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Remove all \\h' }));

    const update = setTranscriptState.mock.calls[0][0];
    expect(update(transcriptState)[0].targetLang).toBe(
      "Qu'est-ce que c'est que ça ? Qu'est-ce que vous faites chez moi,",
    );
    expect(update(transcriptState)[1].targetLang).toBe('rien');
  });

  it('stays hidden when no line has a mark', () => {
    mockedUseYoutubeUpload.mockReturnValue({
      transcriptState: [{ targetLang: 'rien' }],
      setTranscriptState: jest.fn(),
    });

    const { container } = render(<YoutubeUploadRemoveSlashH />);

    expect(container).toBeEmptyDOMElement();
  });
});
