'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, CameraOff, Loader2 } from 'lucide-react';

interface QRScannerProps {
    onScanSuccess: (decodedText: string) => void;
    onScanError?: (error: string) => void;
}

export default function QRScanner({ onScanSuccess, onScanError }: QRScannerProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const qrCodeRegionId = 'qr-reader';

    const startScanning = async () => {
        if (typeof window === 'undefined') return;

        setIsLoading(true);
        setError(null);

        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Votre navigateur ne supporte pas l\'accès à la caméra');
            }

            // Dispose of existing scanner if any
            if (scannerRef.current) {
                try {
                    await scannerRef.current.stop();
                } catch (e) {
                    console.warn('Error stopping previous scanner:', e);
                }
                scannerRef.current = null;
            }

            // Ensure the element exists in DOM
            const element = document.getElementById(qrCodeRegionId);
            if (!element) {
                throw new Error('Élément du scanner non trouvé dans le DOM');
            }

            scannerRef.current = new Html5Qrcode(qrCodeRegionId);

            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
            };

            await scannerRef.current.start(
                { facingMode: 'environment' },
                config,
                (decodedText) => {
                    onScanSuccess(decodedText);
                    stopScanning();
                },
                () => { } // Ignore scan errors
            );

            setIsScanning(true);
        } catch (err: any) {
            console.error('Scanner error:', err);
            let errorMsg = 'Impossible d\'accéder à la caméra';

            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                errorMsg = 'Permission refusée. Veuillez autoriser l\'accès dans les paramètres.';
            } else if (err.name === 'NotFoundError') {
                errorMsg = 'Aucune caméra détectée.';
            } else if (err.message) {
                errorMsg = err.message;
            }

            setError(errorMsg);
            onScanError?.(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const stopScanning = async () => {
        if (scannerRef.current) {
            try {
                if (scannerRef.current.isScanning) {
                    await scannerRef.current.stop();
                }
                setIsScanning(false);
            } catch (err) {
                console.error('Error stopping scanner:', err);
            }
        }
    };

    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                const scanner = scannerRef.current;
                if (scanner.isScanning) {
                    scanner.stop().catch(e => console.error('Cleanup stop error:', e));
                }
            }
        };
    }, []);

    return (
        <div className="space-y-4">
            {/* Scanner Region */}
            <div className="relative">
                <div
                    id={qrCodeRegionId}
                    className="rounded-lg overflow-hidden border-2 border-gray-200"
                    style={{ minHeight: isScanning ? 'auto' : '300px' }}
                >
                    {!isScanning && (
                        <div className="flex items-center justify-center h-[300px] bg-gray-100">
                            <div className="text-center">
                                <Camera className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-500">
                                    Cliquez sur "Démarrer" pour scanner
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Control Buttons */}
            <div className="flex gap-3">
                {!isScanning ? (
                    <Button
                        onClick={startScanning}
                        disabled={isLoading}
                        className="flex-1"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Initialisation...
                            </>
                        ) : (
                            <>
                                <Camera className="w-4 h-4 mr-2" />
                                Démarrer le scan
                            </>
                        )}
                    </Button>
                ) : (
                    <Button
                        onClick={stopScanning}
                        variant="destructive"
                        className="flex-1"
                    >
                        <CameraOff className="w-4 h-4 mr-2" />
                        Arrêter le scan
                    </Button>
                )}
            </div>

            {/* Instructions */}
            {isScanning && (
                <div className="text-sm text-gray-600 text-center">
                    <p>Positionnez le QR code dans le cadre</p>
                </div>
            )}
        </div>
    );
}
