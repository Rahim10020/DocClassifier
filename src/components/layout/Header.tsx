import Breadcrumb from '@/components/layout/Breadcrumb';
import UserMenu from '@/components/layout/UserMenu';
import { Search, Bell, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';

export default function Header() {
    return (
        <header className="sticky top-0 z-50 glass-card border-b border-border/40 backdrop-blur-xl">
            <div className="flex items-center justify-between px-6 py-4 max-w-full mx-auto">
                <div className="flex items-center space-x-6">
                    <Breadcrumb />
                </div>
                
                <div className="flex items-center space-x-4">
                    {/* Barre de recherche centrée */}
                    <div className="relative hidden lg:block">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            className="pl-10 pr-4 w-80 bg-background/50 border-border/50 focus:border-primary/50 transition-colors" 
                            placeholder="Rechercher des documents, classifications..."
                        />
                    </div>
                    
                    {/* Actions rapides */}
                    <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" className="relative">
                            <Bell className="h-4 w-4" />
                            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                                3
                            </Badge>
                        </Button>
                        
                        <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                        </Button>
                    </div>
                    
                    <UserMenu />
                </div>
            </div>
        </header>
    );
}