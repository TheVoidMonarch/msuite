import React from 'react';
import { useTheme } from '../ThemeProvider';

// Button variant types
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

// Button props interface
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

// Get button styles based on variant and theme
const getButtonStyles = (
  variant: ButtonVariant,
  size: ButtonSize,
  fullWidth: boolean,
  highContrast: boolean,
  theme: any
): React.CSSProperties => {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
    fontFamily: theme.typography.fontFamily.sans.join(', '),
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
    minHeight: theme.accessibility.minButtonHeight, // 60px minimum
    minWidth: theme.accessibility.minButtonWidth,   // 120px minimum
    // Ensure large hit boxes
    padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
  };

  // Size variations
  const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
    sm: {
      fontSize: theme.typography.fontSize.sm,
      padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
      minHeight: theme.accessibility.minButtonHeight,
      minWidth: '100px',
    },
    md: {
      fontSize: theme.typography.fontSize.base,
      padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
      minHeight: theme.accessibility.minButtonHeight,
      minWidth: theme.accessibility.minButtonWidth,
    },
    lg: {
      fontSize: theme.typography.fontSize.lg,
      padding: `${theme.spacing[4]} ${theme.spacing[8]}`,
      minHeight: '72px',
      minWidth: '140px',
    },
  };

  // Variant styles
  const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
      backgroundColor: theme.colors.primary[600],
      color: theme.colors.white,
      border: `1px solid ${theme.colors.primary[600]}`,
      ...(highContrast && {
        backgroundColor: theme.colors.highContrast.primary,
        color: theme.colors.highContrast.background,
        border: `2px solid ${theme.colors.highContrast.border}`,
      }),
    },
    secondary: {
      backgroundColor: theme.colors.secondary[100],
      color: theme.colors.secondary[800],
      border: `1px solid ${theme.colors.secondary[200]}`,
      ...(highContrast && {
        backgroundColor: theme.colors.highContrast.background,
        color: theme.colors.highContrast.text,
        border: `2px solid ${theme.colors.highContrast.border}`,
      }),
    },
    outline: {
      backgroundColor: 'transparent',
      color: theme.colors.primary[600],
      border: `1px solid ${theme.colors.primary[600]}`,
      ...(highContrast && {
        backgroundColor: theme.colors.highContrast.background,
        color: theme.colors.highContrast.primary,
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
        color: theme.colors.highContrast.background,
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

// Get hover styles
const getHoverStyles = (variant: ButtonVariant, theme: any): React.CSSProperties => {
  const hoverStyles: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
      backgroundColor: theme.colors.primary[700],
      borderColor: theme.colors.primary[700],
      transform: 'translateY(-1px)',
      boxShadow: theme.shadows.md,
    },
    secondary: {
      backgroundColor: theme.colors.secondary[200],
      borderColor: theme.colors.secondary[300],
      transform: 'translateY(-1px)',
      boxShadow: theme.shadows.sm,
    },
    outline: {
      backgroundColor: theme.colors.primary[50],
      borderColor: theme.colors.primary[700],
      transform: 'translateY(-1px)',
    },
    ghost: {
      backgroundColor: theme.colors.secondary[100],
      transform: 'translateY(-1px)',
    },
    danger: {
      backgroundColor: theme.colors.error[700],
      borderColor: theme.colors.error[700],
      transform: 'translateY(-1px)',
      boxShadow: theme.shadows.md,
    },
  };

  return hoverStyles[variant];
};

// Get focus styles for accessibility
const getFocusStyles = (highContrast: boolean, theme: any): React.CSSProperties => ({
  outline: 'none',
  boxShadow: `0 0 0 ${theme.accessibility.focusRingWidth} ${
    highContrast ? theme.accessibility.highContrastFocusRingColor : theme.accessibility.focusRingColor
  }`,
  ...(highContrast && {
    outline: `3px solid ${theme.colors.highContrast.focus}`,
    outlineOffset: '2px',
  }),
});

// Get disabled styles
const getDisabledStyles = (): React.CSSProperties => ({
  opacity: 0.6,
  cursor: 'not-allowed',
  pointerEvents: 'none',
  transform: 'none',
  boxShadow: 'none',
});

// Loading spinner component
const LoadingSpinner: React.FC<{ size: number }> = ({ size }) => (
  <div
    style={{
      width: size,
      height: size,
      border: '2px solid transparent',
      borderTop: '2px solid currentColor',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    }}
    aria-hidden="true"
  />
);

// Button component
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className,
  style,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}) => {
  const { theme, highContrast } = useTheme();
  const [isHovered, setIsHovered] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  const buttonStyles = getButtonStyles(variant, size, fullWidth, highContrast, theme);
  const hoverStyles = isHovered ? getHoverStyles(variant, theme) : {};
  const focusStyles = isFocused ? getFocusStyles(highContrast, theme) : {};
  const disabledStyles = (disabled || loading) ? getDisabledStyles() : {};

  const combinedStyles: React.CSSProperties = {
    ...buttonStyles,
    ...hoverStyles,
    ...focusStyles,
    ...disabledStyles,
    ...style,
  };

  const isDisabled = disabled || loading;
  const hasText = typeof children === 'string' && children.length > 0;
  
  // Generate accessible label
  const accessibleLabel = ariaLabel || (hasText ? undefined : 'Button');

  return (
    <>
      {/* Add keyframes for loading spinner */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <button
        {...props}
        className={className}
        style={combinedStyles}
        disabled={isDisabled}
        aria-label={accessibleLabel}
        aria-describedby={ariaDescribedBy}
        aria-busy={loading}
        onMouseEnter={() => !isDisabled && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        type={props.type || 'button'}
      >
        {loading && <LoadingSpinner size={16} />}
        {!loading && leftIcon && (
          <span aria-hidden="true" style={{ display: 'flex', alignItems: 'center' }}>
            {leftIcon}
          </span>
        )}
        <span style={{ display: 'flex', alignItems: 'center' }}>
          {children}
        </span>
        {!loading && rightIcon && (
          <span aria-hidden="true" style={{ display: 'flex', alignItems: 'center' }}>
            {rightIcon}
          </span>
        )}
      </button>
    </>
  );
};

// Export button types
export type { ButtonVariant, ButtonSize };

// Default export
export default Button;
