import { createGlobalStyle } from 'styled-components';
import { keyframes } from '../styles/theme';

const GlobalStyles = createGlobalStyle`
  /* Import keyframes */
  ${keyframes}

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    font-family: ${({ theme }) => theme.typography.fontFamily.primary};
    line-height: ${({ theme }) => theme.typography.lineHeight.normal};
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.backgroundGradient};
    transition: all ${({ theme }) => theme.transitions.normal};
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Typography */
  h1, h2, h3, h4, h5, h6 {
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    line-height: ${({ theme }) => theme.typography.lineHeight.tight};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    color: ${({ theme }) => theme.colors.text};
  }

  h1 { font-size: ${({ theme }) => theme.typography.fontSize['4xl']}; }
  h2 { font-size: ${({ theme }) => theme.typography.fontSize['3xl']}; }
  h3 { font-size: ${({ theme }) => theme.typography.fontSize['2xl']}; }
  h4 { font-size: ${({ theme }) => theme.typography.fontSize.xl}; }
  h5 { font-size: ${({ theme }) => theme.typography.fontSize.lg}; }
  h6 { font-size: ${({ theme }) => theme.typography.fontSize.base}; }

  p {
    margin-bottom: ${({ theme }) => theme.spacing.md};
    line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  }

  /* Links */
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    transition: all ${({ theme }) => theme.transitions.fast};
    position: relative;

    &:hover {
      color: ${({ theme }) => theme.colors.primaryDark};
      transform: translateY(-1px);
    }

    &:focus {
      outline: 2px solid ${({ theme }) => theme.colors.focus};
      outline-offset: 2px;
      border-radius: ${({ theme }) => theme.borderRadius.sm};
    }
  }

  /* Buttons */
  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    background: none;
    transition: all ${({ theme }) => theme.transitions.fast};
    border-radius: ${({ theme }) => theme.borderRadius.md};

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }

    &:focus {
      outline: 2px solid ${({ theme }) => theme.colors.focus};
      outline-offset: 2px;
    }
  }

  /* Form Elements */
  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
    transition: all ${({ theme }) => theme.transitions.fast};
    border-radius: ${({ theme }) => theme.borderRadius.md};

    &:focus {
      outline: none;
      box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.focus};
    }
  }

  /* Images */
  img {
    max-width: 100%;
    height: auto;
    border-radius: ${({ theme }) => theme.borderRadius.sm};
  }

  /* Scrollbar Styles */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.surface};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    transition: background ${({ theme }) => theme.transitions.fast};

    &:hover {
      background: ${({ theme }) => theme.colors.primary};
    }
  }

  /* Selection Styles */
  ::selection {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
  }

  /* Utility Classes */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 ${({ theme }) => theme.spacing.lg};
    
    @media (max-width: 768px) {
      padding: 0 ${({ theme }) => theme.spacing.md};
    }
  }

  .text-center { text-align: center; }
  .text-left { text-align: left; }
  .text-right { text-align: right; }

  /* Animation Classes */
  .animate-fade-in { animation: fadeIn 0.3s ease-out; }
  .animate-slide-up { animation: slideUp 0.4s ease-out; }
  .animate-slide-down { animation: slideDown 0.4s ease-out; }
  .animate-scale-in { animation: scaleIn 0.2s ease-out; }
  .animate-bounce { animation: bounce 0.6s ease-out; }
  .animate-pulse { animation: pulse 2s infinite; }
  .animate-spin { animation: spin 1s linear infinite; }
  .animate-float { animation: float 3s ease-in-out infinite; }
  .animate-glow { animation: glow 2s infinite; }

  /* Hover Effects */
  .hover-lift {
    transition: transform ${({ theme }) => theme.transitions.fast};
    &:hover { transform: translateY(-2px); }
  }

  .hover-scale {
    transition: transform ${({ theme }) => theme.transitions.fast};
    &:hover { transform: scale(1.05); }
  }

  .hover-glow {
    transition: box-shadow ${({ theme }) => theme.transitions.fast};
    &:hover { box-shadow: 0 0 20px ${({ theme }) => theme.colors.shadowLight}; }
  }

  /* Loading States */
  .loading {
    pointer-events: none;
    opacity: 0.7;
  }

  /* Responsive Utilities */
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    html { font-size: 14px; }
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.xs}) {
    html { font-size: 13px; }
  }

  /* Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  /* Print Styles */
  @media print {
    * {
      background: white !important;
      color: black !important;
      box-shadow: none !important;
    }
    .no-print { display: none !important; }
  }
`;

export default GlobalStyles;


