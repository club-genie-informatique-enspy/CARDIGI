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
    ChevronRight
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
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Actif</Badge>;
            case MemberStatus.INACTIF:
                return <Badge variant="secondary">Inactif</Badge>;
            case MemberStatus.SUSPENDU:
                return <Badge variant="destructive">Suspendu</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
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
        <div className="space-y-4">
            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Rechercher un membre (nom, numéro)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <Select value={filterFiliere} onValueChange={setFilterFiliere}>
                        <SelectTrigger className="w-[180px]">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Filière" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Toutes les filières</SelectItem>
                            {Object.values(Filiere).map((f) => (
                                <SelectItem key={f} value={f}>{f}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={filterStatut} onValueChange={setFilterStatut}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Statut" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les statuts</SelectItem>
                            {Object.values(MemberStatus).map((s) => (
                                <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table Container with horizontal scroll */}
            <div className="rounded-md border bg-white overflow-hidden overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">N° Membre</TableHead>
                            <TableHead>Nom complet</TableHead>
                            <TableHead>Filière</TableHead>
                            <TableHead>Niveau</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
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
                                <TableRow key={member.id}>
                                    <TableCell className="font-medium">{member.numero_membre}</TableCell>
                                    <TableCell>{`${member.prenom} ${member.nom}`}</TableCell>
                                    <TableCell>{member.filiere}</TableCell>
                                    <TableCell>{member.niveau}</TableCell>
                                    <TableCell>{getStatusBadge(member.statut)}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => router.push(`/card/${member.id}`)}>
                                                    <Eye className="mr-2 h-4 w-4" /> Voir la carte
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleGenerateCard(member.id)}>
                                                    <CreditCard className="mr-2 h-4 w-4" /> Générer la carte
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-blue-600">
                                                    <Edit className="mr-2 h-4 w-4" /> Modifier (Bientôt)
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Supprimer (Bientôt)
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

            {/* Pagination (Simulated) */}
            <div className="flex items-center justify-between px-2">
                <div className="text-sm text-gray-500">
                    Total : {total} membres
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
