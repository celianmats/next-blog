/**
 * Utility Functions Library
 * Common helper functions used across the platform
 */

// ================================
// Date & Time Utilities
// ================================

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: Date | string, locale: string = 'en'): string => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  const translations: Record<string, any> = {
    en: {
      now: 'just now',
      seconds: (n: number) => `${n} second${n !== 1 ? 's' : ''} ago`,
      minutes: (n: number) => `${n} minute${n !== 1 ? 's' : ''} ago`,
      hours: (n: number) => `${n} hour${n !== 1 ? 's' : ''} ago`,
      days: (n: number) => `${n} day${n !== 1 ? 's' : ''} ago`,
      weeks: (n: number) => `${n} week${n !== 1 ? 's' : ''} ago`,
      months: (n: number) => `${n} month${n !== 1 ? 's' : ''} ago`,
      years: (n: number) => `${n} year${n !== 1 ? 's' : ''} ago`,
    },
    fr: {
      now: 'à l\'instant',
      seconds: (n: number) => `il y a ${n} seconde${n !== 1 ? 's' : ''}`,
      minutes: (n: number) => `il y a ${n} minute${n !== 1 ? 's' : ''}`,
      hours: (n: number) => `il y a ${n} heure${n !== 1 ? 's' : ''}`,
      days: (n: number) => `il y a ${n} jour${n !== 1 ? 's' : ''}`,
      weeks: (n: number) => `il y a ${n} semaine${n !== 1 ? 's' : ''}`,
      months: (n: number) => `il y a ${n} mois`,
      years: (n: number) => `il y a ${n} an${n !== 1 ? 's' : ''}`,
    },
    ar: {
      now: 'الآن',
      seconds: (n: number) => `منذ ${n} ${n === 1 ? 'ثانية' : 'ثواني'}`,
      minutes: (n: number) => `منذ ${n} ${n === 1 ? 'دقيقة' : 'دقائق'}`,
      hours: (n: number) => `منذ ${n} ${n === 1 ? 'ساعة' : 'ساعات'}`,
      days: (n: number) => `منذ ${n} ${n === 1 ? 'يوم' : 'أيام'}`,
      weeks: (n: number) => `منذ ${n} ${n === 1 ? 'أسبوع' : 'أسابيع'}`,
      months: (n: number) => `منذ ${n} ${n === 1 ? 'شهر' : 'أشهر'}`,
      years: (n: number) => `منذ ${n} ${n === 1 ? 'سنة' : 'سنوات'}`,
    },
  };

  const t = translations[locale] || translations.en;

  if (diffSec < 10) return t.now;
  if (diffSec < 60) return t.seconds(diffSec);
  if (diffMin < 60) return t.minutes(diffMin);
  if (diffHour < 24) return t.hours(diffHour);
  if (diffDay < 7) return t.days(diffDay);
  if (diffWeek < 4) return t.weeks(diffWeek);
  if (diffMonth < 12) return t.months(diffMonth);
  return t.years(diffYear);
};

/**
 * Calculate reading time based on word count
 */
export const calculateReadingTime = (text: string, wordsPerMinute: number = 200): number => {
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

/**
 * Format date with locale
 */
export const formatDate = (
  date: Date | string,
  locale: string = 'en',
  options?: Intl.DateTimeFormatOptions
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
};

// ================================
// String Utilities
// ================================

/**
 * Generate URL-friendly slug from text
 */
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Truncate text to specified length
 */
export const truncate = (text: string, length: number, suffix: string = '...'): string => {
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + suffix;
};

/**
 * Capitalize first letter
 */
export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Convert to title case
 */
export const toTitleCase = (text: string): string => {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
};

/**
 * Strip HTML tags from text
 */
export const stripHtml = (html: string): string => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

/**
 * Extract excerpt from HTML content
 */
export const extractExcerpt = (html: string, length: number = 160): string => {
  const text = stripHtml(html);
  return truncate(text, length);
};

// ================================
// Number Utilities
// ================================

/**
 * Format number with locale
 */
export const formatNumber = (num: number, locale: string = 'en'): string => {
  return new Intl.NumberFormat(locale).format(num);
};

/**
 * Format number to compact notation (e.g., 1.2K, 3.4M)
 */
export const formatCompactNumber = (num: number, locale: string = 'en'): string => {
  return new Intl.NumberFormat(locale, { notation: 'compact' }).format(num);
};

/**
 * Format percentage
 */
export const formatPercentage = (num: number, decimals: number = 1): string => {
  return `${num.toFixed(decimals)}%`;
};

/**
 * Clamp number between min and max
 */
export const clamp = (num: number, min: number, max: number): number => {
  return Math.min(Math.max(num, min), max);
};

// ================================
// Validation Utilities
// ================================

/**
 * Validate email address
 */
export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validate URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  errors: string[];
} => {
  const errors: string[] = [];
  let strength: 'weak' | 'medium' | 'strong' = 'weak';

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain a lowercase letter');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain an uppercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain a number');
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Password must contain a special character');
  }

  if (errors.length === 0) {
    strength = 'strong';
  } else if (errors.length <= 2) {
    strength = 'medium';
  }

  return {
    isValid: errors.length === 0,
    strength,
    errors,
  };
};

// ================================
// Array Utilities
// ================================

/**
 * Group array by key
 */
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((result, item) => {
    const group = String(item[key]);
    return {
      ...result,
      [group]: [...(result[group] || []), item],
    };
  }, {} as Record<string, T[]>);
};

/**
 * Shuffle array
 */
export const shuffle = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Get unique values from array
 */
export const unique = <T>(array: T[]): T[] => {
  return Array.from(new Set(array));
};

/**
 * Chunk array into smaller arrays
 */
export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// ================================
// Object Utilities
// ================================

/**
 * Deep clone object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 */
export const isEmpty = (obj: object): boolean => {
  return Object.keys(obj).length === 0;
};

/**
 * Omit keys from object
 */
export const omit = <T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
};

/**
 * Pick keys from object
 */
export const pick = <T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

// ================================
// Color Utilities
// ================================

/**
 * Generate random color
 */
export const randomColor = (): string => {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
};

/**
 * Convert hex to RGB
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
};

/**
 * Lighten or darken color
 */
export const adjustColor = (hex: string, percent: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const adjust = (value: number) => {
    const adjusted = Math.round(value * (1 + percent / 100));
    return Math.min(255, Math.max(0, adjusted));
  };

  const r = adjust(rgb.r).toString(16).padStart(2, '0');
  const g = adjust(rgb.g).toString(16).padStart(2, '0');
  const b = adjust(rgb.b).toString(16).padStart(2, '0');

  return `#${r}${g}${b}`;
};

// ================================
// Storage Utilities
// ================================

/**
 * Safe localStorage wrapper
 */
export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    if (typeof window === 'undefined') return defaultValue || null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch {
      return defaultValue || null;
    }
  },

  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },

  clear: (): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};

// ================================
// Debounce & Throttle
// ================================

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// ================================
// File Utilities
// ================================

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get file extension
 */
export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

/**
 * Check if file is image
 */
export const isImage = (filename: string): boolean => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const ext = getFileExtension(filename).toLowerCase();
  return imageExtensions.includes(ext);
};

// ================================
// Copy to Clipboard
// ================================

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

// ================================
// Query String Utilities
// ================================

/**
 * Parse query string
 */
export const parseQueryString = (search: string): Record<string, string> => {
  const params = new URLSearchParams(search);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
};

/**
 * Build query string
 */
export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
};

// ================================
// Export all utilities
// ================================
export default {
  // Date & Time
  formatRelativeTime,
  calculateReadingTime,
  formatDate,

  // String
  slugify,
  truncate,
  capitalize,
  toTitleCase,
  stripHtml,
  extractExcerpt,

  // Number
  formatNumber,
  formatCompactNumber,
  formatPercentage,
  clamp,

  // Validation
  isValidEmail,
  isValidUrl,
  validatePassword,

  // Array
  groupBy,
  shuffle,
  unique,
  chunk,

  // Object
  deepClone,
  isEmpty,
  omit,
  pick,

  // Color
  randomColor,
  hexToRgb,
  adjustColor,

  // Storage
  storage,

  // Debounce & Throttle
  debounce,
  throttle,

  // File
  formatFileSize,
  getFileExtension,
  isImage,

  // Clipboard
  copyToClipboard,

  // Query String
  parseQueryString,
  buildQueryString,
};
