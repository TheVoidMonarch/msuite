import * as React from 'react';
import { useTheme } from '../ThemeProvider';
import styles from './Dialog.module.css';

type ReactNode = React.ReactNode;

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: DialogSize;
  role?: 'dialog' | 'alertdialog';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  children?: ReactNode;
  className?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  children?: ReactNode;
  onClose?: () => void;
  showCloseButton?: boolean;
  id?: string;
  className?: string;
}

interface CloseButtonProps {
  onClose: () => void;
  highContrast?: boolean;
  className?: string;
}

const CloseButton: React.FC<CloseButtonProps> = ({ 
  onClose, 
  highContrast = false,
  className = ''
}) => (
  <button
    type="button"
    onClick={onClose}
    className={`${styles.dialogCloseButton} ${highContrast ? styles.highContrast : ''} ${className}`}
    aria-label="Close dialog"
  >
    <span className={styles.srOnly}>Close</span>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  </button>
);

export const DialogHeader: React.FC<DialogHeaderProps> = ({
  title,
  description,
  children,
  onClose,
  showCloseButton = true,
  id,
  className = ''
}) => {
  const context = useTheme();
  const highContrast = context?.highContrast || false;

  return (
    <div className={`${styles.dialogHeader} ${className}`} id={id}>
      {title && (
        <h2 className={styles.dialogTitle} id={`${id}-title`}>
          {title}
        </h2>
      )}
      {description && (
        <p className={styles.dialogDescription} id={`${id}-description`}>
          {description}
        </p>
      )}
      {children}
      {showCloseButton && onClose && (
        <CloseButton onClose={onClose} highContrast={highContrast} />
      )}
    </div>
  );
};

export interface DialogBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  className?: string;
}

export const DialogBody: React.FC<DialogBodyProps> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`${styles.dialogBody} ${className}`} {...props}>
    {children}
  </div>
);

export interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  className?: string;
}

export const DialogFooter: React.FC<DialogFooterProps> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`${styles.dialogFooter} ${className}`} {...props}>
    {children}
  </div>
);

export const Dialog = React.forwardRef<HTMLDivElement, DialogProps>((props, ref) => {
  const {
    isOpen = false,
    onClose = () => {},
    title,
    description,
    size = 'md',
    role = 'dialog',
    closeOnOverlayClick = true,
    closeOnEscape = true,
    children,
    className = '',
    ...rest
  } = props;

  // Theme and state management
  const theme = useTheme();
  const highContrast = theme?.highContrast || false;
  const [isVisible, setIsVisible] = React.useState(isOpen);
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const lastActiveElement = React.useRef<HTMLElement | null>(null);
  
  // Generate IDs for accessibility
  const titleId = React.useMemo(
    () => title ? `${title.replace(/\s+/g, '-').toLowerCase()}-title` : undefined,
    [title]
  );
  
  const descriptionId = React.useMemo(
    () => description ? `${title?.replace(/\s+/g, '-').toLowerCase()}-description` : undefined,
    [description, title]
  );
  
  const validRole = role === 'alertdialog' ? 'alertdialog' : 'dialog';
  
  // Ensure proper ARIA attributes for accessibility
  const dialogProps = {
    ...rest,
    role: validRole,
    'aria-labelledby': titleId,
    'aria-describedby': descriptionId,
    tabIndex: -1
  } as const;
  
  // Handle escape key press
  const handleKeyDown = React.useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && closeOnEscape && isOpen) {
      onClose();
    }
  }, [closeOnEscape, isOpen, onClose]);

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  React.useEffect(() => {
    if (isOpen) {
      lastActiveElement.current = document.activeElement as HTMLElement;
      setIsVisible(true);
      
      // Focus the first focusable element in the dialog
      const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements?.length) {
        focusableElements[0]?.focus();
      }
    } else {
      // Return focus to the last active element when dialog closes
      lastActiveElement.current?.focus();
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);



  // Handle focus management
  React.useEffect(() => {
    if (isOpen) {
      lastActiveElement.current = document.activeElement as HTMLElement;
      setIsVisible(true);
      
      // Focus the first focusable element in the dialog
      const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements?.length) {
        focusableElements[0]?.focus();
      }
    } else {
      // Return focus to the last active element when dialog closes
      lastActiveElement.current?.focus();
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle body scroll lock and animations
  React.useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Restore scroll position and styles
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      };
    }
  }, [isOpen]);

  // Handle overlay click
  const handleOverlayClick = React.useCallback((e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === overlayRef.current) {
      onClose();
    }
  }, [closeOnOverlayClick, onClose]);

  // Generate class names
  const dialogClassNames = React.useMemo(() => [
    styles.dialog,
    styles[`dialog--${size}`],
    isVisible ? styles.dialogVisible : '',
    highContrast ? styles.highContrast : '',
    className
  ].filter(Boolean).join(' '), [size, isVisible, highContrast, className]);
  
  const overlayClassNames = React.useMemo(() => [
    styles.dialogOverlay,
    isVisible ? styles.dialogOverlayVisible : ''
  ].filter(Boolean).join(' '), [isVisible]);

  if (!isOpen && !isVisible) return null;

  return (
    <div
      ref={overlayRef}
      className={overlayClassNames}
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        ref={(node) => {
          if (ref) {
            if (typeof ref === 'function') {
              ref(node);
            } else {
              (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
            }
          }
          if (node) {
            dialogRef.current = node;
          }
        }}
        className={dialogClassNames}
        {...dialogProps}
      >
        {children || (
          <>
            <DialogHeader
              title={title}
              description={description}
              onClose={onClose}
              id={titleId}
            />
            <DialogBody>
              {children}
            </DialogBody>
          </>
        )}
      </div>
    </div>
  );
});

Dialog.displayName = 'Dialog';

export default Dialog;
