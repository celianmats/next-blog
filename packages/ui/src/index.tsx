import 'styled-components';

declare module 'styled-components' {
    export interface DefaultTheme {
        [key: string]: any;
        colors: {
            [key: string]: string;
        };
    }
}

export { AppLayout, Providers } from './components/AppLayout';
export { default as Header } from './components/Header';
export { default as AdminDashboard } from './components/AdminDashboard';
export { default as AnalyticsDashboard } from './components/AnalyticsDashboard';
export { default as ArticleEditor } from './components/ArticleEditor';
export { default as ArticleDetail } from './components/ArticleDetail';
export { LoginForm, RegisterForm } from './components/AuthForms';
export { default as CategoryPage } from './components/CategoryPage';
export { default as Footer } from './components/Footer';
export { default as HomePage } from './components/HomePage';
export { default as MobileNavigation } from './components/MobileNavigation';
export { default as Newsletter } from './components/Newsletter';
export { default as SearchPage } from './components/SearchPage';
export { default as UserProfile } from './components/UserProfile';

export { AuthProvider, useAuth, withAuth } from './context/AuthContext';
export { ToastProvider, useToast } from './components/Toast';
export { getDirection } from './lib/rtl-utils';
export { default as StyledComponentsRegistry } from './lib/registry';