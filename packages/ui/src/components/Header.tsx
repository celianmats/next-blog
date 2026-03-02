import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useLocale } from 'next-intl';

const HeaderContainer = styled.header`
  background: white;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  padding: 16px 0;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);

  @media (max-width: 1024px) {
    display: none;
  }
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderLogo = styled.a`
  font-size: 28px;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  cursor: pointer;
`;

const HeaderNav = styled.nav`
  display: flex;
  gap: 32px;
  align-items: center;
`;

const HeaderLink = styled.a`
  color: ${props => props.theme.colors.text};
  font-weight: 500;
  font-size: 15px;
  transition: color 0.2s;
  cursor: pointer;

  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const HeaderButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
  ` : `
    background: transparent;
    color: ${props.theme.colors.text};
    border: 1px solid ${props.theme.colors.border};
    
    &:hover {
      background: ${props.theme.colors.backgroundGray};
    }
  `}
`;

const LanguageSwitcher = styled.div`
  display: flex;
  gap: 8px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  padding: 4px;
  margin-right: 16px;
`;

const LanguageButton = styled.button<{ $active: boolean }>`
  padding: 6px 12px;
  background: ${props => props.$active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.$active ? props.theme.colors.background : props.theme.colors.text};
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;

  &:hover {
    background: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.backgroundGray};
  }
`;

const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
`;

const UserAvatar = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid ${props => props.theme.colors.border};
`;

function Header() {
    const locale = useLocale();
    const { user, isAuthenticated } = useAuth();

    const changeLanguage = (newLocale: string) => {
        window.location.href = `/${newLocale}`;
    };

    const translations = {
        en: { home: 'Home', articles: 'Articles', categories: 'Categories', search: 'Search', login: 'Sign In', register: 'Sign Up' },
        fr: { home: 'Accueil', articles: 'Articles', categories: 'Catégories', search: 'Rechercher', login: 'Connexion', register: 'Inscription' },
        ar: { home: 'الرئيسية', articles: 'المقالات', categories: 'التصنيفات', search: 'بحث', login: 'تسجيل الدخول', register: 'إنشاء حساب' },
    };

    const t = translations[locale as keyof typeof translations] || translations.en;

    return (
        <HeaderContainer>
            <HeaderContent>
                <HeaderLogo href={`/${locale}`}>Republik</HeaderLogo>

                <HeaderNav>
                    <HeaderLink href={`/${locale}`}>{t.home}</HeaderLink>
                    <HeaderLink href={`/${locale}/articles`}>{t.articles}</HeaderLink>
                    <HeaderLink href={`/${locale}/categories`}>{t.categories}</HeaderLink>
                    <HeaderLink href={`/${locale}/search`}>{t.search}</HeaderLink>
                </HeaderNav>

                <HeaderActions>
                    <LanguageSwitcher>
                        <LanguageButton $active={locale === 'en'} onClick={() => changeLanguage('en')}>EN</LanguageButton>
                        <LanguageButton $active={locale === 'fr'} onClick={() => changeLanguage('fr')}>FR</LanguageButton>
                        <LanguageButton $active={locale === 'ar'} onClick={() => changeLanguage('ar')}>AR</LanguageButton>
                    </LanguageSwitcher>
                    {isAuthenticated && user ? (
                        <UserMenu>
                            <UserAvatar
                                src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                                alt={user.name}
                            />
                            <span>{user.name}</span>
                        </UserMenu>
                    ) : (
                        <>
                            <HeaderButton onClick={() => window.location.href = `/${locale}/login`}>
                                {t.login}
                            </HeaderButton>
                            <HeaderButton
                                $variant="primary"
                                onClick={() => window.location.href = `/${locale}/register`}
                            >
                                {t.register}
                            </HeaderButton>
                        </>
                    )}
                </HeaderActions>
            </HeaderContent>
        </HeaderContainer>
    );
}

export default Header;
