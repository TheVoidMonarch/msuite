// Import theme-related types from the design system
import { 
  colors, 
  typography, 
  spacing, 
  borderRadius, 
  shadows, 
  transitions, 
  breakpoints, 
  accessibility, 
  zIndex 
} from '../designSystem';

export interface Theme {
  colors: typeof colors;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
  transitions: typeof transitions;
  breakpoints: typeof breakpoints;
  accessibility: typeof accessibility;
  zIndex: typeof zIndex;
  highContrast: boolean;
}

export interface ThemeContextType {
  theme: Theme;
  toggleHighContrast: () => void;
}
