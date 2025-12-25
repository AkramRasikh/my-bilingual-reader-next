import { useEffect } from 'react';

interface UseAutoScrollToCurrentItemProps {
  trackCurrentState: boolean;
  masterPlay: string;
  transcriptRef: React.RefObject<HTMLElement>;
  isInReviewMode: boolean;
  learnFormattedTranscript: any[];
}

const useAutoScrollToCurrentItem = ({
  trackCurrentState,
  masterPlay,
  transcriptRef,
  isInReviewMode,
  learnFormattedTranscript,
}: UseAutoScrollToCurrentItemProps) => {
  useEffect(() => {
    if (
      !trackCurrentState ||
      !masterPlay ||
      !transcriptRef.current ||
      isInReviewMode
    ) {
      return;
    }

    // Find the current item element
    const currentIndex = learnFormattedTranscript.findIndex(
      (item) => item.id === masterPlay,
    );

    if (currentIndex === -1) return;

    const transcriptList = transcriptRef.current;
    const currentElement = transcriptList.children[
      currentIndex
    ] as HTMLElement;

    if (!currentElement) return;

    // The scrollable container is the parent of transcriptList (TabsContent)
    const scrollContainer = transcriptList.parentElement;
    if (!scrollContainer) return;

    // Get the current scroll position and container dimensions
    const containerScrollTop = scrollContainer.scrollTop;
    const containerHeight = scrollContainer.clientHeight;

    // Calculate element position relative to container
    const elementTop = currentElement.offsetTop;
    const elementHeight = currentElement.offsetHeight;
    const elementBottom = elementTop + elementHeight;

    // Calculate the 30-70% zone within the scrollable area
    const viewportStart = containerScrollTop + containerHeight * 0.3;
    const viewportEnd = containerScrollTop + containerHeight * 0.7;

    // Check if element is outside the 30-70% zone
    const isOutsideViewport =
      elementBottom < viewportStart || elementTop > viewportEnd;

    if (isOutsideViewport) {
      // Scroll to center the element in the container
      const scrollPosition =
        elementTop - containerHeight / 2 + elementHeight / 2;

      scrollContainer.scrollTo({
        top: scrollPosition,
        behavior: 'smooth',
      });
    }
  }, [
    masterPlay,
    trackCurrentState,
    learnFormattedTranscript,
    isInReviewMode,
    transcriptRef,
  ]);
};

export default useAutoScrollToCurrentItem;
