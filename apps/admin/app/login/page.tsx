'use client';

import { LoginForm } from '@republik/ui';
import styled from 'styled-components';

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f8f9fa;
`;

const LoginCard = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
`;

const LoginHeader = styled.div`
  text-align: center;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 800;
  color: #1a1a1a;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 16px;
`;

export default function AdminLoginPage() {
    const handleSuccess = () => {
        // Redirect to dashboard on success
        window.location.href = '/';
    };

    return (
        <LoginContainer>
            <LoginCard>
                <LoginForm onSuccess={handleSuccess} />
            </LoginCard>
        </LoginContainer>
    );
}
