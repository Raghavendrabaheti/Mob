import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, CreditCard, Camera, X, CheckCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export const Scanner = () => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanLineRef = useRef<HTMLDivElement>(null);

  const startCamera = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera on mobile
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      setError('Unable to access camera. Please check permissions.');
      console.error('Camera error:', err);
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
    setIsScanning(false);
    setError('');
  };

  const startScanning = () => {
    setIsScanning(true);

    // Start scan line animation
    if (scanLineRef.current) {
      scanLineRef.current.style.animation = 'scanLine 2s linear infinite';
    }

    // Simulate scanning process
    setTimeout(() => {
      setIsScanning(false);
      if (scanLineRef.current) {
        scanLineRef.current.style.animation = 'none';
      }

      // Show success message
      toast({
        title: "✅ QR Code scanned successfully!",
        description: "Demo scan completed (no real payment integration)",
        duration: 3000,
      });
    }, 3000); // 3 second delay
  };

  useEffect(() => {
    // Add CSS for scan line animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes scanLine {
        0% {
          top: 10%;
        }
        50% {
          top: 90%;
        }
        100% {
          top: 10%;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="max-w-lg mx-auto p-4 space-y-4">
      <div className="pt-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <QrCode className="w-6 h-6" />
          QR Scanner
        </h1>
        <p className="text-muted-foreground">Scan and pay with ease</p>
      </div>

      <Card>
        <CardContent className="p-8 text-center">
          {!isCameraActive ? (
            <div>
              <div className="w-24 h-24 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Camera className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Camera Preview</h3>
              <p className="text-muted-foreground mb-6">Point camera at QR code to scan</p>
            </div>
          ) : (
            <div className="relative">
              <div className="relative inline-block">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full max-w-sm mx-auto rounded-lg mb-4"
                  style={{ transform: 'scaleX(-1)' }} // Mirror for selfie view
                />

                {/* Scanning overlay */}
                <div className="absolute inset-0 border-2 border-green-500 rounded-lg pointer-events-none">
                  {/* Corner brackets */}
                  <div className="absolute top-2 left-2 w-6 h-6 border-t-4 border-l-4 border-green-500"></div>
                  <div className="absolute top-2 right-2 w-6 h-6 border-t-4 border-r-4 border-green-500"></div>
                  <div className="absolute bottom-2 left-2 w-6 h-6 border-b-4 border-l-4 border-green-500"></div>
                  <div className="absolute bottom-2 right-2 w-6 h-6 border-b-4 border-r-4 border-green-500"></div>

                  {/* Scanning line */}
                  <div
                    ref={scanLineRef}
                    className="absolute left-0 right-0 h-1 bg-green-500 shadow-lg"
                    style={{
                      top: '10%',
                      boxShadow: '0 0 20px rgba(34, 197, 94, 0.8)',
                    }}
                  />
                </div>

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
                {isScanning ? 'Scanning QR code...' : 'Point your camera at a QR code to scan'}
              </p>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {!isCameraActive ? (
              <Button className="w-full" onClick={startCamera}>
                <Camera className="w-4 h-4 mr-2" />
                Open QR Scanner
              </Button>
            ) : (
              <div className="space-y-3">
                <Button
                  className="w-full"
                  onClick={startScanning}
                  disabled={isScanning}
                  variant={isScanning ? "secondary" : "default"}
                >
                  {isScanning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent mr-2"></div>
                      Scanning...
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4 mr-2" />
                      Start Scan
                    </>
                  )}
                </Button>

                <Button className="w-full" onClick={stopCamera} variant="outline">
                  <X className="w-4 h-4 mr-2" />
                  Close Scanner
                </Button>
              </div>
            )}

            <Button variant="outline" className="w-full" disabled>
              <CreditCard className="w-4 h-4 mr-2" />
              Proceed to Pay (Demo Only)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Demo Features</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Fake QR code scanning with animation</p>
          <p>• Camera access for realistic experience</p>
          <p>• Success notification after 3 seconds</p>
          <p>• No real payment integration included</p>
        </CardContent>
      </Card>
    </div>
  );
};