# Storybook Setup Guide

## Installation Complete! ✓

Storybook has been successfully installed in your project with the following configuration:

### What Was Installed

1. **Storybook Core** (v10.2.6) with Next.js + Vite framework
2. **Addons:**
   - `@chromatic-com/storybook` - Visual testing
   - `@storybook/addon-vitest` - Component testing
   - `@storybook/addon-a11y` - Accessibility testing
   - `@storybook/addon-docs` - Auto-generated documentation
   - `@storybook/addon-onboarding` - Interactive tutorial

### Configuration Files

- `.storybook/main.ts` - Main Storybook configuration
- `.storybook/preview.ts` - Global decorators and parameters (includes your Tailwind styles)
- `.storybook/vitest.setup.ts` - Vitest integration

### Scripts Added

```bash
npm run storybook          # Start Storybook dev server on port 6006
npm run build-storybook    # Build static Storybook for deployment
```

### Example Stories Created

1. **Button Component** - `src/components/ui/button.stories.tsx`
   - Showcases all variants (default, destructive, outline, secondary, ghost, link)
   - All sizes (sm, default, lg, icon)
   - States (disabled, with icons)

2. **BreadCrumbHeaderBase** - `src/components/BreadCrumbHeaderBase.stories.tsx`
   - Basic usage
   - With subheading
   - With navigation buttons
   - With progress header
   - Complete example

### Running Storybook

To start Storybook:

```bash
npm run storybook
```

Then open http://localhost:6006 in your browser.

### Creating New Stories

Create a `.stories.tsx` file next to any component:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { YourComponent } from './YourComponent';

const meta = {
  title: 'Path/ComponentName',
  component: YourComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof YourComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // your props here
  },
};
```

### Best Practices

1. **Keep stories close to components** - Place `.stories.tsx` files in the same directory as the component
2. **Use descriptive story names** - Make it clear what each story demonstrates
3. **Include all variants** - Show different states, sizes, and configurations
4. **Add documentation** - Use JSDoc comments that will appear in the Docs addon
5. **Test accessibility** - Use the a11y addon to catch accessibility issues

### Next Steps

1. Browse the example stories at http://localhost:6006
2. Create stories for your key components
3. Use stories for development and testing
4. Consider integrating with Chromatic for visual regression testing
5. Add interaction tests using `@storybook/test` utilities

### Troubleshooting

- **React 19 Compatibility**: Installed with `--legacy-peer-deps` due to React 19 usage
- **Port conflicts**: Change port with `storybook dev -p <port>`
- **Missing styles**: Global styles are imported in `.storybook/preview.ts`

### Resources

- [Storybook Documentation](https://storybook.js.org/docs)
- [Next.js Framework Guide](https://storybook.js.org/docs/get-started/frameworks/nextjs)
- [Writing Stories](https://storybook.js.org/docs/writing-stories)
- [Testing with Storybook](https://storybook.js.org/docs/writing-tests)
