import { Sidebar } from '@bioinformatics-ua/iam-sidebar';

interface SidebarConfig {
    config?: {
        collapsed?: boolean;
        theme?: 'dark' | 'light';
        authEnabled?: boolean;
        keyboardShortcuts?: boolean;
        standaloneMode?: boolean;
        adminRoleName?: string;
        keycloakUrl?: string;
        tokenKey?: string;
        refreshTokenKey?: string;
        communityKey?: string;
    };
}

export default function SidebarWrapper( config : SidebarConfig) {
  return (
    <Sidebar
      config={{
        collapsed: false,  // TODO GET LOCAL STORAGE VALUE
        authEnabled: true,
        keyboardShortcuts: true,
        standaloneMode: true,
        adminRoleName: import.meta.env.VITE_PUBLIC_ADMIN_ROLE || 'dashboard-admin',
        keycloakUrl: import.meta.env.VITE_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080/keycloak/',
        tokenKey: import.meta.env.VITE_PUBLIC_TOKEN_KEY || 'cookie.session-token',
        refreshTokenKey: import.meta.env.VITE_PUBLIC_REFRESH_TOKEN_KEY || 'cookie.session-token-refresh',
        communityKey: import.meta.env.VITE_PUBLIC_COMMUNITY_KEY || 'currentCommunity',
        ...config,
      }}
    />
  );
}