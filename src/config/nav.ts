import {
    LayoutDashboard,
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

// Main navigation items for the sidebar
export const mainNavItems = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        description: 'Overview of your classifications and recent activity',
    },
    {
        title: 'Upload',
        href: '/upload',
        icon: Upload,
        description: 'Upload new documents for classification',
    },
    {
        title: 'Review',
        href: '/review',
        icon: FileText,
        description: 'Review and validate classification results',
    },
] as const;

// Secondary navigation items (bottom of sidebar)
export const secondaryNavItems = [
    {
        title: 'Profile',
        href: '/profile',
        icon: Settings,
        description: 'Manage your account settings',
    },
    {
        title: 'Help & Support',
        href: '/help',
        icon: HelpCircle,
        description: 'Get help and contact support',
    },
] as const;

// User menu items (dropdown in header)
export const userMenuItems = [
    {
        title: 'Profile',
        href: '/profile',
        icon: Settings,
    },
    {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
    },
    {
        title: 'Help',
        href: '/help',
        icon: HelpCircle,
    },
    {
        separator: true,
    },
    {
        title: 'Sign Out',
        href: '/logout',
        icon: LogOut,
        variant: 'destructive' as const,
    },
] as const;

// Breadcrumb configuration
export const breadcrumbLabels: Record<string, string> = {
    '/dashboard': 'Dashboard',
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

// Quick action items for dashboard
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
    '/dashboard': ['user', 'admin'],
    '/upload': ['user', 'admin'],
    '/review': ['user', 'admin'],
    '/profile': ['user', 'admin'],
    '/admin': ['admin'],
    '/settings': ['admin'],
} as const;

// Default redirect paths based on user role
export const defaultRedirects: Record<string, string> = {
    user: '/dashboard',
    admin: '/dashboard',
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