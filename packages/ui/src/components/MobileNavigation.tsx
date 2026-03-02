/**
 * Mobile Navigation Component
 * Responsive mobile menu with hamburger icon and slide-in panel
 */

'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLocale } from 'next-intl';
import { useAuth } from '../context/AuthContext';

// ================================
// Styled Components
// ================================
const MobileNavContainer = styled.div`
  @media (min-width: 1025px) {
    display: none;
  }
`;

const HamburgerButton = styled.button<{ $isOpen: boolean }>`
  width: 44px;
  height: 44px;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 6px;
  position: relative;
  z-index: 1001;

  span {
    width: 24px;
    height: 2px;
    background: ${props => props.$isOpen ? 'white' : '#1a1a1a'};
    transition: all 0.3s;
    transform-origin: center;

    &:nth-child(1) {
      transform: ${props => props.$isOpen ? 'rotate(45deg) translateY(8px)' : 'none'};
    }

    &:nth-child(2) {
      opacity: ${props => props.$isOpen ? 0 : 1};
    }

    &:nth-child(3) {
      transform: ${props => props.$isOpen ? 'rotate(-45deg) translateY(-8px)' : 'none'};
    }
  }
`;

const Overlay = styled.div<{ $show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: ${props => props.$show ? 1 : 0};
  pointer-events: ${props => props.$show ? 'all' : 'none'};
  transition: opacity 0.3s;
  backdrop-filter: blur(4px);
`;

const MobileMenu = styled.nav<{ $show: boolean; $direction: 'ltr' | 'rtl' }>`
  position: fixed;
  top: 0;
  ${props => props.$direction === 'rtl' ? 'left: 0' : 'right: 0'};
  bottom: 0;
  width: 320px;
  max-width: 85vw;
  background: white;
  z-index: 1000;
  transform: translateX(${props => {
    if (!props.$show) return props.$direction === 'rtl' ? '-100%' : '100%';
    return '0';
  }});
  transition: transform 0.3s ease-in-out;
  overflow-y: auto;
  box-shadow: ${props => props.$show ? '-4px 0 20px rgba(0, 0, 0, 0.15)' : 'none'};
`;

const MenuHeader = styled.div`
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
`;

const MenuLogo = styled.h2`
  font-size: 28px;
  font-weight: 800;
  margin: 0 0 8px 0;
`;

const MenuTagline = styled.p`
  font-size: 14px;
  margin: 0;
  opacity: 0.9;
`;

const MenuSection = styled.div`
  padding: 24px;
  border-bottom: 1px solid #f0f0f0;
`;

const SectionTitle = styled.h3`
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #999;
  margin: 0 0 16px 0;
`;

const MenuList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const MenuItem = styled.li`
  margin: 0;
`;

const MenuLink = styled.a`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: #1a1a1a;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s;
  cursor: pointer;

  svg {
    width: 20px;
    height: 20px;
    color: #666;
  }

  &:hover {
    background: #f8f9fa;
    color: #667eea;

    svg {
      color: #667eea;
    }
  }
`;

const UserSection = styled.div`
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  background: #f8f9fa;
`;

const UserAvatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid white;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: 600;
  font-size: 15px;
  color: #1a1a1a;
`;

const UserEmail = styled.div`
  font-size: 13px;
  color: #666;
`;

const AuthButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;

  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    &:active {
      transform: scale(0.98);
    }
  ` : `
    background: white;
    color: #1a1a1a;
    border: 1px solid #e0e0e0;
    
    &:active {
      background: #f8f9fa;
    }
  `}
`;

const LanguageSelector = styled.div`
  padding: 24px;
  border-top: 1px solid #f0f0f0;
`;

const LanguageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
`;

const LanguageButton = styled.button<{ $active: boolean }>`
  padding: 10px 12px;
  background: ${props => props.$active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white'};
  color: ${props => props.$active ? 'white' : '#1a1a1a'};
  border: 1px solid ${props => props.$active ? 'transparent' : '#e0e0e0'};
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;

  &:active {
    transform: scale(0.95);
  }

  .flag {
    font-size: 20px;
  }
`;

const ThemeToggle = styled.button`
  width: 100%;
  padding: 12px 16px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s;
  margin-top: 12px;

  svg {
    width: 20px;
    height: 20px;
  }

  &:active {
    background: #f8f9fa;
  }
`;

// ================================
// Mobile Navigation Component
// ================================
export default function MobileNavigation() {
  const locale = useLocale();
  const { user, isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  // Close menu when clicking overlay
  const handleOverlayClick = () => {
    setIsOpen(false);
  };

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const translations = {
    en: {
      navigation: 'Navigation',
      home: 'Home',
      articles: 'Articles',
      categories: 'Categories',
      search: 'Search',
      account: 'Account',
      profile: 'My Profile',
      settings: 'Settings',
      admin: 'Admin Dashboard',
      login: 'Sign In',
      register: 'Sign Up',
      logout: 'Sign Out',
      language: 'Language',
      theme: 'Theme',
      lightMode: 'Light Mode',
      darkMode: 'Dark Mode',
      tagline: 'Independent journalism for democracy',
    },
    fr: {
      navigation: 'Navigation',
      home: 'Accueil',
      articles: 'Articles',
      categories: 'Catégories',
      search: 'Rechercher',
      account: 'Compte',
      profile: 'Mon Profil',
      settings: 'Paramètres',
      admin: 'Admin',
      login: 'Connexion',
      register: 'Inscription',
      logout: 'Déconnexion',
      language: 'Langue',
      theme: 'Thème',
      lightMode: 'Mode Clair',
      darkMode: 'Mode Sombre',
      tagline: 'Journalisme indépendant pour la démocratie',
    },
    ar: {
      navigation: 'التنقل',
      home: 'الرئيسية',
      articles: 'المقالات',
      categories: 'التصنيفات',
      search: 'بحث',
      account: 'الحساب',
      profile: 'ملفي الشخصي',
      settings: 'الإعدادات',
      admin: 'لوحة الإدارة',
      login: 'تسجيل الدخول',
      register: 'إنشاء حساب',
      logout: 'تسجيل الخروج',
      language: 'اللغة',
      theme: 'المظهر',
      lightMode: 'وضع فاتح',
      darkMode: 'وضع داكن',
      tagline: 'صحافة مستقلة للديمقراطية',
    },
  };

  const t = translations[locale as keyof typeof translations] || translations.en;

  const languages = [
    { code: 'en', name: 'EN', flag: '🇬🇧' },
    { code: 'fr', name: 'FR', flag: '🇫🇷' },
    { code: 'ar', name: 'AR', flag: '🇸🇦' },
  ];

  const handleLanguageChange = (code: string) => {
    window.location.href = `/${code}`;
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <MobileNavContainer>
      <HamburgerButton $isOpen={isOpen} onClick={() => setIsOpen(!isOpen)}>
        <span />
        <span />
        <span />
      </HamburgerButton>

      <Overlay $show={isOpen} onClick={handleOverlayClick} />

      <MobileMenu $show={isOpen} $direction={direction}>
        <MenuHeader>
          <MenuLogo>Republik</MenuLogo>
          <MenuTagline>{t.tagline}</MenuTagline>
        </MenuHeader>

        {isAuthenticated && user && (
          <UserSection>
            <UserAvatar 
              src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`} 
              alt={user.name}
            />
            <UserInfo>
              <UserName>{user.name}</UserName>
              <UserEmail>{user.email}</UserEmail>
            </UserInfo>
          </UserSection>
        )}

        <MenuSection>
          <SectionTitle>{t.navigation}</SectionTitle>
          <MenuList>
            <MenuItem>
              <MenuLink href={`/${locale}`}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {t.home}
              </MenuLink>
            </MenuItem>
            <MenuItem>
              <MenuLink href={`/${locale}/articles`}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                {t.articles}
              </MenuLink>
            </MenuItem>
            <MenuItem>
              <MenuLink href={`/${locale}/categories`}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {t.categories}
              </MenuLink>
            </MenuItem>
            <MenuItem>
              <MenuLink href={`/${locale}/search`}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {t.search}
              </MenuLink>
            </MenuItem>
          </MenuList>
        </MenuSection>

        {isAuthenticated ? (
          <MenuSection>
            <SectionTitle>{t.account}</SectionTitle>
            <MenuList>
              <MenuItem>
                <MenuLink href={`/${locale}/profile`}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {t.profile}
                </MenuLink>
              </MenuItem>
              <MenuItem>
                <MenuLink href={`/${locale}/settings`}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {t.settings}
                </MenuLink>
              </MenuItem>
              {(user?.role === 'ADMIN' || user?.role === 'EDITOR') && (
                <MenuItem>
                  <MenuLink href={`/${locale}/admin`}>
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    {t.admin}
                  </MenuLink>
                </MenuItem>
              )}
              <MenuItem>
                <MenuLink onClick={handleLogout}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {t.logout}
                </MenuLink>
              </MenuItem>
            </MenuList>
          </MenuSection>
        ) : (
          <MenuSection>
            <AuthButtons>
              <Button $variant="primary" onClick={() => window.location.href = `/${locale}/login`}>
                {t.login}
              </Button>
              <Button $variant="secondary" onClick={() => window.location.href = `/${locale}/register`}>
                {t.register}
              </Button>
            </AuthButtons>
          </MenuSection>
        )}

        <LanguageSelector>
          <SectionTitle>{t.language}</SectionTitle>
          <LanguageGrid>
            {languages.map(lang => (
              <LanguageButton
                key={lang.code}
                $active={locale === lang.code}
                onClick={() => handleLanguageChange(lang.code)}
              >
                <span className="flag">{lang.flag}</span>
                <span>{lang.name}</span>
              </LanguageButton>
            ))}
          </LanguageGrid>

          <ThemeToggle onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            <span>{theme === 'light' ? t.lightMode : t.darkMode}</span>
            {theme === 'light' ? (
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </ThemeToggle>
        </LanguageSelector>
      </MobileMenu>
    </MobileNavContainer>
  );
}
