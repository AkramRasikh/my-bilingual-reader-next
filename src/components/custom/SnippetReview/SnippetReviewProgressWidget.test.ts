import { getSnippetBoundaryFillStyle } from './SnippetReviewProgressWidget';

describe('getSnippetBoundaryFillStyle', () => {
  it('fills from the start of a left-to-right boundary', () => {
    expect(getSnippetBoundaryFillStyle(0.4, 'ltr').backgroundImage).toBe(
      'linear-gradient(to right, #cde2fe 40%, #f6f7f8 40%)',
    );
  });

  it('fills from the start of a right-to-left boundary', () => {
    expect(getSnippetBoundaryFillStyle(0.4, 'rtl').backgroundImage).toBe(
      'linear-gradient(to left, #cde2fe 40%, #f6f7f8 40%)',
    );
  });

  it('keeps the fill inside the boundary', () => {
    expect(getSnippetBoundaryFillStyle(-1, 'ltr').backgroundImage).toBe(
      'linear-gradient(to right, #cde2fe 0%, #f6f7f8 0%)',
    );
    expect(getSnippetBoundaryFillStyle(2, 'ltr').backgroundImage).toBe(
      'linear-gradient(to right, #cde2fe 100%, #f6f7f8 100%)',
    );
  });
});
