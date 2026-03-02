/**
 * Performance Monitoring & Analytics
 * Track page performance, user interactions, and custom events
 */

'use client';

import { useEffect, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// ================================
// Types
// ================================
interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  nonInteraction?: boolean;
}

interface PageViewEvent {
  page: string;
  title: string;
  referrer?: string;
}

interface PerformanceMetrics {
  dns: number;
  tcp: number;
  ttfb: number;
  download: number;
  domInteractive: number;
  domComplete: number;
  loadComplete: number;
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
}

// ================================
// Analytics Service
// ================================
class AnalyticsService {
  private initialized: boolean = false;
  private queue: Array<() => void> = [];

  /**
   * Initialize analytics (Google Analytics, Plausible, etc.)
   */
  initialize() {
    if (this.initialized) return;

    // Initialize Google Analytics
    if (process.env.NEXT_PUBLIC_GA_ID) {
      this.initializeGA();
    }

    // Initialize Plausible
    if (process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN) {
      this.initializePlausible();
    }

    this.initialized = true;

    // Process queued events
    this.queue.forEach(fn => fn());
    this.queue = [];
  }

  /**
   * Initialize Google Analytics
   */
  private initializeGA() {
    const gaId = process.env.NEXT_PUBLIC_GA_ID;
    if (!gaId) return;

    // Load GA script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    // Initialize dataLayer
    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(...args: any[]) {
      (window as any).dataLayer.push(args);
    }
    (window as any).gtag = gtag;

    gtag('js', new Date());
    gtag('config', gaId, {
      page_path: window.location.pathname,
      send_page_view: false, // We'll send manually
    });
  }

  /**
   * Initialize Plausible Analytics
   */
  private initializePlausible() {
    const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
    if (!domain) return;

    const script = document.createElement('script');
    script.defer = true;
    script.dataset.domain = domain;
    script.src = 'https://plausible.io/js/script.js';
    document.head.appendChild(script);
  }

  /**
   * Track page view
   */
  pageView(event: PageViewEvent) {
    if (!this.initialized) {
      this.queue.push(() => this.pageView(event));
      return;
    }

    // Google Analytics
    if ((window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_title: event.title,
        page_location: window.location.href,
        page_path: event.page,
      });
    }

    // Plausible (automatically tracks page views)
    
    console.log('📊 Page View:', event);
  }

  /**
   * Track custom event
   */
  event(event: AnalyticsEvent) {
    if (!this.initialized) {
      this.queue.push(() => this.event(event));
      return;
    }

    // Google Analytics
    if ((window as any).gtag) {
      (window as any).gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        non_interaction: event.nonInteraction,
      });
    }

    // Plausible
    if ((window as any).plausible) {
      (window as any).plausible(event.action, {
        props: {
          category: event.category,
          label: event.label,
          value: event.value,
        },
      });
    }

    console.log('📊 Event:', event);
  }

  /**
   * Track user timing
   */
  timing(category: string, variable: string, value: number) {
    if ((window as any).gtag) {
      (window as any).gtag('event', 'timing_complete', {
        name: variable,
        value: value,
        event_category: category,
      });
    }

    console.log('⏱️ Timing:', { category, variable, value });
  }

  /**
   * Track exception
   */
  exception(description: string, fatal: boolean = false) {
    if ((window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description,
        fatal,
      });
    }

    console.error('❌ Exception:', description);
  }
}

export const analytics = new AnalyticsService();

// ================================
// Performance Monitoring
// ================================
export class PerformanceMonitor {
  /**
   * Get page load metrics
   */
  static getLoadMetrics(): PerformanceMetrics | null {
    if (typeof window === 'undefined') return null;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigation) return null;

    return {
      dns: Math.round(navigation.domainLookupEnd - navigation.domainLookupStart),
      tcp: Math.round(navigation.connectEnd - navigation.connectStart),
      ttfb: Math.round(navigation.responseStart - navigation.requestStart),
      download: Math.round(navigation.responseEnd - navigation.responseStart),
      domInteractive: Math.round(navigation.domInteractive - navigation.fetchStart),
      domComplete: Math.round(navigation.domComplete - navigation.fetchStart),
      loadComplete: Math.round(navigation.loadEventEnd - navigation.fetchStart),
    };
  }

  /**
   * Get Web Vitals
   */
  static getWebVitals(callback: (metrics: Partial<PerformanceMetrics>) => void) {
    if (typeof window === 'undefined') return;

    const metrics: Partial<PerformanceMetrics> = {};

    // First Contentful Paint (FCP)
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    if (fcp) {
      metrics.fcp = Math.round(fcp.startTime);
    }

    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          metrics.lcp = Math.round(lastEntry.renderTime || lastEntry.loadTime);
          callback(metrics);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            metrics.fid = Math.round(entry.processingStart - entry.startTime);
            callback(metrics);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              metrics.cls = Math.round(clsValue * 1000) / 1000;
              callback(metrics);
            }
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('Performance Observer not supported:', e);
      }
    }

    return () => {
      // Cleanup observers if needed
    };
  }

  /**
   * Report Web Vitals to analytics
   */
  static reportWebVitals() {
    if (typeof window === 'undefined') return;

    this.getWebVitals((metrics) => {
      Object.entries(metrics).forEach(([key, value]) => {
        if (value !== undefined) {
          analytics.timing('Web Vitals', key.toUpperCase(), value);
        }
      });
    });
  }

  /**
   * Monitor long tasks
   */
  static monitorLongTasks() {
    if (typeof window === 'undefined') return;

    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            analytics.event({
              category: 'Performance',
              action: 'Long Task',
              label: entry.name,
              value: Math.round(entry.duration),
            });
          });
        });
        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        console.warn('Long task monitoring not supported:', e);
      }
    }
  }
}

// ================================
// React Hooks
// ================================

/**
 * Track page views automatically
 */
export function usePageTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    analytics.initialize();
  }, []);

  useEffect(() => {
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    
    analytics.pageView({
      page: url,
      title: document.title,
      referrer: document.referrer,
    });
  }, [pathname, searchParams]);
}

/**
 * Track custom events
 */
export function useAnalytics() {
  return {
    trackEvent: useCallback((event: AnalyticsEvent) => {
      analytics.event(event);
    }, []),

    trackClick: useCallback((label: string, category: string = 'Button') => {
      analytics.event({
        action: 'click',
        category,
        label,
      });
    }, []),

    trackSearch: useCallback((query: string) => {
      analytics.event({
        action: 'search',
        category: 'Search',
        label: query,
      });
    }, []),

    trackShare: useCallback((platform: string, articleId: string) => {
      analytics.event({
        action: 'share',
        category: 'Social',
        label: platform,
        value: articleId as any,
      });
    }, []),

    trackArticleRead: useCallback((articleId: string, readingTime: number) => {
      analytics.event({
        action: 'article_read',
        category: 'Engagement',
        label: articleId,
        value: readingTime,
      });
    }, []),
  };
}

/**
 * Track performance metrics
 */
export function usePerformanceTracking() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Wait for page to fully load
    if (document.readyState === 'complete') {
      reportMetrics();
    } else {
      window.addEventListener('load', reportMetrics);
      return () => window.removeEventListener('load', reportMetrics);
    }

    function reportMetrics() {
      // Report basic load metrics
      const loadMetrics = PerformanceMonitor.getLoadMetrics();
      if (loadMetrics) {
        Object.entries(loadMetrics).forEach(([key, value]) => {
          analytics.timing('Page Load', key, value);
        });
      }

      // Report Web Vitals
      setTimeout(() => {
        PerformanceMonitor.reportWebVitals();
      }, 0);
    }
  }, []);
}

/**
 * Track scroll depth
 */
export function useScrollTracking() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const milestones = [25, 50, 75, 100];
    const reached = new Set<number>();

    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );

      milestones.forEach(milestone => {
        if (scrollPercent >= milestone && !reached.has(milestone)) {
          reached.add(milestone);
          analytics.event({
            action: 'scroll_depth',
            category: 'Engagement',
            label: `${milestone}%`,
            value: milestone,
            nonInteraction: true,
          });
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
}

/**
 * Track reading time
 */
export function useReadingTimeTracking(articleId: string) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const startTime = Date.now();
    let isVisible = true;

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      const readingTime = Math.round((Date.now() - startTime) / 1000);
      
      if (readingTime > 5) { // Only track if read for more than 5 seconds
        analytics.event({
          action: 'reading_time',
          category: 'Engagement',
          label: articleId,
          value: readingTime,
          nonInteraction: true,
        });
      }
    };
  }, [articleId]);
}

// ================================
// Error Tracking
// ================================
export function setupErrorTracking() {
  if (typeof window === 'undefined') return;

  window.addEventListener('error', (event) => {
    analytics.exception(
      `${event.message} at ${event.filename}:${event.lineno}:${event.colno}`,
      true
    );
  });

  window.addEventListener('unhandledrejection', (event) => {
    analytics.exception(
      `Unhandled Promise Rejection: ${event.reason}`,
      true
    );
  });
}

// ================================
// Export everything
// ================================
export default {
  analytics,
  PerformanceMonitor,
  usePageTracking,
  useAnalytics,
  usePerformanceTracking,
  useScrollTracking,
  useReadingTimeTracking,
  setupErrorTracking,
};
