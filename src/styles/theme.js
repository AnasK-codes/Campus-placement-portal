// Enhanced Theme System with Smooth Transitions and Micro-animations
// Supports Light/Dark mode with professional red/white color scheme

export const lightTheme = {
  colors: {
    // Primary Colors
    primary: '#D32F2F',
    primaryLight: '#FF6659',
    primaryDark: '#B71C1C',
    
    // Background Colors
    background: '#FFFFFF',
    surface: '#F8F9FA',
    surfaceVariant: '#F5F5F5',
    
    // Text Colors
    text: '#212121',
    textSecondary: '#757575',
    textTertiary: '#9E9E9E',
    
    // Border & Divider
    border: '#E0E0E0',
    divider: '#EEEEEE',
    
    // Status Colors
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#f44336',
    info: '#2196F3',
    
    // Interactive States
    hover: 'rgba(211, 47, 47, 0.08)',
    active: 'rgba(211, 47, 47, 0.12)',
    focus: 'rgba(211, 47, 47, 0.16)',
    
    // Gradients
    gradient: 'linear-gradient(135deg, #D32F2F 0%, #FF6659 100%)',
    gradientReverse: 'linear-gradient(135deg, #FF6659 0%, #D32F2F 100%)',
    backgroundGradient: 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)',
    
    // Shadows
    shadowLight: 'rgba(211, 47, 47, 0.1)',
    shadowMedium: 'rgba(211, 47, 47, 0.15)',
    shadowDark: 'rgba(211, 47, 47, 0.2)',
  },
  
  shadows: {
    xs: '0 1px 2px rgba(211, 47, 47, 0.05)',
    sm: '0 1px 3px rgba(211, 47, 47, 0.1), 0 1px 2px rgba(211, 47, 47, 0.06)',
    md: '0 4px 6px rgba(211, 47, 47, 0.07), 0 2px 4px rgba(211, 47, 47, 0.06)',
    lg: '0 10px 15px rgba(211, 47, 47, 0.1), 0 4px 6px rgba(211, 47, 47, 0.05)',
    xl: '0 20px 25px rgba(211, 47, 47, 0.1), 0 10px 10px rgba(211, 47, 47, 0.04)',
    xxl: '0 25px 50px rgba(211, 47, 47, 0.15)',
    inner: 'inset 0 2px 4px rgba(211, 47, 47, 0.06)',
  },
  
  borderRadius: {
    xs: '2px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    xxl: '24px',
    full: '50%',
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
    xxxl: '48px',
  },
  
  transitions: {
    fast: '0.15s cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: '0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  animations: {
    fadeIn: 'fadeIn 0.3s ease-out',
    slideUp: 'slideUp 0.4s ease-out',
    slideDown: 'slideDown 0.4s ease-out',
    scaleIn: 'scaleIn 0.2s ease-out',
    bounce: 'bounce 0.6s ease-out',
    pulse: 'pulse 2s infinite',
    spin: 'spin 1s linear infinite',
  },
  
  typography: {
    fontFamily: {
      primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: '"Fira Code", "Monaco", "Consolas", monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  breakpoints: {
    xs: '480px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    xxl: '1536px',
  },
};

export const darkTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    
    // Primary Colors (slightly adjusted for dark mode)
    primary: '#FF5252',
    primaryLight: '#FF8A80',
    primaryDark: '#D32F2F',
    
    // Background Colors
    background: '#121212',
    surface: '#1E1E1E',
    surfaceVariant: '#2D2D2D',
    
    // Text Colors
    text: '#FFFFFF',
    textSecondary: '#B3B3B3',
    textTertiary: '#808080',
    
    // Border & Divider
    border: '#333333',
    divider: '#2D2D2D',
    
    // Interactive States
    hover: 'rgba(255, 82, 82, 0.08)',
    active: 'rgba(255, 82, 82, 0.12)',
    focus: 'rgba(255, 82, 82, 0.16)',
    
    // Gradients
    gradient: 'linear-gradient(135deg, #FF5252 0%, #FF8A80 100%)',
    gradientReverse: 'linear-gradient(135deg, #FF8A80 0%, #FF5252 100%)',
    backgroundGradient: 'linear-gradient(135deg, #121212 0%, #1E1E1E 100%)',
    
    // Shadows (adjusted for dark mode)
    shadowLight: 'rgba(0, 0, 0, 0.2)',
    shadowMedium: 'rgba(0, 0, 0, 0.3)',
    shadowDark: 'rgba(0, 0, 0, 0.4)',
  },
  
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.2)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
    md: '0 4px 6px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.4), 0 4px 6px rgba(0, 0, 0, 0.2)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.4), 0 10px 10px rgba(0, 0, 0, 0.2)',
    xxl: '0 25px 50px rgba(0, 0, 0, 0.5)',
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
  },
};

// Animation Keyframes (to be injected into GlobalStyles)
export const keyframes = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from { 
      opacity: 0; 
      transform: translateY(20px); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }
  
  @keyframes slideDown {
    from { 
      opacity: 0; 
      transform: translateY(-20px); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }
  
  @keyframes scaleIn {
    from { 
      opacity: 0; 
      transform: scale(0.9); 
    }
    to { 
      opacity: 1; 
      transform: scale(1); 
    }
  }
  
  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% {
      transform: translate3d(0, 0, 0);
    }
    40%, 43% {
      transform: translate3d(0, -8px, 0);
    }
    70% {
      transform: translate3d(0, -4px, 0);
    }
    90% {
      transform: translate3d(0, -2px, 0);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  @keyframes shimmer {
    0% {
      background-position: -200px 0;
    }
    100% {
      background-position: calc(200px + 100%) 0;
    }
  }
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }
  
  @keyframes glow {
    0%, 100% {
      box-shadow: 0 0 5px rgba(211, 47, 47, 0.3);
    }
    50% {
      box-shadow: 0 0 20px rgba(211, 47, 47, 0.6);
    }
  }
  
  @keyframes confetti {
    0% {
      transform: translateY(-100vh) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(100vh) rotate(720deg);
      opacity: 0;
    }
  }
  
  @keyframes countUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

// Utility functions for theme transitions
export const getThemeTransition = (property = 'all') => {
  return `${property} 0.3s cubic-bezier(0.4, 0, 0.2, 1)`;
};

export const getHoverStyles = (theme) => ({
  transition: getThemeTransition(),
  '&:hover': {
    transform: 'translateY(-2px) scale(1.02)',
    boxShadow: theme.shadows.lg,
  },
  '&:active': {
    transform: 'translateY(0) scale(0.98)',
  },
});

export const getCardStyles = (theme) => ({
  background: theme.colors.background,
  border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.borderRadius.xl,
  boxShadow: theme.shadows.md,
  transition: getThemeTransition(),
  ...getHoverStyles(theme),
});

export const getButtonStyles = (theme, variant = 'primary') => {
  const baseStyles = {
    padding: `${theme.spacing.md} ${theme.spacing.xl}`,
    borderRadius: theme.borderRadius.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    fontSize: theme.typography.fontSize.base,
    cursor: 'pointer',
    border: 'none',
    transition: getThemeTransition(),
    position: 'relative',
    overflow: 'hidden',
    
    '&:hover': {
      transform: 'translateY(-1px) scale(1.02)',
      boxShadow: theme.shadows.lg,
    },
    
    '&:active': {
      transform: 'translateY(0) scale(0.98)',
    },
    
    '&:focus': {
      outline: 'none',
      boxShadow: `0 0 0 3px ${theme.colors.focus}`,
    },
  };

  switch (variant) {
    case 'primary':
      return {
        ...baseStyles,
        background: theme.colors.gradient,
        color: '#FFFFFF',
        '&:hover': {
          ...baseStyles['&:hover'],
          background: theme.colors.gradientReverse,
        },
      };
    
    case 'secondary':
      return {
        ...baseStyles,
        background: 'transparent',
        color: theme.colors.primary,
        border: `2px solid ${theme.colors.primary}`,
        '&:hover': {
          ...baseStyles['&:hover'],
          background: theme.colors.primary,
          color: '#FFFFFF',
        },
      };
    
    case 'ghost':
      return {
        ...baseStyles,
        background: 'transparent',
        color: theme.colors.text,
        '&:hover': {
          ...baseStyles['&:hover'],
          background: theme.colors.hover,
        },
      };
    
    default:
      return baseStyles;
  }
};

export default { lightTheme, darkTheme, keyframes };
