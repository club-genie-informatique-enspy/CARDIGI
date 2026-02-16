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
        // Check if we're in a browser environment
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            setError('Le scanner n\'est pas disponible dans cet environnement');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Check if camera is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Votre navigateur ne supporte pas l\'accès à la caméra');
            }

            // Initialize scanner if not already done
            if (!scannerRef.current) {
                scannerRef.current = new Html5Qrcode(qrCodeRegionId);
            }

            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
            };

            await scannerRef.current.start(
                { facingMode: 'environment' }, // Use back camera
                config,
                (decodedText) => {
                    // Success callback
                    onScanSuccess(decodedText);
                    stopScanning();
                },
                (errorMessage) => {
                    // Error callback (can be ignored for continuous scanning)
                    // Only log critical errors
                    if (errorMessage.includes('NotFoundException') === false) {
                        console.warn('QR scan error:', errorMessage);
                    }
                }
            );

            setIsScanning(true);
        } catch (err: any) {
            console.error('Scanner error:', err);
            let errorMsg = 'Impossible d\'accéder à la caméra';

            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                errorMsg = 'Permission d\'accès à la caméra refusée. Veuillez autoriser l\'accès dans les paramètres de votre navigateur.';
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                errorMsg = 'Aucune caméra détectée sur cet appareil.';
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                errorMsg = 'La caméra est déjà utilisée par une autre application.';
            } else if (err.message) {
                errorMsg = err.message;
            }

            setError(errorMsg);
            if (onScanError) {
                onScanError(errorMsg);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const stopScanning = async () => {
        if (scannerRef.current && isScanning) {
            try {
                await scannerRef.current.stop();
                setIsScanning(false);
            } catch (err) {
                console.error('Error stopping scanner:', err);
            }
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().catch(console.error);
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
