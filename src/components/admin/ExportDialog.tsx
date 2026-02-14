'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileDown, FileJson, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function ExportDialog() {
    const { toast } = useToast();
    const [exporting, setExporting] = useState(false);

    const handleExport = (format: string) => {
        setExporting(true);
        // Simulate export process
        setTimeout(() => {
            toast({
                title: "Export réussi",
                description: `La liste des membres a été exportée au format ${format}.`,
            });
            setExporting(false);
        }, 1500);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Exporter
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Exporter les données</DialogTitle>
                    <DialogDescription>
                        Choisissez le format d'exportation pour la liste des membres actuelle.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                    <Button
                        variant="outline"
                        className="flex-col h-24 gap-2"
                        onClick={() => handleExport('CSV')}
                        disabled={exporting}
                    >
                        <FileSpreadsheet className="w-8 h-8 text-green-600" />
                        <span>CSV (Excel)</span>
                    </Button>
                    <Button
                        variant="outline"
                        className="flex-col h-24 gap-2"
                        onClick={() => handleExport('PDF')}
                        disabled={exporting}
                    >
                        <FileDown className="w-8 h-8 text-red-600" />
                        <span>PDF</span>
                    </Button>
                    <Button
                        variant="outline"
                        className="flex-col h-24 gap-2"
                        onClick={() => handleExport('JSON')}
                        disabled={exporting}
                    >
                        <FileJson className="w-8 h-8 text-blue-600" />
                        <span>JSON</span>
                    </Button>
                    <Button
                        variant="outline"
                        className="flex-col h-24 gap-2"
                        onClick={() => handleExport('XML')}
                        disabled={exporting}
                    >
                        <FileDown className="w-8 h-8 text-orange-600" />
                        <span>XML</span>
                    </Button>
                </div>
                <DialogFooter>
                    <DialogDescription className="text-xs text-center w-full">
                        L'exportation inclura tous les membres correspondant aux filtres actuels.
                    </DialogDescription>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
