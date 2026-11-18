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
  },
};
