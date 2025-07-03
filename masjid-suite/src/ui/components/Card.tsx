import React from 'react';
import { useTheme } from '../ThemeProvider';

// Card variant types
export type CardVariant = 'elevated' | 'outlined' | 'filled' | 'ghost';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

// Card props interface
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  interactive?: boolean;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  as?: 'div' | 'article' | 'section' | 'aside' | 'main';
  href?: string;
  target?: string;
  rel?: string;
}

// Get card styles based on variant and theme
const getCardStyles = (
  variant: CardVariant,
  padding: CardPadding,
  interactive: boolean,
  disabled: boolean,
  loading: boolean,
  isHovered: boolean,
  isFocused: boolean,
  highContrast: boolean,
  theme: any
): React.CSSProperties => {
  const baseStyles: React.CSSProperties = {
    display: 'block',
    position: 'relative',
    borderRadius: theme.borderRadius.lg,
    transition: `all ${theme.transitions.normal} ease`,
    overflow: 'hidden',
    ...(interactive && {
      cursor: 'pointer',
      userSelect: 'none',
    }),
    ...(disabled && {
      opacity: 0.6,
      cursor: 'not-allowed',
      pointerEvents: 'none',
    }),
    ...(loading && {
      cursor: 'wait',
      pointerEvents: 'none',
    }),
  };

  // Padding styles
  const paddingStyles: Record<CardPadding, React.CSSProperties> = {
    none: { padding: 0 },
    sm: { padding: theme.spacing[3] },
    md: { padding: theme.spacing[4] },
    lg: { padding: theme.spacing[6] },
    xl: { padding: theme.spacing[8] },
  };

  // Variant styles
  const variantStyles: Record<CardVariant, React.CSSProperties> = {
    elevated: {
      backgroundColor: theme.colors.white,
      boxShadow: theme.shadows.md,
      border: '1px solid transparent',
      ...(highContrast && {
        backgroundColor: theme.colors.highContrast.background,
        border: `2px solid ${theme.colors.highContrast.border}`,
        boxShadow: 'none',
      }),
    },
    outlined: {
      backgroundColor: theme.colors.white,
      border: `1px solid ${theme.colors.neutral[200]}`,
      boxShadow: 'none',
      ...(highContrast && {
        backgroundColor: theme.colors.highContrast.background,
        border: `2px solid ${theme.colors.highContrast.border}`,
      }),
    },
    filled: {
      backgroundColor: theme.colors.neutral[50],
      border: '1px solid transparent',
      boxShadow: 'none',
      ...(highContrast && {
        backgroundColor: theme.colors.neutral[100],
        border: `2px solid ${theme.colors.highContrast.border}`,
      }),
    },
    ghost: {
      backgroundColor: 'transparent',
      border: '1px solid transparent',
      boxShadow: 'none',
      ...(highContrast && {
        backgroundColor: theme.colors.highContrast.background,
        border: `2px solid ${theme.colors.highContrast.border}`,
      }),
    },
  };

  // Interactive hover styles
  const hoverStyles: React.CSSProperties = interactive && isHovered && !disabled && !loading ? {
    transform: 'translateY(-2px)',
    ...(variant === 'elevated' && {
      boxShadow: theme.shadows.lg,
    }),
    ...(variant === 'outlined' && {
      borderColor: theme.colors.primary[300],
      boxShadow: theme.shadows.sm,
    }),
    ...(variant === 'filled' && {
      backgroundColor: theme.colors.neutral[100],
      boxShadow: theme.shadows.sm,
    }),
    ...(variant === 'ghost' && {
      backgroundColor: theme.colors.neutral[50],
    }),
  } : {};

  // Focus styles for accessibility
  const focusStyles: React.CSSProperties = interactive && isFocused ? {
    outline: 'none',
    boxShadow: `0 0 0 ${theme.accessibility.focusRingWidth} ${
      highContrast ? theme.accessibility.highContrastFocusRingColor : theme.accessibility.focusRingColor
    }`,
    ...(highContrast && {
      outline: `3px solid ${theme.colors.highContrast.focus}`,
      outlineOffset: '2px',
    }),
  } : {};

  return {
    ...baseStyles,
    ...paddingStyles[padding],
    ...variantStyles[variant],
    ...hoverStyles,
    ...focusStyles,
  };
};

// Loading overlay component
const LoadingOverlay: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: theme.zIndex.overlay,
      }}
      aria-hidden="true"
    >
      <div
        style={{
          width: 32,
          height: 32,
          border: '3px solid transparent',
          borderTop: `3px solid ${theme.colors.primary[600]}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
    </div>
  );
};

// Card component
export const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  padding = 'md',
  interactive = false,
  disabled = false,
  loading = false,
  children,
  as = 'div',
  href,
  target,
  rel,
  className,
  style,
  onClick,
  onKeyDown,
  tabIndex,
  role,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  ...props
}) => {
  const { theme, highContrast } = useTheme();
  const [isHovered, setIsHovered] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  const cardStyles = getCardStyles(
    variant,
    padding,
    interactive,
    disabled,
    loading,
    isHovered,
    isFocused,
    highContrast,
    theme
  );

  const combinedStyles: React.CSSProperties = {
    ...cardStyles,
    ...style,
  };

  // Handle keyboard events for interactive cards
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (interactive && !disabled && !loading) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (onClick) {
          onClick(event as any);
        } else if (href) {
          window.open(href, target || '_self', rel);
        }
      }
    }
    if (onKeyDown) {
      onKeyDown(event);
    }
  };

  // Handle click events
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (interactive && !disabled && !loading) {
      if (onClick) {
        onClick(event);
      } else if (href) {
        if (target === '_blank') {
          window.open(href, target, rel);
        } else {
          window.location.href = href;
        }
      }
    }
  };

  // Determine appropriate ARIA attributes
  const getAriaAttributes = () => {
    const attrs: any = {
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': ariaDescribedBy,
    };

    if (interactive) {
      attrs.role = role || (href ? 'link' : 'button');
      attrs.tabIndex = disabled || loading ? -1 : (tabIndex ?? 0);
      attrs['aria-disabled'] = disabled || loading;
    }

    if (loading) {
      attrs['aria-busy'] = true;
    }

    return attrs;
  };

  // Determine the element to render
  const Element = href && !disabled && !loading ? 'a' : as;

  const elementProps = {
    ...props,
    ...getAriaAttributes(),
    className,
    style: combinedStyles,
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    onMouseEnter: () => !disabled && !loading && setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
    ...(href && Element === 'a' && {
      href: disabled || loading ? undefined : href,
      target,
      rel,
    }),
  };

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
      {React.createElement(
        Element,
        elementProps,
        <>
          {children}
          {loading && <LoadingOverlay />}
        </>
      )}
    </>
  );
};

// Card subcomponents for better composition
export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  
  const headerStyles: React.CSSProperties = {
    padding: `${theme.spacing[4]} ${theme.spacing[4]} 0`,
    ...style,
  };

  return (
    <div {...props} className={className} style={headerStyles}>
      {children}
    </div>
  );
};

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  
  const bodyStyles: React.CSSProperties = {
    padding: theme.spacing[4],
    flex: 1,
    ...style,
  };

  return (
    <div {...props} className={className} style={bodyStyles}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  
  const footerStyles: React.CSSProperties = {
    padding: `0 ${theme.spacing[4]} ${theme.spacing[4]}`,
    borderTop: `1px solid ${theme.colors.neutral[200]}`,
    marginTop: theme.spacing[4],
    ...style,
  };

  return (
    <div {...props} className={className} style={footerStyles}>
      {children}
    </div>
  );
};

// Export types
export type { CardVariant, CardPadding };

// Default export
export default Card;
