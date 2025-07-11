import React from 'react';
import { useTheme } from '../ThemeProvider';
import styles from './TextInput.module.css';

// TextInput variant types
export type TextInputVariant = 'outlined' | 'filled' | 'underlined';
export type TextInputSize = 'sm' | 'md' | 'lg';
export type TextInputType = 'text' | 'email' | 'password' | 'tel' | 'url' | 'search' | 'number';

// TextInput props interface
export interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: TextInputVariant;
  size?: TextInputSize;
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  clearable?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  highContrast?: boolean;
  onClear?: () => void;
}

// Get CSS class names based on props
const getInputClassName = (
  variant: TextInputVariant,
  size: TextInputSize,
  hasError: boolean,
  hasSuccess: boolean,
  disabled: boolean,
  loading: boolean,
  highContrast: boolean,
  hasLeftIcon: boolean,
  hasRightIcon: boolean
): string => {
  const classNames = [styles.input];
  
  // Add size class with type assertion
  const sizeClass = `input${size.charAt(0).toUpperCase() + size.slice(1)}` as const;
  classNames.push(styles[sizeClass as keyof typeof styles]);
  
  // Add variant class
  classNames.push(styles[variant]);
  
  // Add state classes
  if (hasError) classNames.push(styles.error);
  if (hasSuccess) classNames.push(styles.success);
  if (disabled) classNames.push(styles.disabled);
  if (loading) classNames.push(styles.loading);
  if (highContrast) classNames.push(styles.highContrast);
  if (hasLeftIcon) classNames.push(styles.withLeftIcon);
  if (hasRightIcon) classNames.push(styles.withRightIcon);
  
  return classNames.join(' ');
};

// Get container class name
const getContainerClassName = (fullWidth: boolean): string => {
  return fullWidth ? `${styles.container} ${styles.containerFullWidth}` : styles.container;
};

// Get icon class name
const getIconClassName = (position: 'left' | 'right'): string => {
  const positionClass = `icon${position.charAt(0).toUpperCase() + position.slice(1)}` as const;
  return `${styles.icon} ${styles[positionClass as keyof typeof styles]}`;
};

// Clear button component
const ClearButton: React.FC<{
  onClear: () => void;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
  loading: boolean;
}> = ({ onClear, onChange, disabled, loading }) => (
  <button
    type="button"
    className={styles.clearButton}
    onClick={(e) => {
      e.preventDefault();
      onClear();
      if (onChange) {
        const target = { value: '' } as React.ChangeEvent<HTMLInputElement>['target'];
        onChange({ target } as React.ChangeEvent<HTMLInputElement>);
      }
    }}
    aria-label="Clear input"
    disabled={disabled || loading}
  >
    ×
  </button>
);

// Loading spinner
const InputSpinner: React.FC<{ size: TextInputSize }> = ({ size }) => {
  const spinnerClass = `${styles.loadingSpinner} ${size === 'sm' ? styles.loadingSpinnerSm : ''} ${size === 'lg' ? styles.loadingSpinnerLg : ''}`;
  
  return (
    <div className={spinnerClass} aria-hidden="true" />
  );
};

// Label component
const InputLabel: React.FC<{ 
  htmlFor: string; 
  required?: boolean; 
  children: React.ReactNode;
  highContrast: boolean;
}> = ({ htmlFor, required, children, highContrast }) => (
  <label
    htmlFor={htmlFor}
    className={`${styles.label} ${highContrast ? styles.highContrastLabel : ''}`}
  >
    {children}
    {required && (
      <span className={styles.requiredIndicator} aria-label="required">
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
  highContrast: boolean;
}> = ({ id, type, children, highContrast }) => {
  const helperTextClass = `${styles.helperText} ${
    type === 'error' 
      ? styles.helperTextError 
      : type === 'success' 
        ? styles.helperTextSuccess 
        : styles.helperTextDescription
  } ${highContrast ? styles.highContrastText : ''}`;

  if (type === 'error') {
    return (
      <div
        id={id}
        className={helperTextClass}
        role="alert"
        aria-live="assertive"
      >
        {children}
      </div>
    );
  }
  
  return (
    <div
      id={id}
      className={helperTextClass}
      role="status"
      aria-live="polite"
    >
      {children}
    </div>
  );
};

// Main TextInput component
export const TextInput: React.FC<TextInputProps> = ({
  id,
  type = 'text',
  value = '',
  onChange,
  onBlur,
  onFocus,
  placeholder = '',
  disabled = false,
  required = false,
  label,
  description,
  error,
  success,
  variant = 'outlined',
  size = 'md',
  fullWidth = false,
  className = '',
  leftIcon,
  rightIcon,
  clearable = true,
  loading = false,
  highContrast = false,
  onClear,
  ...props
}) => {
  // Theme is kept for potential future theming needs
  useTheme();
  const [, setIsFocused] = React.useState(false);
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const hasError = Boolean(error);
  const hasSuccess = Boolean(success) && !hasError;
  const hasValue = Boolean(value);
  const shouldShowClear = clearable && hasValue && !disabled && !loading;

  const inputClassName = getInputClassName(
    variant,
    size,
    hasError,
    hasSuccess,
    disabled,
    loading,
    highContrast,
    Boolean(leftIcon),
    Boolean(rightIcon || shouldShowClear || loading)
  );

  const containerClassName = getContainerClassName(fullWidth);
  const iconClassName = (pos: 'left' | 'right') => getIconClassName(pos);

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(event);
  };



  // Generate ARIA attributes
  const ariaDescribedBy = [
    description ? `${inputId}-description` : undefined,
    hasError ? `${inputId}-error` : undefined,
    hasSuccess ? `${inputId}-success` : undefined
  ].filter(Boolean).join(' ') || undefined;
  
  // ARIA attributes for error/success messages
  const helperTextAriaProps = {
    ...(hasError && { role: 'alert' as const, 'aria-live': 'assertive' as const }),
    ...(hasSuccess && { role: 'status' as const, 'aria-live': 'polite' as const })
  };

  return (
    <div className={containerClassName}>
      {label && (
        <InputLabel
          htmlFor={inputId}
          required={required}
          highContrast={highContrast}
        >
          {label}
        </InputLabel>
      )}
      
      <div className={styles.inputWrapper}>
        {clearable && value && (
          <ClearButton
            onClear={() => onClear?.()}
            disabled={disabled}
            loading={loading}
            onChange={() => {
              if (onChange) {
                const target = { value: '' } as React.ChangeEvent<HTMLInputElement>['target'];
                onChange({ target } as React.ChangeEvent<HTMLInputElement>);
              }
            }}
          />
        )}
        
        {leftIcon && (
          <div className={iconClassName('left')}>
            {leftIcon}
          </div>
        )}
        
        <input
          {...{
            ...props,
            id: inputId,
            type,
            value,
            placeholder,
            disabled: disabled || loading,
            required,
            className: `${inputClassName} ${className || ''}`,
            onFocus: handleFocus,
            onBlur: handleBlur,
            'aria-invalid': hasError ? 'true' : undefined,
            'aria-describedby': ariaDescribedBy,
            'aria-busy': loading ? 'true' : undefined
          }}
        />
        
        {loading && <InputSpinner size={size} />}
        
        {!loading && rightIcon && (
          <div className={iconClassName('right')}>
            {rightIcon}
          </div>
        )}
      </div>
      
      {(description || hasError || hasSuccess) && (
        <div 
        className={styles.helperText}
        {...(Object.keys(helperTextAriaProps).length > 0 ? helperTextAriaProps : {})}
      >
          {description && (
            <HelperText
              id={`${inputId}-description`}
              type="description"
              highContrast={highContrast}
            >
              {description}
            </HelperText>
          )}
          
          {hasError && (
            <HelperText
              id={`${inputId}-error`}
              type="error"
              highContrast={highContrast}
            >
              {error}
            </HelperText>
          )}
          
          {hasSuccess && (
            <HelperText
              id={`${inputId}-success`}
              type="success"
              highContrast={highContrast}
            >
              {success}
            </HelperText>
          )}
        </div>
      )}
    </div>
  );
};

// Default export
export default TextInput;
