declare module 'kbar' {
    export const KBarAnimator: React.ComponentType<any>;
    export const KBarPortal: React.ComponentType<any>;
    export const KBarPositioner: React.ComponentType<any>;
    export const KBarProvider: React.ComponentType<any>;
    export const KBarSearch: React.ComponentType<any>;
    export const KBarResults: React.ComponentType<any>;
    export const useKBar: () => any;
    export const useMatches: () => { results: any[]; rootActionId: string | null };
    export const useRegisterActions: (actions: any[], dependencies?: any[]) => void;

    export type ActionId = string;
    export interface ActionImpl {
        id: ActionId;
        name: string;
        shortcut?: string[];
        keywords?: string;
        section?: string;
        subtitle?: string;
        perform?: () => void;
        icon?: React.ReactElement;
        ancestors: { id: ActionId; name: string }[];
    }
} 