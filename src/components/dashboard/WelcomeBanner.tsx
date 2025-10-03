'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, TrendingUp, Clock } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/**
 * Welcome banner component for the dashboard
 */

interface WelcomeBannerProps {
    userName?: string;
    userStats?: {
        totalClassifications: number;
        totalDocuments: number;
        recentActivity: number;
        lastLogin?: Date;
    };
    onQuickAction?: (action: string) => void;
    className?: string;
}

export function WelcomeBanner({
    userName = 'User',
    userStats,
    onQuickAction,
    className,
}: WelcomeBannerProps) {
    const currentHour = new Date().getHours();
    const getGreeting = () => {
        if (currentHour < 12) return 'Good morning';
        if (currentHour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const handleQuickAction = (action: string) => {
        onQuickAction?.(action);
    };

    return (
        <Card className={cn('bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200', className)}>
            <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Welcome message */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {getGreeting()}, {userName}!
                            </h1>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                Welcome back
                            </Badge>
                        </div>
                        <p className="text-gray-600">
                            Ready to organize and classify your documents? Let's get started!
                        </p>

                        {/* User stats */}
                        {userStats && (
                            <div className="flex flex-wrap gap-4 pt-2">
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <FileText className="w-4 h-4" />
                                    <span>{userStats.totalClassifications} classifications</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <Upload className="w-4 h-4" />
                                    <span>{userStats.totalDocuments} documents</span>
                                </div>
                                {userStats.recentActivity > 0 && (
                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                        <TrendingUp className="w-4 h-4" />
                                        <span>{userStats.recentActivity} recent</span>
                                    </div>
                                )}
                                {userStats.lastLogin && (
                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                        <Clock className="w-4 h-4" />
                                        <span>
                                            Last login: {userStats.lastLogin.toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Quick actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            onClick={() => handleQuickAction('upload')}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Documents
                        </Button>
                    </div>
                </div>

                {/* Motivational message or tips */}
                <div className="mt-4 p-3 bg-white/50 rounded-lg border border-blue-100">
                    <p className="text-sm text-blue-800">
                        💡 <strong>Tip:</strong> Upload multiple documents at once for faster processing.
                        Our AI classifier will automatically organize them into relevant categories.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * Compact welcome header for smaller spaces
 */
interface CompactWelcomeHeaderProps {
    userName?: string;
    onQuickAction?: (action: string) => void;
    className?: string;
}

export function CompactWelcomeHeader({
    userName = 'User',
    onQuickAction,
    className,
}: CompactWelcomeHeaderProps) {
    const currentHour = new Date().getHours();
    const getGreeting = () => {
        if (currentHour < 12) return 'Morning';
        if (currentHour < 18) return 'Afternoon';
        return 'Evening';
    };

    return (
        <div className={cn('flex items-center justify-between', className)}>
            <div>
                <h2 className="text-lg font-semibold text-gray-900">
                    {getGreeting()}, {userName}
                </h2>
                <p className="text-sm text-gray-600">
                    Welcome back to your document classifier
                </p>
            </div>
            <Button
                size="sm"
                onClick={() => onQuickAction?.('upload')}
                className="bg-blue-600 hover:bg-blue-700"
            >
                <Upload className="w-4 h-4 mr-1" />
                Upload
            </Button>
        </div>
    );
}

/**
 * Stats overview cards for dashboard
 */
interface StatsOverviewProps {
    stats: {
        totalClassifications: number;
        totalDocuments: number;
        processingCount: number;
        completedToday: number;
    };
    className?: string;
}

export function StatsOverview({ stats, className }: StatsOverviewProps) {
    const statCards = [
        {
            title: 'Total Classifications',
            value: stats.totalClassifications.toLocaleString(),
            icon: FileText,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            title: 'Total Documents',
            value: stats.totalDocuments.toLocaleString(),
            icon: Upload,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            title: 'Processing',
            value: stats.processingCount.toLocaleString(),
            icon: Clock,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
        },
        {
            title: 'Completed Today',
            value: stats.completedToday.toLocaleString(),
            icon: TrendingUp,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
        },
    ];

    return (
        <div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-4', className)}>
            {statCards.map((stat) => {
                const IconComponent = stat.icon;
                return (
                    <Card key={stat.title} className="p-4">
                        <div className="flex items-center gap-3">
                            <div className={cn('p-2 rounded-lg', stat.bgColor)}>
                                <IconComponent className={cn('w-5 h-5', stat.color)} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    {stat.title}
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stat.value}
                                </p>
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}