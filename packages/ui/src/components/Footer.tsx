/**
 * Footer Component
 * Multi-language footer with navigation, newsletter, and social links
 */

'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { useLocale } from 'next-intl';

// ================================
// Styled Components
// ================================
const FooterContainer = styled.footer`
  background: #1a1a1a;
  color: white;
  margin-top: auto;
`;

const FooterMain = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 80px 24px 40px;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 60px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr;
    gap: 40px;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FooterBrand = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Logo = styled.h2`
  font-size: 32px;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Tagline = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
`;

const SocialIcon = styled.a`
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    transform: translateY(-2px);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const FooterTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 16px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: white;
`;

const FooterLinks = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FooterLink = styled.a`
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 15px;
  transition: all 0.2s;
  cursor: pointer;
  display: inline-block;

  &:hover {
    color: white;
    transform: translateX(4px);
  }
`;

const NewsletterForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
`;

const NewsletterInput = styled.input`
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  transition: all 0.2s;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.15);
    border-color: #667eea;
  }
`;

const NewsletterButton = styled.button`
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FooterBottom = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 32px 24px;
`;

const FooterBottomContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;

  @media (max-width: 640px) {
    flex-direction: column;
    text-align: center;
  }
`;

const Copyright = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
`;

const FooterBottomLinks = styled.div`
  display: flex;
  gap: 24px;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    justify-content: center;
  }
`;

const FooterBottomLink = styled.a`
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
  cursor: pointer;

  &:hover {
    color: white;
  }
`;

const LanguageSelector = styled.div`
  position: relative;
`;

const LanguageButton = styled.button`
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const LanguageDropdown = styled.div<{ $show: boolean }>`
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 8px;
  background: #2a2a2a;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 8px;
  display: ${props => props.$show ? 'flex' : 'none'};
  flex-direction: column;
  gap: 4px;
  min-width: 150px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
`;

const LanguageOption = styled.button`
  padding: 10px 16px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  text-align: left;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
`;

const Message = styled.div<{ $type: 'success' | 'error' }>`
  padding: 8px 12px;
  background: ${props => props.$type === 'success' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)'};
  border: 1px solid ${props => props.$type === 'success' ? 'rgba(76, 175, 80, 0.5)' : 'rgba(244, 67, 54, 0.5)'};
  border-radius: 6px;
  font-size: 13px;
  color: ${props => props.$type === 'success' ? '#4caf50' : '#f44336'};
`;

// ================================
// Footer Component
// ================================
export default function Footer() {
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showLanguages, setShowLanguages] = useState(false);

  const translations = {
    en: {
      tagline: 'Independent journalism for a democratic society. Quality reporting you can trust.',
      about: 'About',
      contact: 'Contact',
      careers: 'Careers',
      press: 'Press',
      categories: 'Categories',
      politics: 'Politics',
      economy: 'Economy',
      culture: 'Culture',
      technology: 'Technology',
      resources: 'Resources',
      help: 'Help Center',
      faq: 'FAQ',
      guidelines: 'Guidelines',
      apiDocs: 'API Docs',
      newsletter: 'Newsletter',
      newsletterText: 'Get our best stories in your inbox',
      emailPlaceholder: 'Enter your email',
      subscribe: 'Subscribe',
      copyright: '© 2026 Republik. All rights reserved.',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      cookies: 'Cookie Policy',
      language: 'Language',
    },
    fr: {
      tagline: 'Journalisme indépendant pour une société démocratique. Des reportages de qualité en qui vous pouvez avoir confiance.',
      about: 'À propos',
      contact: 'Contact',
      careers: 'Carrières',
      press: 'Presse',
      categories: 'Catégories',
      politics: 'Politique',
      economy: 'Économie',
      culture: 'Culture',
      technology: 'Technologie',
      resources: 'Ressources',
      help: 'Centre d\'aide',
      faq: 'FAQ',
      guidelines: 'Directives',
      apiDocs: 'Documentation API',
      newsletter: 'Newsletter',
      newsletterText: 'Recevez nos meilleurs articles',
      emailPlaceholder: 'Entrez votre email',
      subscribe: 'S\'abonner',
      copyright: '© 2026 Republik. Tous droits réservés.',
      privacy: 'Politique de confidentialité',
      terms: 'Conditions d\'utilisation',
      cookies: 'Politique des cookies',
      language: 'Langue',
    },
    ar: {
      tagline: 'صحافة مستقلة لمجتمع ديمقراطي. تقارير عالية الجودة يمكنك الوثوق بها.',
      about: 'حول',
      contact: 'اتصل',
      careers: 'وظائف',
      press: 'صحافة',
      categories: 'التصنيفات',
      politics: 'سياسة',
      economy: 'اقتصاد',
      culture: 'ثقافة',
      technology: 'تكنولوجيا',
      resources: 'الموارد',
      help: 'مركز المساعدة',
      faq: 'الأسئلة الشائعة',
      guidelines: 'الإرشادات',
      apiDocs: 'وثائق API',
      newsletter: 'النشرة الإخبارية',
      newsletterText: 'احصل على أفضل قصصنا',
      emailPlaceholder: 'أدخل بريدك الإلكتروني',
      subscribe: 'اشترك',
      copyright: '© 2026 Republik. جميع الحقوق محفوظة.',
      privacy: 'سياسة الخصوصية',
      terms: 'شروط الخدمة',
      cookies: 'سياسة ملفات تعريف الارتباط',
      language: 'اللغة',
    },
  };

  const t = translations[locale as keyof typeof translations] || translations.en;

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  ];

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setMessage({ type: 'error', text: 'Please enter a valid email' });
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setMessage({ type: 'success', text: 'Thank you for subscribing!' });
      setEmail('');
      setTimeout(() => setMessage(null), 3000);
    }, 500);
  };

  const handleLanguageChange = (code: string) => {
    setShowLanguages(false);
    window.location.href = `/${code}`;
  };

  return (
    <FooterContainer>
      <FooterMain>
        <FooterBrand>
          <Logo>Republik</Logo>
          <Tagline>{t.tagline}</Tagline>
          <SocialLinks>
            <SocialIcon href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
              </svg>
            </SocialIcon>
            <SocialIcon href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
              </svg>
            </SocialIcon>
            <SocialIcon href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </SocialIcon>
            <SocialIcon href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                <circle cx="4" cy="4" r="2"/>
              </svg>
            </SocialIcon>
          </SocialLinks>
        </FooterBrand>

        <FooterSection>
          <FooterTitle>{t.about}</FooterTitle>
          <FooterLinks>
            <FooterLink href={`/${locale}/about`}>{t.about}</FooterLink>
            <FooterLink href={`/${locale}/contact`}>{t.contact}</FooterLink>
            <FooterLink href={`/${locale}/careers`}>{t.careers}</FooterLink>
            <FooterLink href={`/${locale}/press`}>{t.press}</FooterLink>
          </FooterLinks>
        </FooterSection>

        <FooterSection>
          <FooterTitle>{t.categories}</FooterTitle>
          <FooterLinks>
            <FooterLink href={`/${locale}/category/politics`}>{t.politics}</FooterLink>
            <FooterLink href={`/${locale}/category/economy`}>{t.economy}</FooterLink>
            <FooterLink href={`/${locale}/category/culture`}>{t.culture}</FooterLink>
            <FooterLink href={`/${locale}/category/technology`}>{t.technology}</FooterLink>
          </FooterLinks>
        </FooterSection>

        <FooterSection>
          <FooterTitle>{t.newsletter}</FooterTitle>
          <Tagline style={{ marginBottom: '8px' }}>{t.newsletterText}</Tagline>
          <NewsletterForm onSubmit={handleSubscribe}>
            {message && <Message $type={message.type}>{message.text}</Message>}
            <NewsletterInput
              type="email"
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <NewsletterButton type="submit">{t.subscribe}</NewsletterButton>
          </NewsletterForm>
        </FooterSection>
      </FooterMain>

      <FooterBottom>
        <FooterBottomContent>
          <Copyright>{t.copyright}</Copyright>
          
          <FooterBottomLinks>
            <FooterBottomLink href={`/${locale}/privacy`}>{t.privacy}</FooterBottomLink>
            <FooterBottomLink href={`/${locale}/terms`}>{t.terms}</FooterBottomLink>
            <FooterBottomLink href={`/${locale}/cookies`}>{t.cookies}</FooterBottomLink>
          </FooterBottomLinks>

          <LanguageSelector>
            <LanguageButton onClick={() => setShowLanguages(!showLanguages)}>
              <span>{currentLanguage.flag}</span>
              <span>{currentLanguage.name}</span>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </LanguageButton>
            <LanguageDropdown $show={showLanguages}>
              {languages.map(lang => (
                <LanguageOption
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                >
                  {lang.flag} {lang.name}
                </LanguageOption>
              ))}
            </LanguageDropdown>
          </LanguageSelector>
        </FooterBottomContent>
      </FooterBottom>
    </FooterContainer>
  );
}
