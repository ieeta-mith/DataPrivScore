import { Sidebar} from '@bioinformatics-ua/iam-sidebar';
// import type { User, Plugin } from '@bioinformatics-ua/iam-sidebar';

interface SidebarWrapperProps {
  config?: {
    collapsed?: boolean;
    theme?: 'dark' | 'light';
    keyboardShortcuts?: boolean;
    standaloneMode?: boolean;
    keycloakUrl?: string;
    communityKey?: string;
    requireAuthentication?: boolean;
    devMode: {
      enabled: true,
      user: {
        id: 'dev-user',
        username: 'devuser',
        email: 'dev@example.com',
        first_name: 'Dev',
        last_name: 'User',
        full_name: 'Dev User',
        is_admin: true,
        initials: 'DU',
      },
      plugins: [
        {
          id: 'dev-plugin-1',
          name: 'My Plugin',
          slug: 'dev-plugin-1',
          base_path: '',
          relative_path: '/my-plugin',
          display_section: 'COMMUNITY',
          activate: true,
          shortcuts: [
            { id: 'sc-1', name: 'Overview', slug: 'overview', url_path: '/my-plugin/overview' },
            { id: 'sc-2', name: 'Settings', slug: 'settings', url_path: '/my-plugin/settings' },
          ],
        },
        {
          id: 'dev-admin',
          name: 'Admin Panel',
          slug: 'static-admin-panel',
          base_path: '',
          relative_path: '/internal/api/admin',
          display_section: 'ADMIN',
          plugin_view: 'EXT_LINK',
          shortcuts: [],
          activate: true,
        },
      ],
    },
  };
}

export default function SidebarWrapper( config : SidebarWrapperProps) {
  console.log(import.meta.env.VITE_STANDALONE_MODE?.toLowerCase())
  console.log(import.meta.env.VITE_KEYCLOAK_URL)
  console.log(import.meta.env.VITE_COMMUNITY_KEY)
  return (
      <Sidebar
        config={{
          collapsed: false,
          theme: 'dark',
          keyboardShortcuts: true,
          standaloneMode: import.meta.env.VITE_STANDALONE_MODE?.toLowerCase() === 'true',
          keycloakUrl: import.meta.env.VITE_KEYCLOAK_URL,
          communityKey: import.meta.env.VITE_COMMUNITY_KEY,
          requireAuthentication: false,
          ...config
      }}
    />
  );
}