import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from './ui/ThemeProvider';

// Create a custom render function that includes the ThemeProvider
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
};

// Override the default render method with our custom one
export const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
// Override the render method
export { customRender as render };
