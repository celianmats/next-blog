/**
 * Newsletter Subscription Component
 * Beautiful newsletter signup with validation and RTL support
 */

'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { useLocale } from 'next-intl';

// ================================
// GraphQL Mutation
// ================================
const SUBSCRIBE_NEWSLETTER = gql`
  mutation SubscribeNewsletter($input: NewsletterSubscribeInput!) {
    subscribeNewsletter(input: $input) {
      id
      email
      isSubscribed
    }
  }
`;

// ================================
// Styled Components
// ================================
const NewsletterContainer = styled.section<{ $variant?: 'default' | 'inline' | 'sidebar' }>`
  ${props => {
    switch (props.$variant) {
      case 'inline':
        return `
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 60px 40px;
          border-radius: 16px;
          margin: 60px 0;
        `;
      case 'sidebar':
        return `
          background: #f8f9fa;
          padding: 32px;
          border-radius: 12px;
          border: 1px solid #e0e0e0;
        `;
      default:
        return `
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 80px 40px;
        `;
    }
  }}
`;

const NewsletterContent = styled.div<{ $variant?: string }>`
  max-width: ${props => props.$variant === 'sidebar' ? '100%' : '600px'};
  margin: 0 auto;
  text-align: center;
`;

const Icon = styled.div<{ $variant?: string }>`
  width: 64px;
  height: 64px;
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$variant === 'sidebar' ? '#667eea' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 50%;
  
  svg {
    width: 32px;
    height: 32px;
    color: white;
  }
`;

const Title = styled.h2<{ $variant?: string }>`
  font-size: ${props => props.$variant === 'sidebar' ? '22px' : '36px'};
  font-weight: 800;
  margin: 0 0 12px 0;
  color: ${props => props.$variant === 'sidebar' ? '#1a1a1a' : 'white'};
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: ${props => props.$variant === 'sidebar' ? '20px' : '28px'};
  }
`;

const Description = styled.p<{ $variant?: string }>`
  font-size: ${props => props.$variant === 'sidebar' ? '14px' : '18px'};
  line-height: 1.6;
  margin: 0 0 32px 0;
  color: ${props => props.$variant === 'sidebar' ? '#666' : 'rgba(255, 255, 255, 0.95)'};
`;

const Form = styled.form`
  display: flex;
  gap: 12px;
  max-width: 500px;
  margin: 0 auto;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const Input = styled.input<{ $variant?: string }>`
  flex: 1;
  padding: 16px 20px;
  font-size: 16px;
  border: ${props => props.$variant === 'sidebar' ? '2px solid #e0e0e0' : '2px solid rgba(255, 255, 255, 0.3)'};
  background: ${props => props.$variant === 'sidebar' ? 'white' : 'rgba(255, 255, 255, 0.15)'};
  color: ${props => props.$variant === 'sidebar' ? '#1a1a1a' : 'white'};
  border-radius: 10px;
  transition: all 0.2s;
  font-family: inherit;

  &::placeholder {
    color: ${props => props.$variant === 'sidebar' ? '#999' : 'rgba(255, 255, 255, 0.7)'};
  }

  &:focus {
    outline: none;
    background: ${props => props.$variant === 'sidebar' ? 'white' : 'rgba(255, 255, 255, 0.25)'};
    border-color: ${props => props.$variant === 'sidebar' ? '#667eea' : 'white'};
  }
`;

const Button = styled.button<{ $variant?: string }>`
  padding: 16px 32px;
  background: ${props => props.$variant === 'sidebar' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white'};
  color: ${props => props.$variant === 'sidebar' ? 'white' : '#667eea'};
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  font-family: inherit;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 640px) {
    width: 100%;
  }
`;

const Message = styled.div<{ $type: 'success' | 'error' }>`
  margin-top: 16px;
  padding: 12px 20px;
  background: ${props => props.$type === 'success' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)'};
  border: 1px solid ${props => props.$type === 'success' ? 'rgba(76, 175, 80, 0.5)' : 'rgba(244, 67, 54, 0.5)'};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.$type === 'success' ? '#2e7d32' : '#c62828'};
`;

const Features = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-top: 40px;
`;

const Feature = styled.div<{ $variant?: string }>`
  text-align: center;
  color: ${props => props.$variant === 'sidebar' ? '#666' : 'rgba(255, 255, 255, 0.9)'};

  svg {
    width: 40px;
    height: 40px;
    margin-bottom: 12px;
    opacity: 0.9;
  }

  h4 {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 4px 0;
    color: ${props => props.$variant === 'sidebar' ? '#1a1a1a' : 'white'};
  }

  p {
    font-size: 13px;
    margin: 0;
    opacity: 0.85;
  }
`;

const PrivacyNote = styled.div<{ $variant?: string }>`
  margin-top: 20px;
  font-size: 12px;
  color: ${props => props.$variant === 'sidebar' ? '#999' : 'rgba(255, 255, 255, 0.7)'};
  
  a {
    color: inherit;
    text-decoration: underline;
  }
`;

// ================================
// Newsletter Component
// ================================
interface NewsletterProps {
  variant?: 'default' | 'inline' | 'sidebar';
  showFeatures?: boolean;
}

export default function Newsletter({ variant = 'default', showFeatures = true }: NewsletterProps) {
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [subscribe, { loading }] = useMutation(SUBSCRIBE_NEWSLETTER);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!email || !email.includes('@')) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    try {
      await subscribe({
        variables: {
          input: {
            email,
            locale: locale.toUpperCase(),
          },
        },
      });

      setMessage({ 
        type: 'success', 
        text: 'Thanks for subscribing! Check your email to confirm.' 
      });
      setEmail('');
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Something went wrong. Please try again.' 
      });
    }
  };

  const translations = {
    en: {
      title: 'Stay Informed',
      description: 'Get our best stories delivered to your inbox every week. Quality journalism you can trust.',
      placeholder: 'Enter your email',
      button: 'Subscribe',
      features: [
        { title: 'Weekly Digest', description: 'Best stories every week' },
        { title: 'No Spam', description: 'Unsubscribe anytime' },
        { title: 'Ad-Free', description: 'Pure content only' },
      ],
      privacy: 'We respect your privacy. Read our Privacy Policy.',
    },
    fr: {
      title: 'Restez Informé',
      description: 'Recevez nos meilleurs articles dans votre boîte de réception chaque semaine. Un journalisme de qualité en qui vous pouvez avoir confiance.',
      placeholder: 'Entrez votre email',
      button: 'S\'abonner',
      features: [
        { title: 'Digest Hebdomadaire', description: 'Meilleurs articles chaque semaine' },
        { title: 'Pas de Spam', description: 'Désabonnez-vous à tout moment' },
        { title: 'Sans Publicité', description: 'Contenu pur uniquement' },
      ],
      privacy: 'Nous respectons votre vie privée. Lisez notre Politique de Confidentialité.',
    },
    ar: {
      title: 'ابق على اطلاع',
      description: 'احصل على أفضل قصصنا في بريدك الإلكتروني كل أسبوع. صحافة جيدة يمكنك الوثوق بها.',
      placeholder: 'أدخل بريدك الإلكتروني',
      button: 'اشترك',
      features: [
        { title: 'ملخص أسبوعي', description: 'أفضل القصص كل أسبوع' },
        { title: 'بدون بريد مزعج', description: 'إلغاء الاشتراك في أي وقت' },
        { title: 'خالي من الإعلانات', description: 'محتوى نقي فقط' },
      ],
      privacy: 'نحن نحترم خصوصيتك. اقرأ سياسة الخصوصية الخاصة بنا.',
    },
  };

  const t = translations[locale as keyof typeof translations] || translations.en;

  return (
    <NewsletterContainer $variant={variant}>
      <NewsletterContent $variant={variant}>
        {variant !== 'sidebar' && (
          <Icon $variant={variant}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </Icon>
        )}

        <Title $variant={variant}>{t.title}</Title>
        <Description $variant={variant}>{t.description}</Description>

        <Form onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder={t.placeholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            $variant={variant}
          />
          <Button type="submit" disabled={loading} $variant={variant}>
            {loading ? '...' : t.button}
          </Button>
        </Form>

        {message && (
          <Message $type={message.type}>
            {message.text}
          </Message>
        )}

        {showFeatures && variant !== 'sidebar' && (
          <Features>
            {t.features.map((feature, index) => (
              <Feature key={index} $variant={variant}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {index === 0 && (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                  {index === 1 && (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  )}
                  {index === 2 && (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  )}
                </svg>
                <h4>{feature.title}</h4>
                <p>{feature.description}</p>
              </Feature>
            ))}
          </Features>
        )}

        <PrivacyNote $variant={variant}>
          {t.privacy.split('.')[0]}. <a href="/privacy">Privacy Policy</a>.
        </PrivacyNote>
      </NewsletterContent>
    </NewsletterContainer>
  );
}

// ================================
// Sidebar Variant
// ================================
export function NewsletterSidebar() {
  return <Newsletter variant="sidebar" showFeatures={false} />;
}

// ================================
// Inline Variant
// ================================
export function NewsletterInline() {
  return <Newsletter variant="inline" showFeatures={true} />;
}
