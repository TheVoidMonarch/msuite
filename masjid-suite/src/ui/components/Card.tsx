import React, { useRef, ElementType, ReactNode } from 'react';
import styles from './Card.module.css';

// TypeScript needs to know about JSX
import {} from 'react/jsx-runtime';

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
  highContrast?: boolean;
}

// Get padding class based on prop
const getPaddingClass = (padding: CardPadding): string => {
  switch (padding) {
    case 'none':
      return styles.paddingNone;
    case 'sm':
      return styles.paddingSm;
    case 'md':
      return styles.paddingMd;
    case 'lg':
      return styles.paddingLg;
    case 'xl':
      return styles.paddingXl;
    default:
      return styles.paddingMd;
  }
};

// Loading overlay component
const LoadingOverlay = () => (
  <div className={styles.loadingOverlay} aria-busy="true" aria-live="polite">
    <div className={styles.loadingSpinner} />
  </div>
);

// Card component with proper polymorphic typing and subcomponents
interface CardComponent extends React.FC<CardProps> {
  Header: typeof CardHeader;
  Body: typeof CardBody;
  Footer: typeof CardFooter;
}

interface CardProps extends Omit<React.HTMLAttributes<HTMLElement>, 'as'> {
  as?: ElementType;
  variant?: CardVariant;
  padding?: CardPadding;
  interactive?: boolean;
  disabled?: boolean;
  loading?: boolean;
  highContrast?: boolean;
  children?: ReactNode;
}

const Card: CardComponent = ({
  variant = 'elevated',
  padding = 'md',
  interactive = false,
  disabled = false,
  loading = false,
  children,
  as: Component = 'div',
  className,
  onKeyDown,
  tabIndex,
  role,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  highContrast = false,
  ...props
}) => {
  const cardRef = useRef<HTMLElement>(null);
  const isInteractive = interactive && !disabled && !loading;

  // Handle keyboard interaction for interactive cards
  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      cardRef.current?.click();
    }
    onKeyDown?.(e as React.KeyboardEvent<HTMLDivElement>);
  };

  // Build the className string
  const cardClassName = [
    styles.card,
    styles[variant],
    getPaddingClass(padding),
    interactive && styles.interactive,
    disabled && styles.disabled,
    loading && styles.loading,
    highContrast && styles.highContrast,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Common props for both interactive and non-interactive elements
  const commonProps = {
    ref: cardRef,
    className: cardClassName,
    'aria-disabled': disabled,
    'aria-busy': loading,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    ...props,
  };

  // Add interactive props if needed
  if (isInteractive || props.onClick) {
    Object.assign(commonProps, {
      role: role || 'button',
      tabIndex: tabIndex ?? 0,
      onKeyDown: handleKeyDown,
    });
  }

  return (
    <Component {...commonProps}>
      {loading && <LoadingOverlay />}
      {children}
    </Component>
  );
};

// Card subcomponents for better composition
interface CardSubComponentProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
}

const CardHeader: React.FC<CardSubComponentProps> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`${styles.cardHeader} ${className}`} {...props}>
    {children}
  </div>
);

const CardBody: React.FC<CardSubComponentProps> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`${styles.cardBody} ${className}`} {...props}>
    {children}
  </div>
);

const CardFooter: React.FC<CardSubComponentProps> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`${styles.cardFooter} ${className}`} {...props}>
    {children}
  </div>
);

// Add subcomponents to Card
const CardWithSubcomponents = Card as CardComponent;
CardWithSubcomponents.Header = CardHeader;
CardWithSubcomponents.Body = CardBody;
CardWithSubcomponents.Footer = CardFooter;

export default CardWithSubcomponents;
