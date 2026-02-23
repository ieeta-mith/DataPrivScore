import { Sidebar} from '@bioinformatics-ua/iam-sidebar';
import type { User, Plugin } from '@bioinformatics-ua/iam-sidebar';

interface SidebarWrapperProps {
    config?: {
        collapsed?: boolean;
        theme?: 'dark' | 'light';
        keyboardShortcuts?: boolean;
        standaloneMode?: boolean;
        keycloakUrl?: string;
        communityKey?: string;
        requireAuthentication?: boolean;
        devMode?: {
            enabled: boolean;
            user: User;
            plugins: Plugin[];
        }
    };
}

export default function SidebarWrapper({ config }: SidebarWrapperProps) {
    return (
        <Sidebar
            config={{
                collapsed: false,
                theme: 'dark',
                keyboardShortcuts: true,
                standaloneMode: import.meta.env.VITE_PUBLIC_STANDALONE_MODE === 'true',
                keycloakUrl: import.meta.env.VITE_PUBLIC_KEYCLOAK_URL,
                communityKey: import.meta.env.VITE_PUBLIC_COMMUNITY_KEY,
                requireAuthentication: true,
                ...config,
            }}
        />
    );
}