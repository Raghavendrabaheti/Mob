import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Camera, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export const SimpleScanner = () => {
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [error, setError] = useState<string>('');
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const startCamera = async () => {
        try {
            setError('');

            // Request camera access
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: 'environment' },
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setIsCameraActive(true);

                toast({
                    title: "✅ Camera started successfully!",
                    description: "Camera is now active for QR scanning",
                    duration: 3000,
                });
            }
        } catch (err) {
            console.error('Camera error:', err);

            if (err instanceof Error) {
                if (err.name === 'NotAllowedError') {
                    setError('Camera access denied. Please allow camera permissions.');
                } else if (err.name === 'NotFoundError') {
                    setError('No camera found on this device.');
                } else if (err.name === 'NotSupportedError') {
                    setError('Camera not supported in this browser.');
                } else if (err.name === 'NotReadableError') {
                    setError('Camera is already in use by another application.');
                } else if (err.name === 'OverconstrainedError') {
                    setError('Camera constraints could not be satisfied.');
                } else {
                    setError(`Camera error: ${err.message}`);
                }
            }
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsCameraActive(false);
        setError('');
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return (
        <div className="max-w-lg mx-auto p-4 space-y-4">
            <div className="pt-4">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <QrCode className="w-6 h-6" />
                    Simple Scanner Test
                </h1>
                <p className="text-muted-foreground">Basic camera access test</p>
            </div>

            <Card>
                <CardContent className="p-8 text-center">
                    {!isCameraActive ? (
                        <div>
                            <div className="w-24 h-24 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Camera className="w-12 h-12 text-muted-foreground" />
                            </div>
                            <h3 className="font-semibold mb-2">Camera Preview</h3>
                            <p className="text-muted-foreground mb-6">Click to test camera access</p>
                        </div>
                    ) : (
                        <div className="relative">
                            <div className="relative inline-block">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full max-w-sm mx-auto rounded-lg mb-4"
                                    style={{ maxHeight: '300px' }}
                                />

                                <div className="absolute top-2 right-2">
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={stopCamera}
                                        className="p-2"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <p className="text-sm text-muted-foreground mb-4">
                                Camera is active! This is just a basic test - no QR scanning yet.
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-destructive/10 text-destructive p-3 rounded-lg mb-4 text-sm">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        {!isCameraActive ? (
                            <Button className="w-full" onClick={startCamera}>
                                <Camera className="w-4 h-4 mr-2" />
                                Test Camera Access
                            </Button>
                        ) : (
                            <Button className="w-full" onClick={stopCamera} variant="outline">
                                <X className="w-4 h-4 mr-2" />
                                Stop Camera
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Test Info</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>• Basic camera access without QR scanning</p>
                    <p>• Uses getUserMedia API directly</p>
                    <p>• Should work if camera permissions are granted</p>
                    <p>• HTTPS: {window.isSecureContext ? '✅ Yes' : '❌ No'}</p>
                </CardContent>
            </Card>
        </div>
    );
};
