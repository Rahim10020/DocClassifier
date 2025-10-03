'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Simple tooltip component without external dependencies
 * Provides contextual information on hover/focus
 */

interface TooltipProps {
    children: React.ReactNode;
    content: string;
    side?: 'top' | 'right' | 'bottom' | 'left';
    className?: string;
    delay?: number;
}

interface TooltipContentProps {
    content: string;
    position: { top: number; left: number };
    side: 'top' | 'right' | 'bottom' | 'left';
}

function TooltipContent({ content, position, side }: TooltipContentProps) {
    const sideStyles = {
        top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
        right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
        bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    };

    return (
        <div
            className={cn(
                'absolute z-50 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg whitespace-nowrap',
                sideStyles[side]
            )}
            style={{
                top: position.top,
                left: position.left,
            }}
        >
            {content}
            <div
                className={cn(
                    'absolute w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900',
                    side === 'top' && 'top-full left-1/2 transform -translate-x-1/2 -mt-1',
                    side === 'bottom' && 'bottom-full left-1/2 transform -translate-x-1/2 -mb-1 rotate-180',
                    side === 'left' && 'left-full top-1/2 transform -translate-y-1/2 -ml-1 rotate-90',
                    side === 'right' && 'right-full top-1/2 transform -translate-y-1/2 -mr-1 -rotate-90'
                )}
            />
        </div>
    );
}

export function Tooltip({
    children,
    content,
    side = 'top',
    className,
    delay = 300
}: TooltipProps) {
    const [isVisible, setIsVisible] = React.useState(false);
    const [position, setPosition] = React.useState({ top: 0, left: 0 });
    const triggerRef = React.useRef<HTMLDivElement>(null);
    const tooltipRef = React.useRef<HTMLDivElement>(null);
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = React.useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPosition({
                top: rect.top + window.scrollY,
                left: rect.left + window.scrollX,
            });
        }

        timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
        }, delay);
    }, [delay]);

    const handleMouseLeave = React.useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsVisible(false);
    }, []);

    React.useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (
        <div className={cn('relative inline-block', className)}>
            <div
                ref={triggerRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="inline-block"
            >
                {children}
            </div>
            {isVisible && (
                <TooltipContent
                    content={content}
                    position={position}
                    side={side}
                />
            )}
        </div>
    );
}

/**
 * Convenient wrapper component for tooltips
 */
export function TooltipWrapper({
    children,
    content,
    side = 'top',
    className,
    delay = 300,
}: TooltipProps) {
    return (
        <Tooltip
            content={content}
            side={side}
            delay={delay}
            className={className}
        >
            {children}
        </Tooltip>
    );
}