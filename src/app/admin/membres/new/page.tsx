'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import { Filiere, Niveau } from '@/types/member';

export default function CreateMemberPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        filiere: '',
        niveau: '',
        password: 'ChangeMe123!' // Default password
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await apiClient.register({
                ...formData,
                filiere: formData.filiere as Filiere,
                niveau: formData.niveau as Niveau
            });

            toast({
                title: "Membre créé avec succès",
                description: `${formData.prenom} ${formData.nom} a été ajouté.`,
            });

            router.push('/admin');
        } catch (error: any) {
            toast({
                title: "Erreur lors de la création",
                description: error.message || "Une erreur est survenue.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mb-6 pl-0 hover:bg-transparent hover:text-blue-600"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour au tableau de bord
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>Ajouter un nouveau membre</CardTitle>
                    <CardDescription>
                        Créez un compte pour un nouvel adhérent. Il pourra ensuite se connecter avec ces identifiants.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nom">Nom</Label>
                                <Input
                                    id="nom"
                                    name="nom"
                                    placeholder="ex: AZANGUE"
                                    required
                                    value={formData.nom}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="prenom">Prénom</Label>
                                <Input
                                    id="prenom"
                                    name="prenom"
                                    placeholder="ex: DELMAT"
                                    required
                                    value={formData.prenom}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Universitaire</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="prenom.nom@enspy.cm"
                                required
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="telephone">Téléphone</Label>
                            <Input
                                id="telephone"
                                name="telephone"
                                placeholder="694773472"
                                required
                                value={formData.telephone}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="filiere">Filière</Label>
                                <Select
                                    name="filiere"
                                    onValueChange={(val:any) => handleSelectChange('filiere', val)}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.values(Filiere).map((f) => (
                                            <SelectItem key={f} value={f}>{f}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="niveau">Niveau</Label>
                                <Select
                                    name="niveau"
                                    onValueChange={(val:any) => handleSelectChange('niveau', val)}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.values(Niveau).map((n) => (
                                            <SelectItem key={n} value={n}>{n}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2 pt-4 border-t">
                            <Label htmlFor="password">Mot de passe provisoire</Label>
                            <Input
                                id="password"
                                name="password"
                                type="text"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Mot de passe"
                                required
                            />
                            <p className="text-xs text-gray-500">
                                Communiquez ce mot de passe à l'adhérent pour sa première connexion.
                            </p>
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Création en cours...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Créer le membre
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
