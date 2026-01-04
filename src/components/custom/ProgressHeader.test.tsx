import { render, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import ProgressHeader, { useProgressHeader } from './ProgressHeader';

describe('ProgressHeader', () => {
  describe('Component', () => {
    it('should render progress header with text', () => {
      render(<ProgressHeader progressState={50} progressText='50% Complete' />);

      const progressHeader = screen.getByTestId('progress-header');
      const progressText = screen.getByTestId('progress-header-text');

      expect(progressHeader).toBeInTheDocument();
      expect(progressText).toHaveTextContent('50% Complete');
    });

    it('should render with correct progress value', () => {
      render(<ProgressHeader progressState={75} progressText='75% Complete' />);

      const progressText = screen.getByTestId('progress-header-text');
      expect(progressText).toHaveTextContent('75% Complete');
    });

    it('should apply correct styling when small prop is true', () => {
      const { container } = render(
        <ProgressHeader progressState={50} progressText='Test' small={true} />,
      );

      const progress = container.querySelector('.w-7\\/12');
      expect(progress).toBeInTheDocument();
    });

    it('should apply full width styling when small prop is false', () => {
      const { container } = render(
        <ProgressHeader progressState={50} progressText='Test' small={false} />,
      );

      const progress = container.querySelector('.w-full');
      expect(progress).toBeInTheDocument();
    });

    it('should apply full width styling by default when small prop is not provided', () => {
      const { container } = render(
        <ProgressHeader progressState={50} progressText='Test' />,
      );

      const progress = container.querySelector('.w-full');
      expect(progress).toBeInTheDocument();
    });

    it('should render with 0% progress', () => {
      render(<ProgressHeader progressState={0} progressText='Starting...' />);

      const progressText = screen.getByTestId('progress-header-text');
      expect(progressText).toHaveTextContent('Starting...');
    });

    it('should render with 100% progress', () => {
      render(<ProgressHeader progressState={100} progressText='Complete!' />);

      const progressText = screen.getByTestId('progress-header-text');
      expect(progressText).toHaveTextContent('Complete!');
    });
  });

  describe('useProgressHeader hook', () => {
    it('should calculate progress correctly', () => {
      const setProgressState = jest.fn();
      renderHook(
        ({ totalItems, remainingItems }) =>
          useProgressHeader({
            setProgressState,
            totalItems,
            remainingItems,
          }),
        {
          initialProps: {
            totalItems: 10,
            remainingItems: 5,
          },
        },
      );

      expect(setProgressState).toHaveBeenCalledWith(50);
    });

    it('should calculate 0% progress when no progress is made', () => {
      const setProgressState = jest.fn();
      renderHook(() =>
        useProgressHeader({
          setProgressState,
          totalItems: 10,
          remainingItems: 10,
        }),
      );

      expect(setProgressState).toHaveBeenCalledWith(0);
    });

    it('should calculate 100% progress when all items are completed', () => {
      const setProgressState = jest.fn();
      renderHook(() =>
        useProgressHeader({
          setProgressState,
          totalItems: 10,
          remainingItems: 0,
        }),
      );

      expect(setProgressState).toHaveBeenCalledWith(100);
    });

    it('should not call setProgressState when totalItems is null', () => {
      const setProgressState = jest.fn();
      renderHook(() =>
        useProgressHeader({
          setProgressState,
          totalItems: null,
          remainingItems: 5,
        }),
      );

      expect(setProgressState).not.toHaveBeenCalled();
    });

    it('should not call setProgressState when remainingItems is null', () => {
      const setProgressState = jest.fn();
      renderHook(() =>
        useProgressHeader({
          setProgressState,
          totalItems: 10,
          remainingItems: null,
        }),
      );

      expect(setProgressState).not.toHaveBeenCalled();
    });

    it('should update progress when remainingItems changes', () => {
      const setProgressState = jest.fn();
      const { rerender } = renderHook(
        ({ totalItems, remainingItems }) =>
          useProgressHeader({
            setProgressState,
            totalItems,
            remainingItems,
          }),
        {
          initialProps: {
            totalItems: 10,
            remainingItems: 10,
          },
        },
      );

      expect(setProgressState).toHaveBeenCalledWith(0);

      rerender({ totalItems: 10, remainingItems: 5 });
      expect(setProgressState).toHaveBeenCalledWith(50);

      rerender({ totalItems: 10, remainingItems: 2 });
      expect(setProgressState).toHaveBeenCalledWith(80);
    });

    it('should recalculate progress when totalItems changes', () => {
      const setProgressState = jest.fn();
      const { rerender } = renderHook(
        ({ totalItems, remainingItems }) =>
          useProgressHeader({
            setProgressState,
            totalItems,
            remainingItems,
          }),
        {
          initialProps: {
            totalItems: 10,
            remainingItems: 5,
          },
        },
      );

      expect(setProgressState).toHaveBeenCalledWith(50);

      rerender({ totalItems: 20, remainingItems: 5 });
      expect(setProgressState).toHaveBeenCalledWith(75);
    });
  });
});
