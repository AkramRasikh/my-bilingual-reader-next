import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ReviewSRSToggles from './ReviewSRSToggles';
import { srsCalculationAndText } from '@/app/srs-utils/srs-algo';

jest.mock('@/app/srs-utils/srs-algo', () => {
  const actual = jest.requireActual('@/app/srs-utils/srs-algo');
  return {
    ...actual,
    srsCalculationAndText: jest.fn(),
  };
});

const mockedSrsCalculation = srsCalculationAndText as jest.Mock;

const due = new Date('2030-01-01T12:00:00.000Z');
const card = { due };

const scheduledOptions = {
  nextScheduledOptions: {
    '1': { card },
    '2': { card },
    '3': { card },
    '4': { card },
  },
  againText: '1 mins',
  hardText: '10 mins',
  goodText: '1 days',
  easyText: '45 days',
};

describe('ReviewSRSToggles easy delete', () => {
  it('replaces the Easy interval with a trash icon and deletes on click', async () => {
    mockedSrsCalculation.mockReturnValue({
      ...scheduledOptions,
      isScheduledForDeletion: true,
    });
    const handleReviewFunc = jest.fn().mockResolvedValue(undefined);

    render(
      <ReviewSRSToggles
        contentItem={{ id: 'word-1', reviewData: card }}
        handleReviewFunc={handleReviewFunc}
        isSnippet={false}
        isVocab
        isReadyForQuickReview={false}
      />,
    );

    const easyButton = screen.getByTestId('easy-word-1');
    expect(easyButton).toBeEnabled();
    expect(easyButton).toHaveAccessibleName('Delete');
    expect(easyButton).not.toHaveTextContent('45 days');

    fireEvent.click(easyButton);

    await waitFor(() => {
      expect(handleReviewFunc).toHaveBeenCalledWith({
        wordId: 'word-1',
        isRemoveReview: true,
      });
    });
  });

  it('still schedules Easy when the next interval is under the delete threshold', async () => {
    mockedSrsCalculation.mockReturnValue({
      ...scheduledOptions,
      easyText: '4 days',
      isScheduledForDeletion: false,
    });
    const handleReviewFunc = jest.fn().mockResolvedValue(undefined);

    render(
      <ReviewSRSToggles
        contentItem={{ id: 'word-2', reviewData: card }}
        handleReviewFunc={handleReviewFunc}
        isSnippet={false}
        isVocab
        isReadyForQuickReview={false}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '4 days' }));

    await waitFor(() => {
      expect(handleReviewFunc).toHaveBeenCalledWith(
        expect.objectContaining({
          wordId: 'word-2',
          fieldToUpdate: expect.objectContaining({
            reviewData: expect.objectContaining({ due: expect.any(Date) }),
          }),
        }),
      );
    });
  });

  it('deletes a sentence from the Easy button when that interval is marked for deletion', async () => {
    mockedSrsCalculation.mockReturnValue({
      ...scheduledOptions,
      easyText: '30 days',
      isScheduledForDeletion: true,
    });
    const handleReviewFunc = jest.fn().mockResolvedValue(undefined);

    render(
      <ReviewSRSToggles
        contentItem={{ id: 'sentence-1', reviewData: card }}
        handleReviewFunc={handleReviewFunc}
        isSnippet={false}
        isVocab={false}
        isReadyForQuickReview
      />,
    );

    fireEvent.click(screen.getByTestId('easy-sentence-1'));

    await waitFor(() => {
      expect(handleReviewFunc).toHaveBeenCalledWith({
        sentenceId: 'sentence-1',
        isRemoveReview: true,
      });
    });
  });

  it('deletes from the gamepad Easy combo when the interval is marked for deletion', async () => {
    mockedSrsCalculation.mockReturnValue({
      ...scheduledOptions,
      isScheduledForDeletion: true,
    });
    const handleReviewFunc = jest.fn().mockResolvedValue(undefined);
    const released = { pressed: false, value: 0 };
    const held = { pressed: true, value: 1 };
    const buttons = Array.from({ length: 16 }, () => ({ ...released }));
    const gamepad = {
      mapping: '',
      buttons,
      axes: [],
    };

    Object.defineProperty(navigator, 'getGamepads', {
      configurable: true,
      value: () => [gamepad],
    });

    let frames = 0;
    const raf = jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb: FrameRequestCallback) => {
        const id = ++frames;
        if (id === 1) {
          buttons[8] = held;
          buttons[0] = held;
          cb(0);
        }
        return id;
      });
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});

    render(
      <ReviewSRSToggles
        contentItem={{ id: 'word-pad', reviewData: card }}
        handleReviewFunc={handleReviewFunc}
        isSnippet={false}
        isVocab
        isReadyForQuickReview
      />,
    );

    await waitFor(() => {
      expect(handleReviewFunc).toHaveBeenCalledWith({
        wordId: 'word-pad',
        isRemoveReview: true,
      });
    });

    raf.mockRestore();
    jest.spyOn(window, 'cancelAnimationFrame').mockRestore();
  });
});
