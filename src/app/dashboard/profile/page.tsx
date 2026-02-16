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
import { Badge } from '@/components/ui/badge';
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
                    className="mb-8 hover:bg-white/20 transition-all rounded-xl font-bold group"
                >
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Retour
                </Button>

                <Card className="border-none shadow-dramatic bg-white/95 backdrop-blur-md overflow-hidden animate-scale-in">
                    <CardHeader className="bg-primary/5 p-8 border-b border-primary/10">
                        <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                            <div className="relative group">
                                <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center overflow-hidden border-4 border-white shadow-strong transition-all duration-500 group-hover:scale-105 group-hover:rotate-3 rotate-1">
                                    {formData.photo_url ? (
                                        <img
                                            src={resolvePhotoUrl(formData.photo_url) || ''}
                                            alt="Photo de profil"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="gradient-primary w-full h-full flex items-center justify-center">
                                            <span className="text-4xl font-black text-white">
                                                {user?.prenom?.[0]}{user?.nom?.[0]}
                                            </span>
                                        </div>
                                    )}
                                    {isUploading && (
                                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                                            <Loader2 className="w-10 h-10 text-white animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <label
                                    htmlFor="photo-upload"
                                    className="absolute -bottom-2 -right-2 gradient-accent p-3 rounded-2xl shadow-strong border-2 border-white cursor-pointer hover:scale-110 transition-all"
                                >
                                    <Save className="w-5 h-5 text-accent-foreground" />
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
                            <div className="flex-1 space-y-2">
                                <CardTitle className="text-4xl font-black font-poppins text-gray-901 tracking-tight">Mon Profil</CardTitle>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                    <Badge variant="secondary" className="bg-primary/10 text-primary border-none px-3 py-1 font-bold">
                                        {user.numero_membre}
                                    </Badge>
                                    <p className="text-lg font-bold text-gray-500">
                                        {user.prenom} {user.nom}
                                    </p>
                                </div>
                                <p className="text-sm text-primary/70 font-bold uppercase tracking-widest mt-4">
                                    Cliquez sur la disquette pour changer votre photo
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-gray-400">Email (Lecture seule)</Label>
                                    <Input id="email" value={user.email} disabled className="h-12 bg-gray-50 border-gray-100 text-gray-500 rounded-xl" />
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="telephone" className="text-xs font-black uppercase tracking-widest text-gray-400">Téléphone</Label>
                                    <Input
                                        id="telephone"
                                        value={formData.telephone}
                                        onChange={handleChange}
                                        disabled={isSaving || isUploading}
                                        placeholder="+237 ..."
                                        className="h-12 border-gray-200 focus:ring-primary rounded-xl transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label htmlFor="nom" className="text-xs font-black uppercase tracking-widest text-gray-400">Nom</Label>
                                    <Input
                                        id="nom"
                                        value={formData.nom}
                                        onChange={handleChange}
                                        disabled={isSaving || isUploading}
                                        placeholder="Votre nom"
                                        className="h-12 border-gray-200 focus:ring-primary rounded-xl transition-all"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="prenom" className="text-xs font-black uppercase tracking-widest text-gray-400">Prénom</Label>
                                    <Input
                                        id="prenom"
                                        value={formData.prenom}
                                        onChange={handleChange}
                                        disabled={isSaving || isUploading}
                                        placeholder="Votre prénom"
                                        className="h-12 border-gray-200 focus:ring-primary rounded-xl transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Filière</Label>
                                    <select
                                        className="flex h-12 w-full rounded-xl border border-gray-200 bg-background px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all disabled:opacity-50"
                                        value={formData.filiere}
                                        onChange={(e) => handleSelectChange('filiere', e.target.value)}
                                        disabled={isSaving || isUploading}
                                    >
                                        <option value="">Sélectionnez votre filière</option>
                                        {Object.values(Filiere).map(f => (
                                            <option key={f} value={f}>{f}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Niveau</Label>
                                    <select
                                        className="flex h-12 w-full rounded-xl border border-gray-200 bg-background px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all disabled:opacity-50"
                                        value={formData.niveau}
                                        onChange={(e) => handleSelectChange('niveau', e.target.value)}
                                        disabled={isSaving || isUploading}
                                    >
                                        <option value="">Sélectionnez votre niveau</option>
                                        {Object.values(Niveau).map(n => (
                                            <option key={n} value={n}>{n}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-3 md:col-start-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Cellule</Label>
                                    <select
                                        className="flex h-12 w-full rounded-xl border border-gray-200 bg-background px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all disabled:opacity-50"
                                        value={formData.cellule}
                                        onChange={(e) => handleSelectChange('cellule', e.target.value)}
                                        disabled={isSaving || isUploading}
                                    >
                                        <option value="">Sélectionnez votre cellule</option>
                                        {Object.values(Cellule).map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-gray-100">
                                <Button type="submit" className="w-full gradient-primary h-14 text-lg font-bold shadow-medium hover-lift rounded-2xl transition-all" disabled={isSaving || isUploading}>
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                            Enregistrement en cours...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-3 h-5 w-5" />
                                            Mettre à jour mon profil
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
