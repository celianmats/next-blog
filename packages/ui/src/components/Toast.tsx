/**
 * Toast Notification System
 * Global notification component with queue management
 */

'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import styled, { keyframes } from 'styled-components';

// ================================
// Types
// ================================
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

// ================================
// Animations
// ================================
const slideIn = keyframes`
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(400px);
    opacity: 0;
  }
`;

// ================================
// Styled Components
// ================================
const ToastContainer = styled.div`
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;

  @media (max-width: 640px) {
    top: auto;
    bottom: 24px;
    left: 24px;
    right: 24px;
  }
`;

const ToastItem = styled.div<{ $type: ToastType; $removing: boolean }>`
  background: white;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 320px;
  max-width: 500px;
  pointer-events: all;
  animation: ${props => props.$removing ? slideOut : slideIn} 0.3s ease forwards;
  border-left: 4px solid ${props => {
    switch (props.$type) {
      case 'success': return '#4caf50';
      case 'error': return '#f44336';
      case 'warning': return '#ff9800';
      case 'info': return '#2196f3';
      default: return '#666';
    }
  }};

  @media (max-width: 640px) {
    min-width: 100%;
  }
`;

const IconWrapper = styled.div<{ $type: ToastType }>`
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  color: ${props => {
    switch (props.$type) {
      case 'success': return '#4caf50';
      case 'error': return '#f44336';
      case 'warning': return '#ff9800';
      case 'info': return '#2196f3';
      default: return '#666';
    }
  }};

  svg {
    width: 100%;
    height: 100%;
  }
`;

const ToastMessage = styled.div`
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  line-height: 1.5;
`;

const CloseButton = styled.button`
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  transition: color 0.2s;
  flex-shrink: 0;

  &:hover {
    color: #666;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ProgressBar = styled.div<{ $duration: number; $type: ToastType }>`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: ${props => {
    switch (props.$type) {
      case 'success': return '#4caf50';
      case 'error': return '#f44336';
      case 'warning': return '#ff9800';
      case 'info': return '#2196f3';
      default: return '#666';
    }
  }};
  border-radius: 0 0 0 12px;
  animation: progress ${props => props.$duration}ms linear forwards;

  @keyframes progress {
    from { width: 100%; }
    to { width: 0%; }
  }
`;

// ================================
// Icons
// ================================
const ToastIcons = {
  success: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  error: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  info: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const CloseIcon = (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// ================================
// Context
// ================================
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// ================================
// Provider Component
// ================================
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<(Toast & { removing?: boolean })[]>([]);

  const removeToast = useCallback((id: string) => {
    // Mark as removing for animation
    setToasts(prev => prev.map(toast => 
      toast.id === id ? { ...toast, removing: true } : toast
    ));

    // Actually remove after animation
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 300);
  }, []);

  const showToast = useCallback((
    message: string,
    type: ToastType = 'info',
    duration: number = 5000
  ) => {
    const id = Math.random().toString(36).substring(7);
    const newToast: Toast = { id, type, message, duration };

    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((message: string, duration?: number) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  const error = useCallback((message: string, duration?: number) => {
    showToast(message, 'error', duration);
  }, [showToast]);

  const warning = useCallback((message: string, duration?: number) => {
    showToast(message, 'warning', duration);
  }, [showToast]);

  const info = useCallback((message: string, duration?: number) => {
    showToast(message, 'info', duration);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <ToastContainer>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} $type={toast.type} $removing={!!toast.removing}>
            <IconWrapper $type={toast.type}>
              {ToastIcons[toast.type]}
            </IconWrapper>
            <ToastMessage>{toast.message}</ToastMessage>
            <CloseButton onClick={() => removeToast(toast.id)}>
              {CloseIcon}
            </CloseButton>
            {toast.duration && toast.duration > 0 && !toast.removing && (
              <ProgressBar $duration={toast.duration} $type={toast.type} />
            )}
          </ToastItem>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
}

// ================================
// Hook
// ================================
export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// ================================
// Example Usage
// ================================
/*
// In your app:
import { ToastProvider } from './Toast';

function App() {
  return (
    <ToastProvider>
      <YourApp />
    </ToastProvider>
  );
}

// In components:
import { useToast } from './Toast';

function YourComponent() {
  const toast = useToast();

  const handleClick = () => {
    toast.success('Article saved successfully!');
    toast.error('Failed to save article');
    toast.warning('This action cannot be undone');
    toast.info('New updates available');
  };

  return <button onClick={handleClick}>Show Toast</button>;
}
*/
