/**
 * Login and Registration Components
 * Beautiful forms with RTL support
 */

'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

// ================================
// Styled Components
// ================================
const AuthContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const AuthCard = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 440px;
  overflow: hidden;
`;

const AuthHeader = styled.div`
  padding: 48px 40px 32px;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
`;

const Logo = styled.h1`
  font-size: 36px;
  font-weight: 800;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
`;

const Tagline = styled.p`
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
`;

const AuthBody = styled.div`
  padding: 40px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
`;

const Input = styled.input`
  padding: 14px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.2s;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #999;
  }

  &[type='password'] {
    letter-spacing: 2px;
  }
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 14px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;

  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
  ` : `
    background: transparent;
    color: #667eea;
    border: 2px solid #667eea;
    
    &:hover:not(:disabled) {
      background: #667eea;
      color: white;
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const ErrorMessage = styled.div`
  padding: 12px 16px;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  color: #c33;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SuccessMessage = styled.div`
  padding: 12px 16px;
  background: #efe;
  border: 1px solid #cfc;
  border-radius: 8px;
  color: #3c3;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 24px 0;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e0e0e0;
  }

  span {
    color: #999;
    font-size: 14px;
  }
`;

const Link = styled.a`
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: #764ba2;
    text-decoration: underline;
  }
`;

const TextCenter = styled.div`
  text-align: center;
  font-size: 14px;
  color: #666;
`;

const SocialButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const SocialButton = styled.button`
  flex: 1;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    border-color: #667eea;
    background: #f8f9ff;
  }
`;

const PasswordStrength = styled.div<{ $strength: number }>`
  height: 4px;
  border-radius: 2px;
  background: #e0e0e0;
  margin-top: 8px;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${props => props.$strength}%;
    background: ${props => {
    if (props.$strength < 30) return '#f44336';
    if (props.$strength < 60) return '#ff9800';
    if (props.$strength < 90) return '#ffeb3b';
    return '#4caf50';
  }};
    transition: all 0.3s;
  }
`;

// ================================
// Login Component
// ================================
export function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContainer>
      <AuthCard>
        <AuthHeader>
          <Logo>Admin Login</Logo>
        </AuthHeader>

        <AuthBody>
          <Form onSubmit={handleSubmit}>
            {error && (
              <ErrorMessage>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </ErrorMessage>
            )}

            <FormGroup>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </FormGroup>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                <input type="checkbox" />
                Remember me
              </label>
              <Link>Forgot password?</Link>
            </div>

            <Button type="submit" $variant="primary" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Form>

          <Divider><span>or continue with</span></Divider>

          <SocialButtons>
            <SocialButton type="button">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </SocialButton>
            <SocialButton type="button">
              <svg width="20" height="20" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </SocialButton>
          </SocialButtons>

          <TextCenter style={{ marginTop: '24px' }}>
            Don't have an account? <Link href="/register">Sign up</Link>
          </TextCenter>
        </AuthBody>
      </AuthCard>
    </AuthContainer>
  );
}

// ================================
// Register Component
// ================================
export function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  // Calculate password strength
  const getPasswordStrength = (pwd: string): number => {
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (pwd.length >= 12) strength += 25;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 25;
    if (/\d/.test(pwd)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength += 10;
    return Math.min(100, strength);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password, name);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContainer>
      <AuthCard>
        <AuthHeader>
          <Logo>Republik</Logo>
          <Tagline>Join our community of informed readers</Tagline>
        </AuthHeader>

        <AuthBody>
          <Form onSubmit={handleSubmit}>
            {error && (
              <ErrorMessage>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </ErrorMessage>
            )}

            <FormGroup>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              {password && (
                <PasswordStrength $strength={getPasswordStrength(password)} />
              )}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </FormGroup>

            <div style={{ fontSize: '13px', color: '#666' }}>
              By creating an account, you agree to our{' '}
              <Link>Terms of Service</Link> and{' '}
              <Link>Privacy Policy</Link>
            </div>

            <Button type="submit" $variant="primary" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </Form>

          <TextCenter style={{ marginTop: '24px' }}>
            Already have an account? <Link href="/login">Sign in</Link>
          </TextCenter>
        </AuthBody>
      </AuthCard>
    </AuthContainer>
  );
}
