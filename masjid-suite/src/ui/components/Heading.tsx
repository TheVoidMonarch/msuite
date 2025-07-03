import React from 'react';
import { useTheme } from '../ThemeProvider';

// Heading level types
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';

// Heading props interface
export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel;
  size?: HeadingSize;
  children: React.ReactNode;
  color?: 'inherit' | 'primary' | 'secondary' | 'muted' | 'error' | 'success' | 'warning';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  align?: 'left' | 'center' | 'right';
  truncate?: boolean;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'span';
}

// Default size mapping for each heading level
const defaultSizeMapping: Record<HeadingLevel, HeadingSize> = {
  1: '4xl',
  2: '3xl',
  3: '2xl',
  4: 'xl',
  5: 'lg',
  6: 'md',
};

// Get heading styles based on props and theme
const getHeadingStyles = (
  size: HeadingSize,
  color: string,
  weight: string,
  align: string,
  truncate: boolean,
  highContrast: boolean,
  theme: any
): React.CSSProperties => {
  // Color mapping
  const colorMap: Record<string, string> = {
    inherit: 'inherit',
    primary: theme.colors.primary[600],
    secondary: theme.colors.secondary[600],
    muted: theme.colors.neutral[500],
    error: theme.colors.error[600],
    success: theme.colors.success[600],
    warning: theme.colors.warning[600],
  };

  // High contrast color overrides
  if (highContrast) {
    colorMap.primary = theme.colors.highContrast.primary;
    colorMap.secondary = theme.colors.highContrast.secondary;
    colorMap.muted = theme.colors.highContrast.text;
    colorMap.error = theme.colors.error[700];
    colorMap.success = theme.colors.success[700];
    colorMap.warning = theme.colors.warning[700];
  }

  const baseStyles: React.CSSProperties = {
    fontFamily: theme.typography.fontFamily.sans.join(', '),
    fontSize: theme.typography.fontSize[size],
    fontWeight: theme.typography.fontWeight[weight],
    lineHeight: theme.typography.lineHeight.tight,
    color: colorMap[color],
    textAlign: align as any,
    margin: 0,
    padding: 0,
    ...(truncate && {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }),
  };

  return baseStyles;
};

// Get responsive styles for different screen sizes
const getResponsiveStyles = (
  level: HeadingLevel,
  theme: any
): React.CSSProperties => {
  // Responsive font size adjustments
  const responsiveAdjustments: Record<HeadingLevel, React.CSSProperties> = {
    1: {
      fontSize: theme.typography.fontSize['3xl'],
      [`@media (min-width: ${theme.breakpoints.md})`]: {
        fontSize: theme.typography.fontSize['4xl'],
      },
      [`@media (min-width: ${theme.breakpoints.lg})`]: {
        fontSize: theme.typography.fontSize['5xl'],
      },
    },
    2: {
      fontSize: theme.typography.fontSize['2xl'],
      [`@media (min-width: ${theme.breakpoints.md})`]: {
        fontSize: theme.typography.fontSize['3xl'],
      },
      [`@media (min-width: ${theme.breakpoints.lg})`]: {
        fontSize: theme.typography.fontSize['4xl'],
      },
    },
    3: {
      fontSize: theme.typography.fontSize.xl,
      [`@media (min-width: ${theme.breakpoints.md})`]: {
        fontSize: theme.typography.fontSize['2xl'],
      },
      [`@media (min-width: ${theme.breakpoints.lg})`]: {
        fontSize: theme.typography.fontSize['3xl'],
      },
    },
    4: {
      fontSize: theme.typography.fontSize.lg,
      [`@media (min-width: ${theme.breakpoints.md})`]: {
        fontSize: theme.typography.fontSize.xl,
      },
    },
    5: {
      fontSize: theme.typography.fontSize.base,
      [`@media (min-width: ${theme.breakpoints.md})`]: {
        fontSize: theme.typography.fontSize.lg,
      },
    },
    6: {
      fontSize: theme.typography.fontSize.sm,
      [`@media (min-width: ${theme.breakpoints.md})`]: {
        fontSize: theme.typography.fontSize.base,
      },
    },
  };

  return responsiveAdjustments[level] || {};
};

// Heading component
export const Heading: React.FC<HeadingProps> = ({
  level = 2,
  size,
  children,
  color = 'inherit',
  weight = 'semibold',
  align = 'left',
  truncate = false,
  as,
  className,
  style,
  ...props
}) => {
  const { theme, highContrast } = useTheme();

  // Determine the actual size to use
  const actualSize = size || defaultSizeMapping[level];

  // Determine the HTML element to render
  const HeadingElement = as || (`h${level}` as keyof JSX.IntrinsicElements);

  // Get the component styles
  const headingStyles = getHeadingStyles(
    actualSize,
    color,
    weight,
    align,
    truncate,
    highContrast,
    theme
  );

  // Get responsive styles if no custom size is provided
  const responsiveStyles = !size ? getResponsiveStyles(level, theme) : {};

  const combinedStyles: React.CSSProperties = {
    ...headingStyles,
    ...responsiveStyles,
    ...style,
  };

  // Generate proper ARIA attributes
  const ariaLevel = typeof HeadingElement === 'string' && HeadingElement.startsWith('h') 
    ? undefined 
    : level;

  return React.createElement(
    HeadingElement,
    {
      ...props,
      className,
      style: combinedStyles,
      role: ariaLevel ? 'heading' : undefined,
      'aria-level': ariaLevel,
    },
    children
  );
};

// Predefined heading components for common use cases
export const H1: React.FC<Omit<HeadingProps, 'level'>> = (props) => (
  <Heading level={1} {...props} />
);

export const H2: React.FC<Omit<HeadingProps, 'level'>> = (props) => (
  <Heading level={2} {...props} />
);

export const H3: React.FC<Omit<HeadingProps, 'level'>> = (props) => (
  <Heading level={3} {...props} />
);

export const H4: React.FC<Omit<HeadingProps, 'level'>> = (props) => (
  <Heading level={4} {...props} />
);

export const H5: React.FC<Omit<HeadingProps, 'level'>> = (props) => (
  <Heading level={5} {...props} />
);

export const H6: React.FC<Omit<HeadingProps, 'level'>> = (props) => (
  <Heading level={6} {...props} />
);

// Export types
export type { HeadingLevel, HeadingSize };

// Default export
export default Heading;
