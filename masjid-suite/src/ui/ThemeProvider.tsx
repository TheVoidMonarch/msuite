import React, { createContext, useContext, useEffect, useState } from 'react';
import { Theme, theme as defaultTheme } from './designSystem';

// Theme context type
interface ThemeContextType {
  theme: Theme;
  highContrast: boolean;
  toggleHighContrast: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

// Create theme context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider props
interface ThemeProviderProps {
  children: React.ReactNode;
  theme?: Theme;
}

// High contrast theme override
const createHighContrastTheme = (baseTheme: Theme): Theme => ({
  ...baseTheme,
  colors: {
    ...baseTheme.colors,
    primary: {
      ...baseTheme.colors.primary,
      500: baseTheme.colors.highContrast.primary,
      600: baseTheme.colors.highContrast.primary,
    },
    secondary: {
      ...baseTheme.colors.secondary,
      500: baseTheme.colors.highContrast.secondary,
      600: baseTheme.colors.highContrast.secondary,
    },
  },
});

// Theme provider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  theme = defaultTheme,
}) => {
  const [highContrast, setHighContrast] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check for user's contrast preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    const handleChange = (e: MediaQueryListEvent) => {
      setHighContrast(e.matches);
    };

    // Set initial value
    setHighContrast(mediaQuery.matches);

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Check for user's color scheme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    // Set initial value
    setIsDarkMode(mediaQuery.matches);

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    const currentTheme = highContrast ? createHighContrastTheme(theme) : theme;

    // Set CSS custom properties
    root.style.setProperty('--color-primary-50', currentTheme.colors.primary[50]);
    root.style.setProperty('--color-primary-100', currentTheme.colors.primary[100]);
    root.style.setProperty('--color-primary-200', currentTheme.colors.primary[200]);
    root.style.setProperty('--color-primary-300', currentTheme.colors.primary[300]);
    root.style.setProperty('--color-primary-400', currentTheme.colors.primary[400]);
    root.style.setProperty('--color-primary-500', currentTheme.colors.primary[500]);
    root.style.setProperty('--color-primary-600', currentTheme.colors.primary[600]);
    root.style.setProperty('--color-primary-700', currentTheme.colors.primary[700]);
    root.style.setProperty('--color-primary-800', currentTheme.colors.primary[800]);
    root.style.setProperty('--color-primary-900', currentTheme.colors.primary[900]);

    root.style.setProperty('--color-secondary-50', currentTheme.colors.secondary[50]);
    root.style.setProperty('--color-secondary-100', currentTheme.colors.secondary[100]);
    root.style.setProperty('--color-secondary-200', currentTheme.colors.secondary[200]);
    root.style.setProperty('--color-secondary-300', currentTheme.colors.secondary[300]);
    root.style.setProperty('--color-secondary-400', currentTheme.colors.secondary[400]);
    root.style.setProperty('--color-secondary-500', currentTheme.colors.secondary[500]);
    root.style.setProperty('--color-secondary-600', currentTheme.colors.secondary[600]);
    root.style.setProperty('--color-secondary-700', currentTheme.colors.secondary[700]);
    root.style.setProperty('--color-secondary-800', currentTheme.colors.secondary[800]);
    root.style.setProperty('--color-secondary-900', currentTheme.colors.secondary[900]);

    root.style.setProperty('--color-success-500', currentTheme.colors.success[500]);
    root.style.setProperty('--color-warning-500', currentTheme.colors.warning[500]);
    root.style.setProperty('--color-error-500', currentTheme.colors.error[500]);

    root.style.setProperty('--color-neutral-50', currentTheme.colors.neutral[50]);
    root.style.setProperty('--color-neutral-100', currentTheme.colors.neutral[100]);
    root.style.setProperty('--color-neutral-200', currentTheme.colors.neutral[200]);
    root.style.setProperty('--color-neutral-300', currentTheme.colors.neutral[300]);
    root.style.setProperty('--color-neutral-400', currentTheme.colors.neutral[400]);
    root.style.setProperty('--color-neutral-500', currentTheme.colors.neutral[500]);
    root.style.setProperty('--color-neutral-600', currentTheme.colors.neutral[600]);
    root.style.setProperty('--color-neutral-700', currentTheme.colors.neutral[700]);
    root.style.setProperty('--color-neutral-800', currentTheme.colors.neutral[800]);
    root.style.setProperty('--color-neutral-900', currentTheme.colors.neutral[900]);

    // Set spacing variables
    Object.entries(currentTheme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });

    // Set typography variables
    root.style.setProperty('--font-family-sans', currentTheme.typography.fontFamily.sans.join(', '));
    root.style.setProperty('--font-family-mono', currentTheme.typography.fontFamily.mono.join(', '));

    Object.entries(currentTheme.typography.fontSize).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value);
    });

    // Set accessibility variables
    root.style.setProperty('--min-button-height', currentTheme.accessibility.minButtonHeight);
    root.style.setProperty('--min-button-width', currentTheme.accessibility.minButtonWidth);
    root.style.setProperty('--min-touch-target', currentTheme.accessibility.minTouchTarget);
    root.style.setProperty('--focus-ring-width', currentTheme.accessibility.focusRingWidth);
    root.style.setProperty('--focus-ring-offset', currentTheme.accessibility.focusRingOffset);
    root.style.setProperty('--focus-ring-color', 
      highContrast ? currentTheme.accessibility.highContrastFocusRingColor : currentTheme.accessibility.focusRingColor
    );

    // Set border radius variables
    Object.entries(currentTheme.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--border-radius-${key}`, value);
    });

    // Set shadow variables
    Object.entries(currentTheme.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });

    // Set transition variables
    Object.entries(currentTheme.transitions).forEach(([key, value]) => {
      root.style.setProperty(`--transition-${key}`, value);
    });

    // Set data attributes for theme state
    root.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    root.setAttribute('data-high-contrast', highContrast.toString());

    // Set classes for CSS selectors
    root.classList.toggle('high-contrast', highContrast);
    root.classList.toggle('dark', isDarkMode);
  }, [theme, highContrast, isDarkMode]);

  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const contextValue: ThemeContextType = {
    theme: highContrast ? createHighContrastTheme(theme) : theme,
    highContrast,
    toggleHighContrast,
    isDarkMode,
    toggleDarkMode,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Higher-order component for theme consumption
export const withTheme = <P extends object>(
  Component: React.ComponentType<P & { theme: Theme }>
) => {
  const ThemedComponent = (props: P) => {
    const { theme } = useTheme();
    return <Component {...props} theme={theme} />;
  };

  ThemedComponent.displayName = `withTheme(${Component.displayName || Component.name})`;
  return ThemedComponent;
};

// Theme-aware styled component helper
export const createStyledComponent = <T extends keyof JSX.IntrinsicElements>(
  tag: T,
  baseStyles: (theme: Theme) => React.CSSProperties,
  variants?: Record<string, (theme: Theme) => React.CSSProperties>
) => {
  return React.forwardRef<
    React.ElementRef<T>,
    React.ComponentPropsWithoutRef<T> & {
      variant?: keyof typeof variants;
    }
  >(({ variant, style, ...props }, ref) => {
    const { theme } = useTheme();
    const componentStyles = baseStyles(theme);
    const variantStyles = variant && variants?.[variant] ? variants[variant](theme) : {};

    return React.createElement(tag, {
      ...props,
      ref,
      style: {
        ...componentStyles,
        ...variantStyles,
        ...style,
      },
    });
  });
};
