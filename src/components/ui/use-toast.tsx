import toast from 'react-hot-toast';

export interface ToastProps {
    title?: string;
    description?: string;
    variant?: 'default' | 'destructive' | 'success';
}

export const useToast = () => {
    const showToast = ({ title, description, variant = 'default' }: ToastProps) => {
        const message = title ? (description ? `${title}: ${description}` : title) : description || '';

        switch (variant) {
            case 'success':
                return toast.success(message, {
                    duration: 3000,
                    style: {
                        background: 'rgba(34, 197, 94, 0.1)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        color: '#4ade80',
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                        fontSize: '14px',
                        fontWeight: '500',
                    },
                    iconTheme: {
                        primary: '#22c55e',
                        secondary: '#ffffff',
                    },
                });

            case 'destructive':
                return toast.error(message, {
                    duration: 5000,
                    style: {
                        background: 'rgba(239, 68, 68, 0.1)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#f87171',
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                        fontSize: '14px',
                        fontWeight: '500',
                    },
                    iconTheme: {
                        primary: '#ef4444',
                        secondary: '#ffffff',
                    },
                });

            default:
                return toast(message, {
                    duration: 4000,
                    style: {
                        background: 'rgba(30, 41, 59, 0.8)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        color: '#f1f5f9',
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                        fontSize: '14px',
                        fontWeight: '500',
                    },
                });
        }
    };

    return {
        toast: showToast,
    };
};

// Export pour compatibilité avec les composants existants
export { toast };