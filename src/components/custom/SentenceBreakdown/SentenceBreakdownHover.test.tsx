import { fireEvent, render, screen } from '@testing-library/react';
import SentenceBreakdownHover from './SentenceBreakdownHover';

const defaultProps = {
  handleSaveFunc: jest.fn(),
  surfaceForm: '其他政党',
  meaning: 'other parties',
  color: 'red',
  wordIsSaved: false,
  handleBreakdownSentence: jest.fn(),
  sentenceId: 's1',
};

const touchWord = (element: Element, at = 0) => {
  jest.spyOn(performance, 'now').mockReturnValue(at);
  fireEvent.touchStart(element);
};

describe('SentenceBreakdownHover', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('opens the save widget on touch and keeps it open after pointer leave', () => {
    render(<SentenceBreakdownHover {...defaultProps} />);
    const word = screen.getByTestId('sentence-breakdown-hover-trigger');

    fireEvent.touchStart(word);

    expect(
      screen.getByTestId('sentence-breakdown-hover-content'),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('breakdown-save-word-deepseek-button'),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('breakdown-save-word-google-button'),
    ).toBeInTheDocument();

    fireEvent.pointerLeave(word);
    expect(
      screen.getByTestId('sentence-breakdown-hover-content'),
    ).toBeInTheDocument();
  });

  it('does not open on mouse pointer down', () => {
    render(<SentenceBreakdownHover {...defaultProps} />);

    fireEvent.pointerDown(
      screen.getByTestId('sentence-breakdown-hover-trigger'),
      {
        pointerType: 'mouse',
      },
    );

    expect(
      screen.queryByTestId('sentence-breakdown-hover-content'),
    ).not.toBeInTheDocument();
  });

  it('stays open when pointerdown and touchstart fire on the same tap', () => {
    render(<SentenceBreakdownHover {...defaultProps} />);
    const word = screen.getByTestId('sentence-breakdown-hover-trigger');

    fireEvent.pointerDown(word, { pointerType: 'touch' });
    fireEvent.touchStart(word);

    expect(
      screen.getByTestId('sentence-breakdown-hover-content'),
    ).toBeInTheDocument();
  });

  it('closes after a later second tap on the same word', () => {
    render(<SentenceBreakdownHover {...defaultProps} />);
    const word = screen.getByTestId('sentence-breakdown-hover-trigger');

    touchWord(word, 0);
    expect(
      screen.getByTestId('sentence-breakdown-hover-content'),
    ).toBeInTheDocument();

    touchWord(word, 500);
    expect(
      screen.queryByTestId('sentence-breakdown-hover-content'),
    ).not.toBeInTheDocument();
  });

  it('saves via Deepseek and Google then closes', () => {
    const { unmount } = render(<SentenceBreakdownHover {...defaultProps} />);

    fireEvent.touchStart(
      screen.getByTestId('sentence-breakdown-hover-trigger'),
    );
    fireEvent.click(screen.getByTestId('breakdown-save-word-deepseek-button'));

    expect(defaultProps.handleSaveFunc).toHaveBeenCalledWith(
      false,
      '其他政党',
      'other parties',
    );
    expect(
      screen.queryByTestId('sentence-breakdown-hover-content'),
    ).not.toBeInTheDocument();

    unmount();
    render(<SentenceBreakdownHover {...defaultProps} />);
    fireEvent.touchStart(
      screen.getByTestId('sentence-breakdown-hover-trigger'),
    );
    fireEvent.click(screen.getByTestId('breakdown-save-word-google-button'));

    expect(defaultProps.handleSaveFunc).toHaveBeenCalledWith(
      true,
      '其他政党',
      'other parties',
    );
  });

  it('closes when tapping outside after a touch open', () => {
    render(
      <div>
        <SentenceBreakdownHover {...defaultProps} />
        <button type='button'>outside</button>
      </div>,
    );

    const word = screen.getByTestId('sentence-breakdown-hover-trigger');
    touchWord(word, 0);
    expect(
      screen.getByTestId('sentence-breakdown-hover-content'),
    ).toBeInTheDocument();

    jest.spyOn(performance, 'now').mockReturnValue(500);
    fireEvent.pointerDown(screen.getByText('outside'));
    expect(
      screen.queryByTestId('sentence-breakdown-hover-content'),
    ).not.toBeInTheDocument();
  });
});
