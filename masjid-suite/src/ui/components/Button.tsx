import React from 'react';
import { useTheme } from '../ThemeProvider';
import { Theme } from '../designSystem';
import './Button.css'; // External CSS file for styles

// Button variant types
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

// Button props interface
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button style variant */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Whether the button should take full width of its container */
  fullWidth?: boolean;
  /** Show loading state */
  loading?: boolean;
  /** Icon to display on the left side of the button */
  leftIcon?: React.ReactNode;
  /** Icon to display on the right side of the button */
  rightIcon?: React.ReactNode;
  /** Button content */
  children: React.ReactNode;
  /** Whether to use high contrast mode for better accessibility */
  highContrast?: boolean;
  /** Custom class name */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
  /** ARIA label for accessibility */
  'aria-label'?: string;
  /** ARIA describedby for additional accessibility information */
  'aria-describedby'?: string;
  /** ARIA controls for accessibility */
  'aria-controls'?: string;
  /** ARIA expanded state for accessibility */
  'aria-expanded'?: boolean | 'true' | 'false';
  /** ARIA pressed state for toggle buttons */
  'aria-pressed'?: boolean | 'true' | 'false';
}

// Get button styles based on variant and theme
const getButtonStyles = (
  variant: ButtonVariant,
  size: ButtonSize,
  fullWidth: boolean,
  highContrast: boolean,
  theme: Theme
): React.CSSProperties => {
  // Use CSS custom properties for better theming support
  const cssVars = {
    '--button-bg': theme.colors.primary[600],
    '--button-color': theme.colors.white,
    '--button-border': theme.colors.primary[600],
    '--button-hover-bg': theme.colors.primary[700],
    '--button-active-bg': theme.colors.primary[800],
    '--button-disabled-opacity': '0.6',
  } as React.CSSProperties;
  // Convert font family to string if it's an array
  const fontFamily = Array.isArray(theme.typography.fontFamily.sans)
    ? theme.typography.fontFamily.sans.join(', ')
    : String(theme.typography.fontFamily.sans);

  const baseStyles: React.CSSProperties = {
    ...cssVars,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
    fontFamily,
    fontWeight: theme.typography.fontWeight.medium,
    textAlign: 'center',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    cursor: 'pointer',
    border: '1px solid transparent',
    borderRadius: theme.borderRadius.md,
    transition: `all ${theme.transitions.normal} ease`,
    textDecoration: 'none',
    position: 'relative',
    overflow: 'hidden',
    // Accessibility requirements
    minHeight: theme.accessibility.minButtonHeight,
    minWidth: theme.accessibility.minButtonWidth,
    padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
    // High contrast mode
    ...(highContrast && {
      border: '2px solid',
      outline: '2px solid transparent',
      outlineOffset: '2px',
    }),
  };

  // Size variations
  const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
    sm: {
      fontSize: theme.typography.fontSize.xs,
      padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
      minHeight: theme.accessibility.minButtonHeight,
      minWidth: '100px',
    },
    md: {
      fontSize: theme.typography.fontSize.sm,
      padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
      minHeight: theme.accessibility.minButtonHeight,
      minWidth: theme.accessibility.minButtonWidth,
    },
    lg: {
      fontSize: theme.typography.fontSize.base,
      padding: `${theme.spacing[4]} ${theme.spacing[8]}`,
      minHeight: '72px',
      minWidth: '140px',
    },
  };

  // Variant styles - using CSS classes for hover/active states
  const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
      backgroundColor: 'var(--button-bg, #0ea5e9)',
      color: 'var(--button-color, #ffffff)',
      borderColor: 'var(--button-border, #0ea5e9)',
      ...(highContrast && {
        backgroundColor: 'transparent',
        color: 'CanvasText',
        borderColor: 'CanvasText',
      }),
    },
    secondary: {
      backgroundColor: theme.colors.secondary[100],
      color: theme.colors.secondary[800],
      border: `1px solid ${theme.colors.secondary[200]}`,
      ...(highContrast && {
        backgroundColor: 'transparent',
        color: 'CanvasText',
        border: '1px solid CanvasText',
      }),
    },
    outline: {
      backgroundColor: 'transparent',
      color: theme.colors.primary[600],
      border: `1px solid ${theme.colors.primary[600]}`,
      ...(highContrast && {
        backgroundColor: theme.colors.highContrast.background,
        color: theme.colors.highContrast.secondary,
        border: `2px solid ${theme.colors.highContrast.border}`,
      }),
    },
    ghost: {
      backgroundColor: 'transparent',
      color: theme.colors.secondary[700],
      border: '1px solid transparent',
      ...(highContrast && {
        backgroundColor: theme.colors.highContrast.background,
        color: theme.colors.highContrast.text,
        border: `2px solid ${theme.colors.highContrast.border}`,
      }),
    },
    danger: {
      backgroundColor: theme.colors.error[600],
      color: theme.colors.white,
      border: `1px solid ${theme.colors.error[600]}`,
      ...(highContrast && {
        backgroundColor: theme.colors.error[700],
        outlineColor: theme.colors.highContrast.focus,
        border: `2px solid ${theme.colors.highContrast.border}`,
      }),
    },
  };

  // Full width styles
  const fullWidthStyles: React.CSSProperties = fullWidth ? { width: '100%' } : {};

  return {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...fullWidthStyles,
  };
};

// Button component
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  children,
  disabled = false,
  className = '',
  style,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-controls': ariaControls,
  'aria-expanded': ariaExpanded,
  'aria-pressed': ariaPressed,
  ...props
}, ref) => {
  const { theme, highContrast: isHighContrast } = useTheme();

  const highContrast = props.highContrast ?? isHighContrast;

  const buttonStyles = React.useMemo<React.CSSProperties>(() => {
    const styles: React.CSSProperties = {
      ...getButtonStyles(variant, size, fullWidth, highContrast, theme),
      ...(fullWidth && { width: '100%' }),
      ...(disabled && {
        cursor: 'not-allowed',
        opacity: 0.6,
      })
    };

    // Only apply position if loading
    if (loading) {
      styles.position = 'relative';
    }

    return styles;
  }, [variant, size, fullWidth, highContrast, theme, disabled, loading]);

  // Build class names based on props
  const buttonClasses = [
    'button',
    `button--${variant}`,
    loading ? 'button--loading' : '',
    fullWidth ? 'button--full-width' : '',
    className
  ].filter(Boolean).join(' ').trim();

  // Handle keyboard events for accessibility
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    // Handle space/enter key for button activation
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!disabled && !loading) {
        props.onClick?.(e as unknown as React.MouseEvent<HTMLButtonElement>);
      }
    }
    
    // Call the original onKeyDown if provided
    props.onKeyDown?.(e);
  };

  const isDisabled = disabled || loading;
  const buttonType = props.type || 'button';

  // Loading spinner component
  const LoadingSpinner = () => (
    <span 
      className="button__loading"
      role="status"
      aria-hidden="true"
    >
      <span className="sr-only">Loading...</span>
    </span>
  );

  return (
        <button
        ref={ref}
        type={buttonType}
        className={buttonClasses}
        style={{
          ...buttonStyles,
          ...style,
        }}
        disabled={isDisabled}
        aria-label={loading ? 'Loading...' : ariaLabel}
        {...(ariaDescribedBy && { 'aria-describedby': ariaDescribedBy })}
        {...(ariaControls && { 'aria-controls': ariaControls })}
        {...(typeof ariaExpanded !== 'undefined' && { 'aria-expanded': ariaExpanded })}
        {...(typeof ariaPressed !== 'undefined' && { 'aria-pressed': ariaPressed })}
        aria-busy={loading}
        onMouseEnter={(e) => !disabled && props.onMouseEnter?.(e)}
      onMouseLeave={props.onMouseLeave}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
      onKeyDown={handleKeyDown}
      onClick={!disabled && !loading ? props.onClick : undefined}
    >
        {loading && <LoadingSpinner />}
      <span className="button__content">
        {leftIcon && (
          <span className="button__icon button__icon--left">
            {leftIcon}
          </span>
        )}
        {children}
        {rightIcon && (
          <span className="button__icon button__icon--right">
            {rightIcon}
          </span>
        )}
      </span>
      </button>
  );
});

// Add display name for better debugging
Button.displayName = 'Button';

// Default export
export default Button;

// CSS moved to external Button.css file
