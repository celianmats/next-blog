/**
 * RTL (Right-to-Left) Utilities Package
 * Provides functions and constants for handling RTL languages
 */

// List of RTL language codes
export const RTL_LOCALES = ['ar', 'he', 'fa', 'ur', 'yi', 'ji', 'iw', 'dv'] as const;

// List of LTR language codes commonly used
export const LTR_LOCALES = ['en', 'fr', 'de', 'es', 'it', 'pt', 'ru', 'ja', 'zh', 'ko'] as const;

export type RTLLocale = typeof RTL_LOCALES[number];
export type LTRLocale = typeof LTR_LOCALES[number];
export type Direction = 'rtl' | 'ltr';
export type TextAlign = 'left' | 'right' | 'center' | 'justify';

/**
 * Check if a locale is RTL
 */
export const isRTL = (locale: string): boolean => {
  return RTL_LOCALES.includes(locale as RTLLocale);
};

/**
 * Get text direction for a locale
 */
export const getDirection = (locale: string): Direction => {
  return isRTL(locale) ? 'rtl' : 'ltr';
};

/**
 * Get text alignment for a locale
 */
export const getTextAlign = (locale: string): 'left' | 'right' => {
  return isRTL(locale) ? 'right' : 'left';
};

/**
 * Get the opposite direction
 */
export const getOppositeDirection = (direction: Direction): Direction => {
  return direction === 'rtl' ? 'ltr' : 'rtl';
};

/**
 * Get the start position based on direction (for flexbox/grid)
 */
export const getStart = (locale: string): 'flex-start' | 'flex-end' => {
  return isRTL(locale) ? 'flex-end' : 'flex-start';
};

/**
 * Get the end position based on direction
 */
export const getEnd = (locale: string): 'flex-start' | 'flex-end' => {
  return isRTL(locale) ? 'flex-start' : 'flex-end';
};

/**
 * Convert margin/padding values to logical properties
 * Example: margin-left becomes margin-inline-start in RTL
 */
export const getLogicalProperty = (property: string, value: string, locale: string): string => {
  const direction = getDirection(locale);
  
  const mapping: Record<string, string> = {
    'margin-left': direction === 'rtl' ? 'margin-right' : 'margin-left',
    'margin-right': direction === 'rtl' ? 'margin-left' : 'margin-right',
    'padding-left': direction === 'rtl' ? 'padding-right' : 'padding-left',
    'padding-right': direction === 'rtl' ? 'padding-left' : 'padding-right',
    'left': direction === 'rtl' ? 'right' : 'left',
    'right': direction === 'rtl' ? 'left' : 'right',
    'border-left': direction === 'rtl' ? 'border-right' : 'border-left',
    'border-right': direction === 'rtl' ? 'border-left' : 'border-right',
  };

  return mapping[property] || property;
};

/**
 * Get CSS transform for flipping icons/images in RTL
 */
export const getFlipTransform = (locale: string): string => {
  return isRTL(locale) ? 'scaleX(-1)' : 'none';
};

/**
 * Should flip directional icons (arrows, chevrons, etc.)
 */
export const shouldFlipIcon = (iconName: string, locale: string): boolean => {
  const directionalIcons = [
    'arrow', 'chevron', 'caret', 'angle', 
    'forward', 'back', 'next', 'prev',
    'right', 'left'
  ];
  
  return isRTL(locale) && directionalIcons.some(icon => 
    iconName.toLowerCase().includes(icon)
  );
};

/**
 * Format number with locale-specific settings
 */
export const formatNumber = (number: number, locale: string): string => {
  return new Intl.NumberFormat(locale).format(number);
};

/**
 * Format date with locale-specific settings
 */
export const formatDate = (
  date: Date | string,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
};

/**
 * Get recommended font families for different locales
 */
export const getFontFamily = (locale: string): string => {
  const fontMappings: Record<string, string> = {
    'ar': "'Cairo', 'Tajawal', 'IBM Plex Arabic', sans-serif",
    'he': "'Heebo', 'Rubik', 'Assistant', sans-serif",
    'fa': "'Vazir', 'Shabnam', sans-serif",
    'ur': "'Noto Nastaliq Urdu', 'Alvi Nastaleeq', serif",
    'en': "'GT America', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    'fr': "'GT America', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  };

  return fontMappings[locale] || fontMappings['en'];
};

/**
 * Helper for styled-components to handle RTL margins/paddings
 */
export const rtlSpacing = {
  marginStart: (value: string) => (props: any) => 
    props.theme?.direction === 'rtl' ? `margin-right: ${value}` : `margin-left: ${value}`,
  
  marginEnd: (value: string) => (props: any) => 
    props.theme?.direction === 'rtl' ? `margin-left: ${value}` : `margin-right: ${value}`,
  
  paddingStart: (value: string) => (props: any) => 
    props.theme?.direction === 'rtl' ? `padding-right: ${value}` : `padding-left: ${value}`,
  
  paddingEnd: (value: string) => (props: any) => 
    props.theme?.direction === 'rtl' ? `padding-left: ${value}` : `padding-right: ${value}`,
};

/**
 * CSS helper for logical properties
 */
export const rtlCSS = {
  textAlign: (props: any) => props.theme?.direction === 'rtl' ? 'right' : 'left',
  float: (side: 'start' | 'end') => (props: any) => {
    if (side === 'start') {
      return props.theme?.direction === 'rtl' ? 'right' : 'left';
    }
    return props.theme?.direction === 'rtl' ? 'left' : 'right';
  },
};

/**
 * Get locale metadata
 */
export const getLocaleMetadata = (locale: string) => {
  const metadata: Record<string, {
    name: string;
    nativeName: string;
    direction: Direction;
    code: string;
  }> = {
    'en': {
      name: 'English',
      nativeName: 'English',
      direction: 'ltr',
      code: 'en',
    },
    'fr': {
      name: 'French',
      nativeName: 'Français',
      direction: 'ltr',
      code: 'fr',
    },
    'ar': {
      name: 'Arabic',
      nativeName: 'العربية',
      direction: 'rtl',
      code: 'ar',
    },
    'he': {
      name: 'Hebrew',
      nativeName: 'עברית',
      direction: 'rtl',
      code: 'he',
    },
  };

  return metadata[locale] || metadata['en'];
};

/**
 * Hook for React components to get RTL utilities
 */
export const useRTL = (locale: string) => {
  return {
    isRTL: isRTL(locale),
    direction: getDirection(locale),
    textAlign: getTextAlign(locale),
    start: getStart(locale),
    end: getEnd(locale),
    fontFamily: getFontFamily(locale),
    flipTransform: getFlipTransform(locale),
    shouldFlipIcon: (iconName: string) => shouldFlipIcon(iconName, locale),
    formatNumber: (num: number) => formatNumber(num, locale),
    formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => 
      formatDate(date, locale, options),
  };
};

export default {
  isRTL,
  getDirection,
  getTextAlign,
  getOppositeDirection,
  getStart,
  getEnd,
  getLogicalProperty,
  getFlipTransform,
  shouldFlipIcon,
  formatNumber,
  formatDate,
  getFontFamily,
  getLocaleMetadata,
  useRTL,
  rtlSpacing,
  rtlCSS,
};
