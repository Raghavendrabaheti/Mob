import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QrCode, Camera, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import QrScanner from 'qr-scanner';
import { cn } from '@/lib/utils';

interface QRScannerDialogProps {
    trigger?: React.ReactNode;
    className?: string;
}

export const QRScannerDialog = ({ trigger, className }: QRScannerDialogProps) => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string>('');
    const [scanResult, setScanResult] = useState<string>('');
    const [hasCamera, setHasCamera] = useState<boolean | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const qrScannerRef = useRef<QrScanner | null>(null);

    // Check camera availability and auto-start when dialog opens
    useEffect(() => {
        if (!isOpen) return;

        const checkCameraAvailability = async () => {
            try {
                if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
                    const devices = await navigator.mediaDevices.enumerateDevices();
                    const hasVideoDevice = devices.some(device => device.kind === 'videoinput');

                    if (hasVideoDevice) {
                        const qrScannerHasCamera = await QrScanner.hasCamera();
                        setHasCamera(qrScannerHasCamera);

                        // Auto-start camera when dialog opens and camera is available
                        if (qrScannerHasCamera) {
                            setTimeout(() => {
                                startCamera();
                            }, 200); // Small delay to ensure dialog is fully rendered
                        }
                    } else {
                        setHasCamera(false);
                        setError('No camera found on this device');
                    }
                } else {
                    const qrScannerHasCamera = await QrScanner.hasCamera();
                    setHasCamera(qrScannerHasCamera);
                    if (!qrScannerHasCamera) {
                        setError('No camera found on this device');
                    } else {
                        // Auto-start camera when dialog opens and camera is available
                        setTimeout(() => {
                            startCamera();
                        }, 200);
                    }
                }
            } catch (err) {
                console.error('Error checking camera availability:', err);
                setHasCamera(true);
                setError('');
                // Try to start camera even if detection failed
                setTimeout(() => {
                    startCamera();
                }, 200);
            }
        };

        checkCameraAvailability();
    }, [isOpen]);

    // Cleanup on unmount or dialog close
    useEffect(() => {
        if (!isOpen) {
            stopCamera();
        }

        return () => {
            if (qrScannerRef.current) {
                qrScannerRef.current.stop();
                qrScannerRef.current.destroy();
            }
        };
    }, [isOpen]);

    const startCamera = async () => {
        setIsCameraActive(true);
        await actualStartCamera();
    };

    const actualStartCamera = async () => {
        try {
            setError('');
            setIsScanning(true);

            if (hasCamera === null) {
                setError('Checking camera availability...');
                setIsScanning(false);
                return;
            }

            await new Promise(resolve => setTimeout(resolve, 100));

            if (!videoRef.current) {
                setError('Video element not available. Please try again.');
                setIsScanning(false);
                return;
            }

            // Test camera access first
            const testStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: 'environment' },
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            testStream.getTracks().forEach(track => track.stop());

            // Initialize QR Scanner
            qrScannerRef.current = new QrScanner(
                videoRef.current,
                (result) => {
                    handleScanResult(result.data);
                },
                {
                    returnDetailedScanResult: true,
                    highlightScanRegion: true,
                    highlightCodeOutline: true,
                    preferredCamera: 'environment',
                    maxScansPerSecond: 5,
                }
            );

            await qrScannerRef.current.start();
            setIsScanning(false);
            setHasCamera(true);

        } catch (err) {
            setError('Unable to access camera. Please check permissions and ensure you\'re using HTTPS.');
            setIsScanning(false);
            setIsCameraActive(false);
            console.error('Camera error:', err);

            if (err instanceof Error) {
                if (err.name === 'NotAllowedError') {
                    setError('Camera access denied. Please allow camera permissions and try again.');
                } else if (err.name === 'NotFoundError') {
                    setError('No camera found on this device.');
                    setHasCamera(false);
                } else if (err.name === 'NotSupportedError') {
                    setError('Camera not supported in this browser. Try Chrome or Safari.');
                } else if (err.name === 'NotReadableError') {
                    setError('Camera is already in use by another application.');
                } else {
                    setError(`Camera error: ${err.message}`);
                }
            }
        }
    };

    const stopCamera = () => {
        if (qrScannerRef.current) {
            qrScannerRef.current.stop();
            qrScannerRef.current.destroy();
            qrScannerRef.current = null;
        }
        setIsCameraActive(false);
        setIsScanning(false);
        setError('');
        setScanResult('');
        setIsOpen(false); // Close the dialog when stopping camera
    };

    const handleScanResult = (data: string) => {
        setScanResult(data);
        setIsScanning(false);

        if (qrScannerRef.current) {
            qrScannerRef.current.pause();
        }

        toast({
            title: "✅ QR Code scanned successfully!",
            description: `Scanned: ${data.length > 50 ? data.substring(0, 50) + '...' : data}`,
            duration: 3000,
        });

        // Close dialog and redirect after a short delay
        setTimeout(() => {
            setIsOpen(false);
            navigate('/coming-soon');
        }, 1500);
    };

    const resumeScanning = () => {
        if (qrScannerRef.current) {
            qrScannerRef.current.start();
            setScanResult('');
            setIsScanning(false);
        }
    };

    const defaultTrigger = (
        <Button
            variant="outline"
            size="sm"
            className={cn(
                "flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 hover:from-blue-600 hover:to-indigo-700 shadow-md",
                className
            )}
        >
            <QrCode className="w-4 h-4" />
            Scan & Pay
        </Button>
    );

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || defaultTrigger}
            </DialogTrigger>

            <DialogContent className="max-w-xs mx-auto p-4">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <QrCode className="w-4 h-4" />
                        Scan & Pay
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {hasCamera === null && (
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-b-transparent mx-auto mb-2"></div>
                            <p className="text-sm text-muted-foreground">Checking camera...</p>
                        </div>
                    )}

                    {hasCamera === false && (
                        <div className="text-center">
                            <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
                            <p className="text-sm text-destructive">Camera not available</p>
                        </div>
                    )}

                    {/* Video container - always visible since we auto-start */}
                    <div className="relative">
                        <video
                            ref={videoRef}
                            className="w-full rounded-lg"
                            style={{
                                maxHeight: '180px',
                                display: isCameraActive ? 'block' : 'none'
                            }}
                            playsInline
                            autoPlay
                            muted
                        />

                        {/* Loading overlay when camera is starting */}
                        {!isCameraActive && hasCamera === true && (
                            <div className="w-full bg-accent rounded-lg flex items-center justify-center" style={{ height: '180px' }}>
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-b-transparent mx-auto mb-2"></div>
                                    <p className="text-sm font-medium">Starting Camera...</p>
                                    <p className="text-xs text-muted-foreground">Please allow camera access</p>
                                </div>
                            </div>
                        )}

                        {scanResult ? (
                            <div className="absolute inset-0 bg-green-50/90 flex items-center justify-center rounded-lg">
                                <div className="text-center p-4">
                                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                    <p className="text-sm font-medium text-green-800">QR Code Detected!</p>
                                    <p className="text-xs text-green-700 mt-1 break-words">
                                        {scanResult.length > 30 ? scanResult.substring(0, 30) + '...' : scanResult}
                                    </p>
                                </div>
                            </div>
                        ) : isScanning ? (
                            <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
                                Starting camera...
                            </div>
                        ) : (
                            <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
                                Point at QR code
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        </div>
                    )}

                    {/* Action buttons - only show when camera is active */}
                    {isCameraActive && (
                        <div className="flex gap-2">
                            {scanResult && (
                                <Button
                                    onClick={resumeScanning}
                                    variant="secondary"
                                    size="sm"
                                    className="flex-1"
                                >
                                    <QrCode className="w-4 h-4 mr-2" />
                                    Scan Again
                                </Button>
                            )}
                            <Button
                                onClick={stopCamera}
                                variant="outline"
                                size="sm"
                                className="flex-1"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Close
                            </Button>
                        </div>
                    )}                    {!window.isSecureContext && (
                        <p className="text-xs text-amber-600 text-center">
                            ⚠️ HTTPS required for camera access on mobile
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
