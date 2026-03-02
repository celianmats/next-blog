/**
 * Error Boundary Component
 * Catches JavaScript errors and displays fallback UI
 */

'use client';

import React, { Component, ReactNode } from 'react';
import styled from 'styled-components';

// ================================
// Types
// ================================
interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

// ================================
// Styled Components
// ================================
const ErrorContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: #f8f9fa;
`;

const ErrorCard = styled.div`
  max-width: 600px;
  width: 100%;
  background: white;
  border-radius: 16px;
  padding: 48px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;

  @media (max-width: 640px) {
    padding: 32px 24px;
  }
`;

const ErrorIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  background: linear-gradient(135deg, #f44336 0%, #e91e63 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 40px;
    height: 40px;
    color: white;
  }
`;

const ErrorTitle = styled.h1`
  font-size: 28px;
  font-weight: 800;
  margin: 0 0 12px 0;
  color: #1a1a1a;

  @media (max-width: 640px) {
    font-size: 24px;
  }
`;

const ErrorMessage = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: #666;
  margin: 0 0 32px 0;
`;

const ErrorDetails = styled.details`
  text-align: left;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  font-size: 13px;
  color: #666;

  summary {
    cursor: pointer;
    font-weight: 600;
    margin-bottom: 12px;
    user-select: none;

    &:hover {
      color: #1a1a1a;
    }
  }

  pre {
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 12px;
    line-height: 1.5;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 14px 28px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
  ` : `
    background: #f8f9fa;
    color: #1a1a1a;
    border: 1px solid #e0e0e0;
    
    &:hover {
      background: #e9ecef;
    }
  `}

  &:active {
    transform: translateY(0);
  }
`;

const HelpText = styled.p`
  font-size: 14px;
  color: #999;
  margin: 24px 0 0 0;
`;

// ================================
// Error Boundary Component
// ================================
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to error reporting service (e.g., Sentry)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        extra: {
          componentStack: errorInfo.componentStack,
        },
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <ErrorContainer>
          <ErrorCard>
            <ErrorIcon>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </ErrorIcon>

            <ErrorTitle>Oops! Something went wrong</ErrorTitle>
            <ErrorMessage>
              We encountered an unexpected error. Don't worry, we've been notified and 
              are working on a fix.
            </ErrorMessage>

            {this.state.error && process.env.NODE_ENV === 'development' && (
              <ErrorDetails>
                <summary>Error Details (Development Only)</summary>
                <pre>
                  <strong>Error:</strong> {this.state.error.toString()}
                  {'\n\n'}
                  <strong>Stack:</strong>
                  {'\n'}
                  {this.state.error.stack}
                  {'\n\n'}
                  {this.state.errorInfo && (
                    <>
                      <strong>Component Stack:</strong>
                      {'\n'}
                      {this.state.errorInfo.componentStack}
                    </>
                  )}
                </pre>
              </ErrorDetails>
            )}

            <ButtonGroup>
              <Button $variant="primary" onClick={this.handleReset}>
                Try Again
              </Button>
              <Button onClick={this.handleReload}>
                Reload Page
              </Button>
              <Button onClick={this.handleGoHome}>
                Go Home
              </Button>
            </ButtonGroup>

            <HelpText>
              If the problem persists, please contact support
            </HelpText>
          </ErrorCard>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

// ================================
// Functional Error Boundary (with hook)
// ================================
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

// ================================
// Network Error Component
// ================================
const NetworkErrorIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 40px;
    height: 40px;
    color: white;
  }
`;

export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorContainer>
      <ErrorCard>
        <NetworkErrorIcon>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
          </svg>
        </NetworkErrorIcon>

        <ErrorTitle>Connection Lost</ErrorTitle>
        <ErrorMessage>
          We couldn't connect to the server. Please check your internet connection 
          and try again.
        </ErrorMessage>

        <ButtonGroup>
          <Button $variant="primary" onClick={onRetry || (() => window.location.reload())}>
            Retry Connection
          </Button>
        </ButtonGroup>

        <HelpText>
          Trying to reconnect automatically...
        </HelpText>
      </ErrorCard>
    </ErrorContainer>
  );
}

// ================================
// 404 Not Found Component
// ================================
export function NotFound() {
  return (
    <ErrorContainer>
      <ErrorCard>
        <ErrorIcon style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </ErrorIcon>

        <ErrorTitle>404 - Page Not Found</ErrorTitle>
        <ErrorMessage>
          The page you're looking for doesn't exist or has been moved.
        </ErrorMessage>

        <ButtonGroup>
          <Button $variant="primary" onClick={() => window.history.back()}>
            Go Back
          </Button>
          <Button onClick={() => window.location.href = '/'}>
            Go Home
          </Button>
        </ButtonGroup>
      </ErrorCard>
    </ErrorContainer>
  );
}

// ================================
// Unauthorized Access Component
// ================================
export function Unauthorized() {
  return (
    <ErrorContainer>
      <ErrorCard>
        <ErrorIcon style={{ background: 'linear-gradient(135deg, #f44336 0%, #e91e63 100%)' }}>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </ErrorIcon>

        <ErrorTitle>Access Denied</ErrorTitle>
        <ErrorMessage>
          You don't have permission to access this page. Please sign in or contact 
          an administrator.
        </ErrorMessage>

        <ButtonGroup>
          <Button $variant="primary" onClick={() => window.location.href = '/login'}>
            Sign In
          </Button>
          <Button onClick={() => window.location.href = '/'}>
            Go Home
          </Button>
        </ButtonGroup>
      </ErrorCard>
    </ErrorContainer>
  );
}

// ================================
// Example Usage
// ================================
/*
// Wrap your app or specific components:
import { ErrorBoundary } from './ErrorBoundary';

function App() {
  return (
    <ErrorBoundary 
      onError={(error, errorInfo) => {
        // Log to error service
        console.error(error, errorInfo);
      }}
    >
      <YourApp />
    </ErrorBoundary>
  );
}

// Or use the HOC:
import { withErrorBoundary } from './ErrorBoundary';

const SafeComponent = withErrorBoundary(MyComponent, {
  onError: (error) => console.error(error)
});

// For specific error types:
import { NotFound, Unauthorized, NetworkError } from './ErrorBoundary';

// In your routes:
if (response.status === 404) return <NotFound />;
if (response.status === 403) return <Unauthorized />;
if (networkError) return <NetworkError onRetry={refetch} />;
*/

export default ErrorBoundary;
