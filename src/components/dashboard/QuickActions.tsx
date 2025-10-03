'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Upload,
    FileText,
    History,
    Settings,
    Download,
    Trash2,
    Edit,
    Eye,
    Plus,
    Search,
    Filter,
    MoreVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { TooltipWrapper } from '@/components/ui/tooltip';
import { quickActions } from '@/config/nav';

/**
 * Quick actions component for dashboard
 */

interface QuickActionsProps {
    onAction?: (action: string) => void;
    className?: string;
    variant?: 'grid' | 'list';
    maxActions?: number;
}

export function QuickActions({
    onAction,
    className,
    variant = 'grid',
    maxActions = 6,
}: QuickActionsProps) {
    const handleAction = (action: string) => {
        onAction?.(action);
    };

    const displayActions = quickActions.slice(0, maxActions);

    if (variant === 'list') {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Quick Actions
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {displayActions.map((action) => (
                        <Button
                            key={action.href}
                            variant="ghost"
                            className="w-full justify-start h-auto p-3"
                            onClick={() => handleAction(action.href)}
                        >
                            <action.icon className="w-4 h-4 mr-3 text-gray-600" />
                            <div className="text-left">
                                <div className="font-medium">{action.title}</div>
                                <div className="text-sm text-gray-500">
                                    {action.description}
                                </div>
                            </div>
                        </Button>
                    ))}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Quick Actions
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {displayActions.map((action) => (
                        <TooltipWrapper
                            key={action.href}
                            content={action.description}
                        >
                            <Button
                                variant="outline"
                                className={cn(
                                    'h-auto p-4 flex flex-col items-center gap-2 transition-all hover:scale-105',
                                    action.color === 'primary' && 'bg-blue-50 border-blue-200 hover:bg-blue-100',
                                    action.color === 'secondary' && 'bg-green-50 border-green-200 hover:bg-green-100',
                                    action.color === 'outline' && 'hover:bg-gray-50'
                                )}
                                onClick={() => handleAction(action.href)}
                            >
                                <action.icon className="w-6 h-6" />
                                <span className="text-sm font-medium">
                                    {action.title}
                                </span>
                            </Button>
                        </TooltipWrapper>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * Action button component for individual actions
 */
interface ActionButtonProps {
    icon: React.ElementType;
    label: string;
    description?: string;
    onClick?: () => void;
    variant?: 'default' | 'primary' | 'secondary' | 'destructive';
    disabled?: boolean;
    loading?: boolean;
    badge?: string | number;
    className?: string;
}

export function ActionButton({
    icon: Icon,
    label,
    description,
    onClick,
    variant = 'default',
    disabled = false,
    loading = false,
    badge,
    className,
}: ActionButtonProps) {
    const variantClasses = {
        default: 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700',
        primary: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600',
        secondary: 'bg-green-600 hover:bg-green-700 text-white border-green-600',
        destructive: 'bg-red-600 hover:bg-red-700 text-white border-red-600',
    };

    return (
        <TooltipWrapper content={description || label}>
            <Button
                variant="outline"
                className={cn(
                    'relative h-auto p-3 flex flex-col items-center gap-2 transition-all',
                    variantClasses[variant],
                    disabled && 'opacity-50 cursor-not-allowed',
                    !disabled && 'hover:scale-105',
                    className
                )}
                onClick={onClick}
                disabled={disabled || loading}
            >
                {loading ? (
                    <div className="w-5 h-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                    <Icon className="w-5 h-5" />
                )}
                <span className="text-sm font-medium">{label}</span>
                {badge && (
                    <Badge
                        variant={variant === 'primary' ? 'secondary' : 'outline'}
                        className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
                    >
                        {badge}
                    </Badge>
                )}
            </Button>
        </TooltipWrapper>
    );
}

/**
 * Action toolbar for common operations
 */
interface ActionToolbarProps {
    actions: Array<{
        id: string;
        icon: React.ElementType;
        label: string;
        onClick: () => void;
        disabled?: boolean;
        variant?: 'default' | 'primary' | 'secondary' | 'destructive';
    }>;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export function ActionToolbar({
    actions,
    className,
    size = 'md',
}: ActionToolbarProps) {
    const sizeClasses = {
        sm: 'p-2',
        md: 'p-3',
        lg: 'p-4',
    };

    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    };

    return (
        <div className={cn('flex items-center gap-1 p-2 bg-gray-50 rounded-lg', className)}>
            {actions.map((action) => (
                <TooltipWrapper key={action.id} content={action.label}>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            sizeClasses[size],
                            'hover:bg-white',
                            action.disabled && 'opacity-50 cursor-not-allowed'
                        )}
                        onClick={action.onClick}
                        disabled={action.disabled}
                    >
                        <action.icon className={iconSizes[size]} />
                    </Button>
                </TooltipWrapper>
            ))}
        </div>
    );
}

/**
 * Floating action button for primary actions
 */
interface FloatingActionButtonProps {
    icon: React.ElementType;
    label: string;
    onClick: () => void;
    className?: string;
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export function FloatingActionButton({
    icon: Icon,
    label,
    onClick,
    className,
    position = 'bottom-right',
}: FloatingActionButtonProps) {
    const positionClasses = {
        'bottom-right': 'bottom-6 right-6',
        'bottom-left': 'bottom-6 left-6',
        'top-right': 'top-6 right-6',
        'top-left': 'top-6 left-6',
    };

    return (
        <TooltipWrapper content={label}>
            <Button
                className={cn(
                    'fixed z-40 w-14 h-14 rounded-full shadow-lg hover:scale-110 transition-all',
                    'bg-blue-600 hover:bg-blue-700 text-white',
                    positionClasses[position],
                    className
                )}
                onClick={onClick}
            >
                <Icon className="w-6 h-6" />
            </Button>
        </TooltipWrapper>
    );
}