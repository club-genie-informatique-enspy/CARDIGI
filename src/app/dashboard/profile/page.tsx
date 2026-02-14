'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Niveau, Cellule, Filiere } from '@/types/member';
import { Loader2, ArrowLeft, Save, User as UserIcon } from 'lucide-react';

export default function ProfilePage() {
    const { user, isAuthenticated, refreshUser } = useAuth();
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        telephone: '',
        photo_url: '',
        filiere: '' as string,
        cellule: '' as Cellule | '',
        niveau: '' as Niveau | ''
    });

    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const router = useRouter();
    const { toast } = useToast();

    // Helper pour résoudre l'URL de la photo (identique à CardRecto)
    const resolvePhotoUrl = (url: string | null | undefined) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        let apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl || apiUrl.trim() === '') {
            apiUrl = 'http://localhost:8000';
        } else {
            apiUrl = apiUrl.trim();
        }
        const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
        const path = url.startsWith('/') ? url : `/${url}`;
        return `${baseUrl}${path}`;
    };

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        if (user) {
            setFormData({
                nom: user.nom || '',
                prenom: user.prenom || '',
                telephone: user.telephone || '',
                photo_url: user.photo_url || '',
                filiere: user.filiere || '',
                cellule: (user.cellule as Cellule) || '',
                niveau: (user.niveau as Niveau) || ''
            });
        }
    }, [user, isAuthenticated, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation basique
        if (!file.type.startsWith('image/')) {
            toast({
                title: 'Erreur',
                description: 'Veuillez sélectionner une image (JPEG, PNG).',
                variant: 'destructive',
            });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: 'Erreur',
                description: 'L\'image est trop volumineuse (max 5Mo).',
                variant: 'destructive',
            });
            return;
        }

        setIsUploading(true);
        try {
            const result = await apiClient.uploadPhoto(file);
            setFormData(prev => ({ ...prev, photo_url: result.photo_url }));

            // On peut aussi rafraîchir l'utilisateur pour que le header se mette à jour
            await refreshUser();

            toast({
                title: 'Photo téléchargée',
                description: 'Votre photo a été mise à jour avec succès.',
            });
        } catch (err: any) {
            console.error('Upload error:', err);
            toast({
                title: 'Erreur d\'upload',
                description: err.message || 'Impossible de télécharger la photo',
                variant: 'destructive',
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            await apiClient.updateProfile(formData as any);

            // Mettre à jour l'utilisateur dans le contexte
            await refreshUser();

            toast({
                title: 'Profil mis à jour',
                description: 'Vos modifications ont été enregistrées avec succès.',
            });

            router.push('/dashboard');
        } catch (err: any) {
            console.error('Update profile error:', err);
            toast({
                title: 'Erreur',
                description: err.message || 'Impossible de mettre à jour le profil',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) return null;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Retour
                </Button>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-6">
                            <div className="relative group">
                                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-blue-200 shadow-inner">
                                    {formData.photo_url ? (
                                        <img
                                            src={resolvePhotoUrl(formData.photo_url) || ''}
                                            alt="Photo de profil"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <UserIcon className="w-12 h-12 text-blue-600" />
                                    )}
                                    {isUploading && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <label
                                    htmlFor="photo-upload"
                                    className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow-md border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                                >
                                    <Save className="w-4 h-4 text-gray-600" />
                                    <input
                                        id="photo-upload"
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        disabled={isUploading || isSaving}
                                    />
                                </label>
                            </div>
                            <div className="flex-1">
                                <CardTitle className="text-2xl">Mon Profil</CardTitle>
                                <CardDescription>
                                    {user.prenom} {user.nom} - {user.numero_membre}
                                </CardDescription>
                                <p className="text-xs text-blue-600 mt-2 font-medium">
                                    Cliquez sur l'icône de sauvegarde pour changer votre photo
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email (Non modifiable)</Label>
                                    <Input id="email" value={user.email} disabled className="bg-gray-50 text-gray-500" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="telephone">Téléphone</Label>
                                    <Input
                                        id="telephone"
                                        value={formData.telephone}
                                        onChange={handleChange}
                                        disabled={isSaving || isUploading}
                                        placeholder="+237 ..."
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nom">Nom</Label>
                                    <Input
                                        id="nom"
                                        value={formData.nom}
                                        onChange={handleChange}
                                        disabled={isSaving || isUploading}
                                        placeholder="Votre nom"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="prenom">Prénom</Label>
                                    <Input
                                        id="prenom"
                                        value={formData.prenom}
                                        onChange={handleChange}
                                        disabled={isSaving || isUploading}
                                        placeholder="Votre prénom"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Filière</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.filiere}
                                        onChange={(e) => handleSelectChange('filiere', e.target.value)}
                                        disabled={isSaving || isUploading}
                                    >
                                        <option value="">Votre filière</option>
                                        {Object.values(Filiere).map(f => (
                                            <option key={f} value={f}>{f}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Niveau</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.niveau}
                                        onChange={(e) => handleSelectChange('niveau', e.target.value)}
                                        disabled={isSaving || isUploading}
                                    >
                                        <option value="">Votre niveau</option>
                                        {Object.values(Niveau).map(n => (
                                            <option key={n} value={n}>{n}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2 md:col-start-2">
                                    <Label>Cellule</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.cellule}
                                        onChange={(e) => handleSelectChange('cellule', e.target.value)}
                                        disabled={isSaving || isUploading}
                                    >
                                        <option value="">Votre cellule</option>
                                        {Object.values(Cellule).map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSaving || isUploading}>
                                {isSaving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Enregistrement...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Enregistrer les modifications
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
