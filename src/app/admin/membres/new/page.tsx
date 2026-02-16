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
        <div className="max-w-3xl mx-auto space-y-10 animate-fade-in">
            <Button
                variant="ghost"
                onClick={() => router.back()}
                className="hover:bg-white/20 transition-all rounded-xl font-bold group"
            >
                <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                Retour à la console
            </Button>

            <Card className="border-none shadow-dramatic bg-white/95 backdrop-blur-md overflow-hidden animate-scale-in">
                <CardHeader className="bg-primary/5 p-8 border-b border-primary/10">
                    <CardTitle className="text-3xl font-black font-poppins text-gray-901 tracking-tight">Nouveau Membre</CardTitle>
                    <CardDescription className="text-gray-500 font-medium">
                        Enregistrez un nouvel adhérent GI. Un compte digital sera automatiquement créé.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label htmlFor="nom" className="text-xs font-black uppercase tracking-widest text-gray-400">Nom</Label>
                                <Input
                                    id="nom"
                                    name="nom"
                                    placeholder="ex: AZANGUE"
                                    required
                                    value={formData.nom}
                                    onChange={handleChange}
                                    className="h-12 border-gray-200 focus:ring-primary rounded-xl transition-all"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="prenom" className="text-xs font-black uppercase tracking-widest text-gray-400">Prénom</Label>
                                <Input
                                    id="prenom"
                                    name="prenom"
                                    placeholder="ex: DELMAT"
                                    required
                                    value={formData.prenom}
                                    onChange={handleChange}
                                    className="h-12 border-gray-200 focus:ring-primary rounded-xl transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-gray-400">Email Universitaire</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="prenom.nom@enspy.cm"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="h-12 border-gray-200 focus:ring-primary rounded-xl transition-all"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="telephone" className="text-xs font-black uppercase tracking-widest text-gray-400">Téléphone</Label>
                                <Input
                                    id="telephone"
                                    name="telephone"
                                    placeholder="694773472"
                                    required
                                    value={formData.telephone}
                                    onChange={handleChange}
                                    className="h-12 border-gray-200 focus:ring-primary rounded-xl transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Filière</Label>
                                <Select
                                    name="filiere"
                                    value={formData.filiere}
                                    onValueChange={(val: any) => handleSelectChange('filiere', val)}
                                    required
                                >
                                    <SelectTrigger className="h-12 rounded-xl border-gray-200 bg-white font-bold transition-all">
                                        <SelectValue placeholder="Choisir la filière" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl shadow-dramatic border-gray-100">
                                        {Object.values(Filiere).map((f) => (
                                            <SelectItem key={f} value={f} className="font-medium">{f}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Niveau</Label>
                                <Select
                                    name="niveau"
                                    value={formData.niveau}
                                    onValueChange={(val: any) => handleSelectChange('niveau', val)}
                                    required
                                >
                                    <SelectTrigger className="h-12 rounded-xl border-gray-200 bg-white font-bold transition-all">
                                        <SelectValue placeholder="Choisir le niveau" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl shadow-dramatic border-gray-100">
                                        {Object.values(Niveau).map((n) => (
                                            <SelectItem key={n} value={n} className="font-medium">{n}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-4 pt-8 border-t border-gray-100">
                            <div className="space-y-3">
                                <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-primary">Mot de passe par défaut</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="text"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Mot de passe"
                                    required
                                    className="h-12 bg-primary/5 border-primary/20 text-primary font-bold rounded-xl"
                                />
                                <p className="text-xs text-gray-400 font-medium">
                                    L'adhérent devra modifier ce mot de passe dès sa première connexion.
                                </p>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button type="submit" className="w-full gradient-primary h-14 text-lg font-bold shadow-medium hover-lift rounded-2xl transition-all" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                        Finalisation de l'adhésion...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-3 h-5 w-5" />
                                        Confirmer l'inscription
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
