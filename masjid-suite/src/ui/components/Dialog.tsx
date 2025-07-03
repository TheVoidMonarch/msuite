import React from 'react';
import { useTheme } from '../ThemeProvider';

// Dialog size types
export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

// Dialog props interface
export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: DialogSize;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  role?: 'dialog' | 'alertdialog';
  initialFocus?: React.RefObject<HTMLElement>;
  finalFocus?: React.RefObject<HTMLElement>;
}

// Get dialog styles based on size and theme
const getDialogStyles = (size: DialogSize, theme: any): React.CSSProperties => {
  const sizeStyles: Record<DialogSize, React.CSSProperties> = {
    sm: {
      maxWidth: '400px',
      width: '90vw',
    },
    md: {
      maxWidth: '500px',
      width: '90vw',
    },
    lg: {
      maxWidth: '800px',
      width: '90vw',
    },
    xl: {
      maxWidth: '1200px',
      width: '95vw',
    },
    full: {
      width: '100vw',
      height: '100vh',
      maxWidth: 'none',
      maxHeight: 'none',
      borderRadius: 0,
    },
  };

  const baseStyles: React.CSSProperties = {
    position: 'relative',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows['2xl'],
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    ...sizeStyles[size],
  };

  return baseStyles;
};

// Get backdrop styles
const getBackdropStyles = (theme: any): React.CSSProperties => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  backdropFilter: 'blur(4px)',
  zIndex: theme.zIndex.modal,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing[4],
});

// Get container styles
const getContainerStyles = (theme: any): React.CSSProperties => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: theme.zIndex.modal,
  overflow: 'auto',
});

// Close button component
const CloseButton: React.FC<{ onClose: () => void; theme: any; highContrast: boolean }> = ({ 
  onClose, 
  theme, 
  highContrast 
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  const buttonStyles: React.CSSProperties = {
    position: 'absolute',
    top: theme.spacing[4],
    right: theme.spacing[4],
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: theme.spacing[2],
    borderRadius: theme.borderRadius.md,
    color: theme.colors.neutral[500],
    transition: `all ${theme.transitions.normal} ease`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    ...(isHovered && {
      backgroundColor: theme.colors.neutral[100],
      color: theme.colors.neutral[700],
    }),
    ...(isFocused && {
      outline: 'none',
      boxShadow: `0 0 0 ${theme.accessibility.focusRingWidth} ${
        highContrast ? theme.accessibility.highContrastFocusRingColor : theme.accessibility.focusRingColor
      }`,
    }),
    ...(highContrast && {
      color: theme.colors.highContrast.text,
      border: `2px solid ${theme.colors.highContrast.border}`,
      ...(isFocused && {
        outline: `3px solid ${theme.colors.highContrast.focus}`,
        outlineOffset: '2px',
      }),
    }),
  };

  return (
    <button
      type="button"
      onClick={onClose}
      style={buttonStyles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      aria-label="Close dialog"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  );
};

// Dialog header component
export const DialogHeader: React.FC<{
  title?: string;
  description?: string;
  children?: React.ReactNode;
  onClose?: () => void;
  showCloseButton?: boolean;
}> = ({ title, description, children, onClose, showCloseButton = true }) => {
  const { theme, highContrast } = useTheme();
  
  const headerStyles: React.CSSProperties = {
    padding: `${theme.spacing[6]} ${theme.spacing[6]} ${theme.spacing[4]}`,
    borderBottom: `1px solid ${theme.colors.neutral[200]}`,
    position: 'relative',
    ...(highContrast && {
      borderBottom: `2px solid ${theme.colors.highContrast.border}`,
    }),
  };

  const titleStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.neutral[900],
    margin: 0,
    marginBottom: description ? theme.spacing[2] : 0,
    lineHeight: theme.typography.lineHeight.tight,
    ...(highContrast && {
      color: theme.colors.highContrast.text,
    }),
  };

  const descriptionStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.neutral[600],
    margin: 0,
    lineHeight: theme.typography.lineHeight.normal,
    ...(highContrast && {
      color: theme.colors.highContrast.text,
    }),
  };

  return (
    <div style={headerStyles}>
      {title && <h2 id="dialog-title" style={titleStyles}>{title}</h2>}
      {description && <p id="dialog-description" style={descriptionStyles}>{description}</p>}
      {children}
      {showCloseButton && onClose && (
        <CloseButton onClose={onClose} theme={theme} highContrast={highContrast} />
      )}
    </div>
  );
};

// Dialog body component
export const DialogBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  
  const bodyStyles: React.CSSProperties = {
    padding: theme.spacing[6],
    flex: 1,
    overflow: 'auto',
    ...style,
  };

  return (
    <div {...props} style={bodyStyles}>
      {children}
    </div>
  );
};

// Dialog footer component
export const DialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  style,
  ...props
}) => {
  const { theme, highContrast } = useTheme();
  
  const footerStyles: React.CSSProperties = {
    padding: `${theme.spacing[4]} ${theme.spacing[6]} ${theme.spacing[6]}`,
    borderTop: `1px solid ${theme.colors.neutral[200]}`,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing[3],
    flexWrap: 'wrap',
    ...(highContrast && {
      borderTop: `2px solid ${theme.colors.highContrast.border}`,
    }),
    ...style,
  };

  return (
    <div {...props} style={footerStyles}>
      {children}
    </div>
  );
};

// Focus trap hook
const useFocusTrap = (
  containerRef: React.RefObject<HTMLDivElement>,
  isActive: boolean,
  initialFocus?: React.RefObject<HTMLElement>,
  finalFocus?: React.RefObject<HTMLElement>
) => {
  const previousActiveElement = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Store the currently focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Get all focusable elements
    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus initial element or first focusable element
    const elementToFocus = initialFocus?.current || firstElement;
    if (elementToFocus) {
      elementToFocus.focus();
    }

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);

    return () => {
      document.removeEventListener('keydown', handleTabKey);
      
      // Restore focus to the previously focused element
      if (finalFocus?.current) {
        finalFocus.current.focus();
      } else if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive, containerRef, initialFocus, finalFocus]);
};

// Main Dialog component
export const Dialog: React.FC<DialogProps> = ({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  role = 'dialog',
  initialFocus,
  finalFocus,
}) => {
  const { theme, highContrast } = useTheme();
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  // Handle focus trapping
  useFocusTrap(dialogRef, open, initialFocus, finalFocus);

  // Handle body scroll lock
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      setIsVisible(true);
    } else {
      document.body.style.overflow = '';
      setIsVisible(false);
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Handle escape key
  React.useEffect(() => {
    if (!open || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, closeOnEscape, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!open && !isVisible) return null;

  const dialogStyles = getDialogStyles(size, theme);
  const backdropStyles = getBackdropStyles(theme);

  // Apply high contrast styles
  if (highContrast) {
    dialogStyles.backgroundColor = theme.colors.highContrast.background;
    dialogStyles.border = `3px solid ${theme.colors.highContrast.border}`;
    dialogStyles.boxShadow = 'none';
  }

  const hasHeaderContent = title || description;
  const titleId = title ? 'dialog-title' : undefined;
  const descriptionId = description ? 'dialog-description' : undefined;

  return (
    <>
      <div style={backdropStyles} onClick={handleBackdropClick}>
        <div
          ref={dialogRef}
          style={dialogStyles}
          role={role}
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          onClick={(e) => e.stopPropagation()}
        >
          {hasHeaderContent && (
            <DialogHeader
              title={title}
              description={description}
              onClose={onClose}
              showCloseButton={showCloseButton}
            />
          )}
          
          {!hasHeaderContent && showCloseButton && (
            <CloseButton onClose={onClose} theme={theme} highContrast={highContrast} />
          )}
          
          {typeof children === 'string' ? (
            <DialogBody>{children}</DialogBody>
          ) : (
            children
          )}
        </div>
      </div>
    </>
  );
};

// Export types
export type { DialogSize };

// Default export
export default Dialog;
