import type { Meta, StoryObj } from '@storybook/react';
import BreadCrumbHeaderBase from './BreadCrumbHeaderBase';
import { Button } from './ui/button';

const meta = {
  title: 'Components/BreadCrumbHeaderBase',
  component: BreadCrumbHeaderBase,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof BreadCrumbHeaderBase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    heading: 'Home',
    onClick: () => console.log('Clicked!'),
  },
};

export const WithSubHeading: Story = {
  args: {
    heading: 'Content',
    subHeading: 'Video Title',
    onClick: () => console.log('Clicked heading!'),
  },
};

export const WithHref: Story = {
  args: {
    heading: 'Home',
    href: '/',
    onClick: () => {},
  },
};

export const WithNavigationButtons: Story = {
  args: {
    heading: 'Home',
    subHeading: 'Current Page',
    onClick: () => console.log('Clicked!'),
    navigationButtons: () => [
      <Button key="prev" variant="outline" size="sm">
        Previous
      </Button>,
      <Button key="next" variant="outline" size="sm">
        Next
      </Button>,
    ],
  },
};

export const WithProgressHeader: Story = {
  args: {
    heading: 'Learning',
    subHeading: 'Lesson 5',
    onClick: () => console.log('Clicked!'),
    progressHeaderComponent: () => (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Progress: 3/10</span>
      </div>
    ),
  },
};

export const Complete: Story = {
  args: {
    heading: 'Content Library',
    subHeading: 'Japanese Video',
    href: '/content',
    onClick: () => {},
    navigationButtons: () => [
      <Button key="back" variant="ghost" size="sm">
        ← Back
      </Button>,
      <Button key="next" size="sm">
        Next →
      </Button>,
    ],
    progressHeaderComponent: () => (
      <div className="flex items-center gap-2">
        <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary" style={{ width: '60%' }} />
        </div>
        <span className="text-xs text-muted-foreground">6/10</span>
      </div>
    ),
  },
};
