'use client';

import { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Search,
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
    Filter,
    ChevronLeft,
    ChevronRight,
    CreditCard
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Member, MemberStatus, Filiere } from '@/types/member';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';

export default function MemberTable() {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterFiliere, setFilterFiliere] = useState<string>('all');
    const [filterStatut, setFilterStatut] = useState<string>('all');
    const [total, setTotal] = useState(0);
    const router = useRouter();

    useEffect(() => {
        loadMembers();
    }, [filterFiliere, filterStatut]);

    const loadMembers = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (filterFiliere !== 'all') params.filiere = filterFiliere;
            if (filterStatut !== 'all') params.statut = filterStatut;

            const data = await apiClient.getMembers(params);
            setMembers(data.members);
            setTotal(data.total);
        } catch (error) {
            console.error('Failed to load members:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredMembers = members.filter(member =>
        member.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.numero_membre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case MemberStatus.ACTIF:
                return <Badge className="bg-success/10 text-success border-none shadow-soft px-3 py-1 font-bold">Actif</Badge>;
            case MemberStatus.INACTIF:
                return <Badge variant="secondary" className="bg-gray-100 text-gray-500 border-none px-3 py-1 font-bold">Inactif</Badge>;
            case MemberStatus.SUSPENDU:
                return <Badge variant="destructive" className="bg-error/10 text-error border-none px-3 py-1 font-bold">Suspendu</Badge>;
            default:
                return <Badge variant="outline" className="px-3 py-1 font-bold uppercase text-[10px]">{status}</Badge>;
        }
    };

    const handleGenerateCard = async (memberId: string) => {
        try {
            await apiClient.generateCard(memberId, true);
            alert('Carte générée avec succès !');
        } catch (error) {
            console.error('Error generating card:', error);
            alert('Erreur lors de la génération de la carte.');
        }
    };

    return (
        <div className="space-y-8">
            {/* Filters and Search */}
            <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-gray-100">
                <div className="relative w-full lg:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Rechercher par nom ou numéro..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 h-12 border-gray-200 focus:ring-primary rounded-xl bg-white/80 transition-all font-medium"
                    />
                </div>

                <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                    <Select value={filterFiliere} onValueChange={setFilterFiliere}>
                        <SelectTrigger className="w-full sm:w-[200px] h-12 rounded-xl border-gray-200 bg-white/80 font-bold transition-all">
                            <div className="flex items-center">
                                <Filter className="w-4 h-4 mr-2 text-primary" />
                                <SelectValue placeholder="Filière" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl shadow-dramatic border-gray-100">
                            <SelectItem value="all" className="font-bold">Toutes les filières</SelectItem>
                            {Object.values(Filiere).map((f) => (
                                <SelectItem key={f} value={f} className="font-medium">{f}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={filterStatut} onValueChange={setFilterStatut}>
                        <SelectTrigger className="w-full sm:w-[180px] h-12 rounded-xl border-gray-200 bg-white/80 font-bold transition-all">
                            <SelectValue placeholder="Statut" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl shadow-dramatic border-gray-100">
                            <SelectItem value="all" className="font-bold">Tous les statuts</SelectItem>
                            {Object.values(MemberStatus).map((s) => (
                                <SelectItem key={s} value={s} className="font-medium">{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table Container with horizontal scroll */}
            <div className="rounded-3xl border border-gray-100 bg-white/50 backdrop-blur-sm overflow-hidden overflow-x-auto shadow-medium">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow className="hover:bg-transparent border-gray-100 italic">
                            <TableHead className="w-[140px] font-black uppercase tracking-widest text-[10px] py-6 pl-8">ID Digital</TableHead>
                            <TableHead className="font-black uppercase tracking-widest text-[10px] py-6">Adhérent</TableHead>
                            <TableHead className="font-black uppercase tracking-widest text-[10px] py-6">Spécialisation</TableHead>
                            <TableHead className="font-black uppercase tracking-widest text-[10px] py-6">Niveau</TableHead>
                            <TableHead className="font-black uppercase tracking-widest text-[10px] py-6">État</TableHead>
                            <TableHead className="text-right font-black uppercase tracking-widest text-[10px] py-6 pr-8">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    Chargement des membres...
                                </TableCell>
                            </TableRow>
                        ) : filteredMembers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    Aucun membre trouvé.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredMembers.map((member) => (
                                <TableRow key={member.id} className="group hover:bg-primary/5 transition-colors border-gray-50">
                                    <TableCell className="font-black text-gray-900 py-6 pl-8 tracking-tighter">
                                        #{member.numero_membre}
                                    </TableCell>
                                    <TableCell className="py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white font-black text-sm shadow-soft">
                                                {member.prenom[0]}{member.nom[0]}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 leading-tight">{`${member.prenom} ${member.nom}`}</span>
                                                <span className="text-xs text-gray-500 font-medium">{member.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-6">
                                        <Badge variant="outline" className="border-gray-200 text-gray-600 font-bold bg-white">{member.filiere}</Badge>
                                    </TableCell>
                                    <TableCell className="py-6">
                                        <span className="font-black text-primary bg-primary/5 px-2 py-1 rounded-lg text-xs">{member.niveau}</span>
                                    </TableCell>
                                    <TableCell className="py-6">{getStatusBadge(member.statut)}</TableCell>
                                    <TableCell className="text-right py-6 pr-8">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl opacity-0 group-hover:opacity-100 group-hover:bg-white transition-all shadow-soft border border-gray-100">
                                                    <MoreHorizontal className="h-5 w-5 text-gray-600" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-dramatic border-gray-100">
                                                <DropdownMenuLabel className="px-4 py-2 text-[10px] font-black uppercase text-gray-400">Options</DropdownMenuLabel>
                                                <DropdownMenuItem className="rounded-xl py-3 px-4 cursor-pointer" onClick={() => router.push(`/card/${member.id}`)}>
                                                    <Eye className="mr-3 h-4 w-4 text-primary" />
                                                    <span className="font-bold">Consulter la carte</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="rounded-xl py-3 px-4 cursor-pointer" onClick={() => handleGenerateCard(member.id)}>
                                                    <CreditCard className="mr-3 h-4 w-4 text-secondary" />
                                                    <span className="font-bold">Régénérer</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="my-2 bg-gray-50" />
                                                <DropdownMenuItem className="rounded-xl py-3 px-4 text-blue-600 cursor-pointer">
                                                    <Edit className="mr-3 h-4 w-4" />
                                                    <span className="font-bold">Modifier</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="rounded-xl py-3 px-4 text-red-600 cursor-pointer">
                                                    <Trash2 className="mr-3 h-4 w-4" />
                                                    <span className="font-bold">Supprimer</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-soft">
                <div className="text-sm font-bold text-gray-500">
                    <span className="text-primary">{total}</span> membres enregistrés
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" size="sm" disabled className="h-10 w-10 p-0 rounded-xl border-2 border-gray-50 flex items-center justify-center">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button variant="outline" size="sm" disabled className="h-10 w-10 p-0 rounded-xl border-2 border-gray-50 flex items-center justify-center">
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
