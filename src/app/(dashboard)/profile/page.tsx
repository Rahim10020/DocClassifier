import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileForm from '@/components/profile/ProfileForm';
import PasswordForm from '@/components/profile/PasswordForm';
import UserStats from '@/components/profile/UserStats';
import DeleteAccount from '@/components/profile/DeleteAccount';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth.config';
import { getUserById } from '@/lib/db/queries/users';
import { notFound } from 'next/navigation';

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
        <div className="p-6">
            <Tabs defaultValue="profile" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="profile">Profil</TabsTrigger>
                    <TabsTrigger value="security">Sécurité</TabsTrigger>
                    <TabsTrigger value="stats">Statistiques</TabsTrigger>
                </TabsList>
                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>Modifier le profil</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ProfileForm user={user} />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle>Changer le mot de passe</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <PasswordForm />
                        </CardContent>
                    </Card>
                    <Card className="mt-4">
                        <CardHeader>
                            <CardTitle>Supprimer le compte</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DeleteAccount userEmail={user.email} />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="stats">
                    <Card>
                        <CardHeader>
                            <CardTitle>Statistiques personnelles</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <UserStats userId={user.id} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}