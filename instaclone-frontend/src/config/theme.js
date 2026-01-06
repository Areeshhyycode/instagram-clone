// Instagram Clone Theme Configuration
// Change values here and they'll reflect everywhere in the app!

export const theme = {
  colors: {
    // Primary Instagram gradient colors
    primary: '#E1306C',        // Instagram pink
    secondary: '#833AB4',      // Instagram purple
    accent: '#F77737',         // Instagram orange

    // Background colors
    background: '#FAFAFA',
    cardBg: '#FFFFFF',

    // Text colors
    textPrimary: '#262626',
    textSecondary: '#8E8E8E',
    textLink: '#00376B',

    // Border colors
    border: '#DBDBDB',
    borderLight: '#EFEFEF',

    // Status colors
    error: '#ED4956',
    success: '#58C322',

    // Button colors
    buttonPrimary: '#0095F6',
    buttonDisabled: '#B2DFFC',
  },

  fonts: {
    primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },

  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
}

// Tailwind-friendly color classes (use these in className)
export const colors = {
  primary: 'text-[#E1306C]',
  bgPrimary: 'bg-[#0095F6]',
  bgPrimaryHover: 'hover:bg-[#1877F2]',
}
