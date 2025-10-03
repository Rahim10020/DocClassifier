import { Button } from '@/components/ui/button';
import { Ghost } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex items-center justify-center h-screen bg-background">
            <div className="text-center">
                <Ghost className="w-32 h-32 mx-auto text-muted-foreground mb-4" />
                <h1 className="text-4xl font-bold mb-2">404 - Page not found</h1>
                <p className="text-muted-foreground mb-4">The page you are looking for does not exist or has been moved.</p>
                <Link href="/">
                    <Button className="bg-primary">Return to home</Button>
                </Link>
            </div>
        </div>
    );
}