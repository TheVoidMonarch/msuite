import React from 'react';
import { useTheme } from '../ThemeProvider';

// TextInput variant types
export type TextInputVariant = 'outlined' | 'filled' | 'underlined';
export type TextInputSize = 'sm' | 'md' | 'lg';
export type TextInputType = 'text' | 'email' | 'password' | 'tel' | 'url' | 'search' | 'number';

// TextInput props interface
export interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  variant?: TextInputVariant;
  size?: TextInputSize;
  type?: TextInputType;
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClear?: () => void;
  clearable?: boolean;
  fullWidth?: boolean;
}

// Get input styles based on variant and theme
const getInputStyles = (
  variant: TextInputVariant,
  size: TextInputSize,
  hasError: boolean,
  hasSuccess: boolean,
  disabled: boolean,
  loading: boolean,
  isFocused: boolean,
  highContrast: boolean,
  theme: any
): React.CSSProperties => {
  const baseStyles: React.CSSProperties = {
    fontFamily: theme.typography.fontFamily.sans.join(', '),
    fontWeight: theme.typography.fontWeight.normal,
    borderRadius: theme.borderRadius.md,
    transition: `all ${theme.transitions.normal} ease`,
    width: '100%',
    outline: 'none',
    ...(disabled && {
      opacity: 0.6,
      cursor: 'not-allowed',
      backgroundColor: theme.colors.neutral[50],
    }),
    ...(loading && {
      cursor: 'wait',
    }),
  };

  // Size styles
  const sizeStyles: Record<TextInputSize, React.CSSProperties> = {
    sm: {
      fontSize: theme.typography.fontSize.sm,
      padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
      minHeight: '40px',
    },
    md: {
      fontSize: theme.typography.fontSize.base,
      padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
      minHeight: '48px',
    },
    lg: {
      fontSize: theme.typography.fontSize.lg,
      padding: `${theme.spacing[4]} ${theme.spacing[5]}`,
      minHeight: '56px',
    },
  };

  // Variant styles
  const variantStyles: Record<TextInputVariant, React.CSSProperties> = {
    outlined: {
      backgroundColor: theme.colors.white,
      border: `1px solid ${theme.colors.neutral[300]}`,
      ...(isFocused && {
        borderColor: theme.colors.primary[500],
        boxShadow: `0 0 0 ${theme.accessibility.focusRingWidth} ${theme.colors.primary[200]}`,
      }),
      ...(hasError && {
        borderColor: theme.colors.error[500],
        ...(isFocused && {
          boxShadow: `0 0 0 ${theme.accessibility.focusRingWidth} ${theme.colors.error[200]}`,
        }),
      }),
      ...(hasSuccess && {
        borderColor: theme.colors.success[500],
        ...(isFocused && {
          boxShadow: `0 0 0 ${theme.accessibility.focusRingWidth} ${theme.colors.success[200]}`,
        }),
      }),
      ...(highContrast && {
        border: `2px solid ${theme.colors.highContrast.border}`,
        backgroundColor: theme.colors.highContrast.background,
        ...(isFocused && {
          outline: `3px solid ${theme.colors.highContrast.focus}`,
          outlineOffset: '2px',
        }),
      }),
    },
    filled: {
      backgroundColor: theme.colors.neutral[100],
      border: '1px solid transparent',
      borderBottom: `2px solid ${theme.colors.neutral[300]}`,
      borderRadius: `${theme.borderRadius.md} ${theme.borderRadius.md} 0 0`,
      ...(isFocused && {
        backgroundColor: theme.colors.neutral[50],
        borderBottomColor: theme.colors.primary[500],
        boxShadow: `0 2px 0 0 ${theme.colors.primary[500]}`,
      }),
      ...(hasError && {
        borderBottomColor: theme.colors.error[500],
        ...(isFocused && {
          boxShadow: `0 2px 0 0 ${theme.colors.error[500]}`,
        }),
      }),
      ...(hasSuccess && {
        borderBottomColor: theme.colors.success[500],
        ...(isFocused && {
          boxShadow: `0 2px 0 0 ${theme.colors.success[500]}`,
        }),
      }),
      ...(highContrast && {
        backgroundColor: theme.colors.highContrast.background,
        border: `2px solid ${theme.colors.highContrast.border}`,
        borderRadius: theme.borderRadius.md,
      }),
    },
    underlined: {
      backgroundColor: 'transparent',
      border: 'none',
      borderBottom: `1px solid ${theme.colors.neutral[300]}`,
      borderRadius: 0,
      ...(isFocused && {
        borderBottomColor: theme.colors.primary[500],
        borderBottomWidth: '2px',
      }),
      ...(hasError && {
        borderBottomColor: theme.colors.error[500],
        ...(isFocused && {
          borderBottomWidth: '2px',
        }),
      }),
      ...(hasSuccess && {
        borderBottomColor: theme.colors.success[500],
        ...(isFocused && {
          borderBottomWidth: '2px',
        }),
      }),
      ...(highContrast && {
        borderBottom: `2px solid ${theme.colors.highContrast.border}`,
        ...(isFocused && {
          outline: `3px solid ${theme.colors.highContrast.focus}`,
          outlineOffset: '2px',
        }),
      }),
    },
  };

  return {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
  };
};

// Get container styles
const getContainerStyles = (fullWidth: boolean): React.CSSProperties => ({
  position: 'relative',
  display: 'inline-block',
  ...(fullWidth && { width: '100%' }),
});

// Get icon styles
const getIconStyles = (position: 'left' | 'right', size: TextInputSize, theme: any): React.CSSProperties => {
  const baseIconStyles: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    color: theme.colors.neutral[400],
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  };

  const sizeAdjustments: Record<TextInputSize, { padding: string; iconSize: string }> = {
    sm: { padding: theme.spacing[3], iconSize: '16px' },
    md: { padding: theme.spacing[4], iconSize: '20px' },
    lg: { padding: theme.spacing[5], iconSize: '24px' },
  };

  return {
    ...baseIconStyles,
    [position]: sizeAdjustments[size].padding,
    width: sizeAdjustments[size].iconSize,
    height: sizeAdjustments[size].iconSize,
  };
};

// Clear button component
const ClearButton: React.FC<{ onClear: () => void; size: TextInputSize; theme: any }> = ({ onClear, size, theme }) => {
  const sizeMap = { sm: 16, md: 20, lg: 24 };
  const iconSize = sizeMap[size];

  return (
    <button
      type="button"
      onClick={onClear}
      style={{
        position: 'absolute',
        right: theme.spacing[size === 'sm' ? 2 : size === 'md' ? 3 : 4],
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: theme.colors.neutral[400],
        padding: theme.spacing[1],
        borderRadius: theme.borderRadius.sm,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: `color ${theme.transitions.fast} ease`,
        zIndex: 2,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = theme.colors.neutral[600];
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = theme.colors.neutral[400];
      }}
      aria-label="Clear input"
    >
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  );
};

// Loading spinner
const InputSpinner: React.FC<{ size: TextInputSize; theme: any }> = ({ size, theme }) => {
  const sizeMap = { sm: 14, md: 16, lg: 18 };
  const spinnerSize = sizeMap[size];

  return (
    <div
      style={{
        position: 'absolute',
        right: theme.spacing[size === 'sm' ? 3 : size === 'md' ? 4 : 5],
        top: '50%',
        transform: 'translateY(-50%)',
        width: spinnerSize,
        height: spinnerSize,
        border: '2px solid transparent',
        borderTop: `2px solid ${theme.colors.primary[500]}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        zIndex: 2,
      }}
      aria-hidden="true"
    />
  );
};

// Label component
const InputLabel: React.FC<{ 
  htmlFor: string; 
  required?: boolean; 
  children: React.ReactNode;
  theme: any;
  highContrast: boolean;
}> = ({ htmlFor, required, children, theme, highContrast }) => (
  <label
    htmlFor={htmlFor}
    style={{
      display: 'block',
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      color: highContrast ? theme.colors.highContrast.text : theme.colors.neutral[700],
      marginBottom: theme.spacing[1],
    }}
  >
    {children}
    {required && (
      <span
        style={{ color: theme.colors.error[500], marginLeft: theme.spacing[1] }}
        aria-label="required"
      >
        *
      </span>
    )}
  </label>
);

// Helper text component
const HelperText: React.FC<{ 
  id: string; 
  type: 'description' | 'error' | 'success'; 
  children: React.ReactNode;
  theme: any;
  highContrast: boolean;
}> = ({ id, type, children, theme, highContrast }) => {
  const colorMap = {
    description: highContrast ? theme.colors.highContrast.text : theme.colors.neutral[600],
    error: theme.colors.error[600],
    success: theme.colors.success[600],
  };

  return (
    <div
      id={id}
      style={{
        fontSize: theme.typography.fontSize.sm,
        color: colorMap[type],
        marginTop: theme.spacing[1],
        lineHeight: theme.typography.lineHeight.normal,
      }}
      role={type === 'error' ? 'alert' : undefined}
      aria-live={type === 'error' ? 'polite' : undefined}
    >
      {children}
    </div>
  );
};

// Main TextInput component
export const TextInput: React.FC<TextInputProps> = ({
  variant = 'outlined',
  size = 'md',
  type = 'text',
  label,
  description,
  error,
  success,
  required = false,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  onClear,
  clearable = false,
  fullWidth = false,
  id,
  value,
  placeholder,
  className,
  style,
  onFocus,
  onBlur,
  ...props
}) => {
  const { theme, highContrast } = useTheme();
  const [isFocused, setIsFocused] = React.useState(false);
  const [inputId] = React.useState(id || `input-${Math.random().toString(36).substr(2, 9)}`);
  
  const hasError = Boolean(error);
  const hasSuccess = Boolean(success) && !hasError;
  const hasValue = Boolean(value);
  const shouldShowClear = clearable && hasValue && !disabled && !loading;

  const inputStyles = getInputStyles(
    variant,
    size,
    hasError,
    hasSuccess,
    disabled,
    loading,
    isFocused,
    highContrast,
    theme
  );

  const containerStyles = getContainerStyles(fullWidth);

  // Calculate padding adjustments for icons
  const paddingAdjustments: React.CSSProperties = {};
  if (leftIcon) {
    const iconWidth = size === 'sm' ? 40 : size === 'md' ? 48 : 56;
    paddingAdjustments.paddingLeft = `${iconWidth}px`;
  }
  if (rightIcon || shouldShowClear || loading) {
    const iconWidth = size === 'sm' ? 40 : size === 'md' ? 48 : 56;
    paddingAdjustments.paddingRight = `${iconWidth}px`;
  }

  const combinedInputStyles: React.CSSProperties = {
    ...inputStyles,
    ...paddingAdjustments,
    ...style,
  };

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(event);
  };

  const handleClear = () => {
    onClear?.();
  };

  // Generate ARIA attributes
  const ariaDescribedBy = [
    description && `${inputId}-description`,
    error && `${inputId}-error`,
    success && `${inputId}-success`,
  ].filter(Boolean).join(' ');

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
      <div style={containerStyles}>
        {label && (
          <InputLabel
            htmlFor={inputId}
            required={required}
            theme={theme}
            highContrast={highContrast}
          >
            {label}
          </InputLabel>
        )}
        
        <div style={{ position: 'relative' }}>
          {leftIcon && (
            <div style={getIconStyles('left', size, theme)}>
              {leftIcon}
            </div>
          )}
          
          <input
            {...props}
            id={inputId}
            type={type}
            value={value}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={className}
            style={combinedInputStyles}
            onFocus={handleFocus}
            onBlur={handleBlur}
            aria-invalid={hasError}
            aria-describedby={ariaDescribedBy || undefined}
            aria-busy={loading}
          />
          
          {loading && <InputSpinner size={size} theme={theme} />}
          {!loading && shouldShowClear && (
            <ClearButton onClear={handleClear} size={size} theme={theme} />
          )}
          {!loading && !shouldShowClear && rightIcon && (
            <div style={getIconStyles('right', size, theme)}>
              {rightIcon}
            </div>
          )}
        </div>
        
        {description && (
          <HelperText
            id={`${inputId}-description`}
            type="description"
            theme={theme}
            highContrast={highContrast}
          >
            {description}
          </HelperText>
        )}
        
        {error && (
          <HelperText
            id={`${inputId}-error`}
            type="error"
            theme={theme}
            highContrast={highContrast}
          >
            {error}
          </HelperText>
        )}
        
        {success && !error && (
          <HelperText
            id={`${inputId}-success`}
            type="success"
            theme={theme}
            highContrast={highContrast}
          >
            {success}
          </HelperText>
        )}
      </div>
    </>
  );
};

// Export types
export type { TextInputVariant, TextInputSize, TextInputType };

// Default export
export default TextInput;
