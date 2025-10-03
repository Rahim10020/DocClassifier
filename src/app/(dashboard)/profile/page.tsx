import ProfileForm from '@/components/profile/ProfileForm';
import PasswordForm from '@/components/profile/PasswordForm';
import DeleteAccount from '@/components/profile/DeleteAccount';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Lock, Trash2 } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { getUserById } from '@/lib/db/queries/users';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        notFound();
    }

    const user = await getUserById(session.user.id);
    if (!user) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* En-tête */}
            <div className="flex items-center space-x-4">
                <Link href="/upload">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour au téléchargement
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">Paramètres du profil</h1>
                    <p className="text-muted-foreground">Gérez vos informations personnelles</p>
                </div>
            </div>

            {/* Informations du profil */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <User className="h-5 w-5" />
                        <span>Informations personnelles</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ProfileForm user={user} />
                </CardContent>
            </Card>

            {/* Sécurité */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Lock className="h-5 w-5" />
                        <span>Sécurité</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="text-lg font-medium mb-2">Changer le mot de passe</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Assurez-vous d'utiliser un mot de passe fort et unique.
                        </p>
                        <PasswordForm />
                    </div>

                    <div className="border-t pt-6">
                        <h3 className="text-lg font-medium mb-2 text-destructive">Zone de danger</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Cette action est irréversible. Toutes vos données seront supprimées définitivement.
                        </p>
                        <DeleteAccount userEmail={user.email} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}