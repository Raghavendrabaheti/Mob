import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, CreditCard, Camera, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import QrScanner from 'qr-scanner';

export const Scanner = () => {
  const navigate = useNavigate();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const [scanResult, setScanResult] = useState<string>('');
  const [hasCamera, setHasCamera] = useState<boolean | null>(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);

  // Start camera immediately on mount
  useEffect(() => {
    // Set camera as available immediately and start
    setHasCamera(true);

    // Start camera with a small delay to allow component to mount
    const timer = setTimeout(() => {
      handleStartCamera();
    }, 100);

    return () => {
      clearTimeout(timer);
      // Cleanup scanner on unmount
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
      }
    };
  }, []);

  const handleStartCamera = async () => {
    // First set camera active to render the video element
    setIsCameraActive(true);
    // Then start the actual camera
    await startCamera();
  };

  const startCamera = async () => {
    try {
      setError('');
      setIsScanning(true);

      // Wait a bit for the video element to be rendered
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check if video element is available
      if (!videoRef.current) {
        setError('Video element not available. Please try again.');
        setIsScanning(false);
        return;
      }

      // First, try to access camera using basic getUserMedia to verify it works
      const testStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' }, // Prefer back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      // Stop test stream immediately
      testStream.getTracks().forEach(track => track.stop());

      // Now initialize QR Scanner with the video element
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          handleScanResult(result.data);
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment', // Use back camera on mobile
          maxScansPerSecond: 5,
        }
      );

      await qrScannerRef.current.start();
      setIsScanning(false);
      setHasCamera(true); // Confirmed working

    } catch (err) {
      setError('Unable to access camera. Please check permissions and ensure you\'re using HTTPS.');
      setIsScanning(false);
      setIsCameraActive(false); // Reset camera active state on error
      console.error('Camera error:', err);

      // Show more specific error messages
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Camera access denied. Please allow camera permissions and reload the page.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera found on this device.');
          setHasCamera(false);
        } else if (err.name === 'NotSupportedError') {
          setError('Camera not supported in this browser. Try Chrome or Safari.');
        } else if (err.name === 'NotReadableError') {
          setError('Camera is already in use by another application.');
        } else if (err.name === 'OverconstrainedError') {
          setError('Camera constraints could not be satisfied. Trying with basic settings...');

          // Retry with minimal constraints
          try {
            const basicStream = await navigator.mediaDevices.getUserMedia({ video: true });
            basicStream.getTracks().forEach(track => track.stop());

            if (videoRef.current) {
              qrScannerRef.current = new QrScanner(
                videoRef.current,
                (result) => handleScanResult(result.data),
                { preferredCamera: 'environment' }
              );

              await qrScannerRef.current.start();
              setIsScanning(false);
              setError('');
            }
          } catch (retryErr) {
            setError('Unable to access camera even with basic settings.');
            setIsScanning(false);
            setIsCameraActive(false);
          }
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
  };

  const handleScanResult = (data: string) => {
    setScanResult(data);
    setIsScanning(false);

    // Stop scanning after successful scan
    if (qrScannerRef.current) {
      qrScannerRef.current.pause();
    }

    // Show success message with the scanned data
    toast({
      title: "✅ QR Code scanned successfully!",
      description: `Scanned: ${data.length > 50 ? data.substring(0, 50) + '...' : data}`,
      duration: 3000,
    });

    // Redirect to coming soon page after a short delay
    setTimeout(() => {
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

  return (
    <div className="p-4 max-w-md mx-auto">
      {/* Header Card */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              QR Scanner
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate(-1)}
            >
              <X className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Scanner Card */}
      <Card>
        <CardContent className="p-4">
          {/* Camera View */}
          <div className="relative aspect-square bg-gray-900 rounded-lg overflow-hidden mb-4 flex items-center justify-center">
            {hasCamera === false && (
              <div className="text-center text-white">
                <AlertCircle className="w-12 h-12 mx-auto mb-2" />
                <p>Camera not available</p>
                <p className="text-sm opacity-70 mt-2">Try refreshing or check permissions</p>
              </div>
            )}

            {/* Video */}
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              style={{ display: isCameraActive ? 'block' : 'none' }}
              playsInline
              autoPlay
              muted
            />

            {/* Loading overlay */}
            {!isCameraActive && hasCamera === true && (
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-b-transparent mx-auto mb-2"></div>
                <p>Starting Camera...</p>
                <p className="text-sm opacity-70">Please allow camera access</p>
              </div>
            )}

            {/* Success overlay */}
            {scanResult && (
              <div className="absolute inset-0 bg-green-500/90 flex items-center justify-center rounded-lg">
                <div className="text-center text-white p-6">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-xl font-bold mb-2">QR Code Detected!</p>
                  <p className="text-sm opacity-90 break-words max-w-xs">
                    {scanResult.length > 50 ? scanResult.substring(0, 50) + '...' : scanResult}
                  </p>
                </div>
              </div>
            )}

            {/* Scanning overlay */}
            {isCameraActive && !scanResult && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-white border-opacity-50 rounded-lg relative">
                  <div className="absolute inset-4 border-2 border-white rounded-lg animate-pulse"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center">
                    <p className="text-sm">Point camera at QR code</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Controls and Error Messages */}
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            </div>
          )}

          <div className="flex gap-3 mb-4">
            {!isCameraActive && hasCamera === true ? (
              <Button
                className="flex-1"
                onClick={handleStartCamera}
                disabled={isScanning}
              >
                {isScanning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent mr-2"></div>
                    Starting...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 mr-2" />
                    Open Scanner
                  </>
                )}
              </Button>
            ) : isCameraActive ? (
              <>
                {scanResult && (
                  <Button
                    className="flex-1"
                    onClick={resumeScanning}
                    variant="secondary"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Scan Again
                  </Button>
                )}
                <Button
                  className="flex-1"
                  onClick={stopCamera}
                  variant="outline"
                >
                  <X className="w-4 h-4 mr-2" />
                  Close
                </Button>
              </>
            ) : null}
          </div>

          {!window.isSecureContext && (
            <p className="text-xs text-amber-600 text-center">
              ⚠️ HTTPS required for camera access on mobile
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};