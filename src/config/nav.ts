import {
    Upload,
    Settings,
    FileText,
    FolderOpen,
    BarChart3,
    Users,
    HelpCircle,
    LogOut,
} from 'lucide-react';

/**
 * Navigation configuration for the application
 */

// Main navigation items - simplified for SaaS interface
export const mainNavItems = [
    {
        title: 'Télécharger',
        href: '/upload',
        icon: Upload,
        description: 'Télécharger et classifier vos documents',
    },
    {
        title: 'Profil',
        href: '/profile',
        icon: Settings,
        description: 'Gérer vos paramètres de compte',
    },
] as const;

// Secondary navigation items - simplified
export const secondaryNavItems = [] as const;

// User menu items (dropdown in header) - simplified
export const userMenuItems = [
    {
        title: 'Profil',
        href: '/profile',
        icon: Settings,
    },
    {
        separator: true,
    },
    {
        title: 'Déconnexion',
        href: '/logout',
        icon: LogOut,
        variant: 'destructive' as const,
    },
] as const;

// Breadcrumb configuration
export const breadcrumbLabels: Record<string, string> = {
    '/upload': 'Upload Documents',
    '/profile': 'Profile Settings',
    '/settings': 'Settings',
    '/help': 'Help & Support',
    '/review': 'Review Classifications',
} as const;

// Footer navigation links
export const footerLinks = [
    {
        title: 'About',
        href: '/about',
        description: 'Learn more about our document classification system',
    },
    {
        title: 'Privacy Policy',
        href: '/privacy',
        description: 'How we protect your data and privacy',
    },
    {
        title: 'Terms of Service',
        href: '/terms',
        description: 'Terms and conditions for using our service',
    },
    {
        title: 'Contact',
        href: '/contact',
        description: 'Get in touch with our team',
    },
] as const;

// Quick action items for upload page
export const quickActions = [
    {
        title: 'Upload Documents',
        href: '/upload',
        icon: Upload,
        description: 'Start a new classification',
        color: 'primary' as const,
    },
    {
        title: 'Review Pending',
        href: '/review',
        icon: FileText,
        description: 'Review classification results',
        color: 'outline' as const,
    },
] as const;

// Mobile navigation (for responsive design)
export const mobileNavItems = [
    ...mainNavItems,
    {
        title: 'Profile',
        href: '/profile',
        icon: Settings,
    },
] as const;

// Navigation groups for organization
export const navGroups = {
    main: {
        title: 'Main',
        items: mainNavItems,
    },
    manage: {
        title: 'Manage',
        items: secondaryNavItems,
    },
} as const;

// Route access permissions (for role-based access control)
export const routePermissions: Record<string, string[]> = {
    '/upload': ['user', 'admin'],
    '/review': ['user', 'admin'],
    '/profile': ['user', 'admin'],
    '/admin': ['admin'],
    '/settings': ['admin'],
} as const;

// Default redirect paths based on user role - redirect to upload for SaaS interface
export const defaultRedirects: Record<string, string> = {
    user: '/upload',
    admin: '/upload',
    guest: '/login',
} as const;

// External links configuration
export const externalLinks = {
    documentation: 'https://docs.classifier.app',
    support: 'https://support.classifier.app',
    blog: 'https://blog.classifier.app',
    github: 'https://github.com/classifier/app',
    twitter: 'https://twitter.com/classifier',
    linkedin: 'https://linkedin.com/company/classifier',
} as const;

// Navigation analytics tracking
export const navAnalytics = {
    trackPageViews: true,
    trackClicks: true,
    trackTimeOnPage: false,
    trackScrollDepth: false,
} as const;