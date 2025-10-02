import Breadcrumb from '@/components/layout/Breadcrumb';
import UserMenu from '@/components/layout/UserMenu';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils/cn';

export default function Header() {
    return (
        <header className="glass-card p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <Breadcrumb />
            </div>
            <div className="flex items-center space-x-4">
                <div className="relative hidden md:block">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-8 w-64" placeholder="Search..." />
                </div>
                <UserMenu />
            </div>
        </header>
    );
}