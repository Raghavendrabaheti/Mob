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
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);

  // Check if camera is available using multiple methods
  useEffect(() => {
    const checkCameraAvailability = async () => {
      try {
        // Method 1: Try to enumerate media devices
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const hasVideoDevice = devices.some(device => device.kind === 'videoinput');

          if (hasVideoDevice) {
            // Method 2: Also check QrScanner's method
            const qrScannerHasCamera = await QrScanner.hasCamera();
            setHasCamera(qrScannerHasCamera);
          } else {
            setHasCamera(false);
            setError('No camera found on this device');
          }
        } else {
          // Fallback: Try QrScanner method only
          const qrScannerHasCamera = await QrScanner.hasCamera();
          setHasCamera(qrScannerHasCamera);
          if (!qrScannerHasCamera) {
            setError('No camera found on this device');
          }
        }
      } catch (err) {
        console.error('Error checking camera availability:', err);
        // If all checks fail, assume camera is available and let user try
        setHasCamera(true);
        setError('');
      }
    };

    checkCameraAvailability();

    return () => {
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

      // If camera availability is still being checked, wait a moment
      if (hasCamera === null) {
        setError('Checking camera availability...');
        setIsScanning(false);
        return;
      }

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
    <div className="max-w-lg mx-auto p-4 space-y-4">
      <div className="pt-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <QrCode className="w-6 h-6" />
          QR Scanner
        </h1>
        <p className="text-muted-foreground">Scan QR codes with your camera</p>
      </div>

      <Card>
        <CardContent className="p-8 text-center">
          {hasCamera === null && (
            <div className="text-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-b-transparent mx-auto mb-2"></div>
              <p className="text-muted-foreground">Checking camera availability...</p>
            </div>
          )}

          {hasCamera === false && (
            <div className="text-center mb-4">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-2" />
              <p className="text-destructive">Camera not available on this device</p>
              <p className="text-sm text-muted-foreground mt-2">
                Try refreshing the page or check camera permissions
              </p>
            </div>
          )}

          {/* Video container - always present but conditionally visible */}
          <div
            data-video-container
            className="relative"
            style={{ display: isCameraActive ? 'block' : 'none' }}
          >
            <div className="relative inline-block">
              <video
                ref={videoRef}
                className="w-full max-w-sm mx-auto rounded-lg mb-4"
                style={{ maxHeight: '300px' }}
                playsInline
                autoPlay
                muted
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

            <div className="space-y-2">
              {scanResult ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 text-green-800 mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">QR Code Detected!</span>
                  </div>
                  <p className="text-sm text-green-700 break-words">
                    {scanResult}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {isScanning ? 'Starting camera...' : 'Point your camera at a QR code'}
                </p>
              )}
            </div>
          </div>

          {/* Camera preview placeholder - show when camera not active */}
          {!isCameraActive && hasCamera === true && (
            <div>
              <div className="w-24 h-24 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Camera className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Camera Preview</h3>
              <p className="text-muted-foreground mb-6">Point camera at QR code to scan</p>
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
            {!isCameraActive && hasCamera === true ? (
              <Button
                className="w-full"
                onClick={handleStartCamera}
                disabled={isScanning || hasCamera === null}
              >
                {isScanning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent mr-2"></div>
                    Starting Camera...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 mr-2" />
                    Open QR Scanner
                  </>
                )}
              </Button>
            ) : hasCamera === false ? (
              <Button
                className="w-full"
                onClick={handleStartCamera}
                variant="outline"
                disabled={false}
              >
                <Camera className="w-4 h-4 mr-2" />
                Try Camera Access
              </Button>
            ) : isCameraActive ? (
              <div className="space-y-3">
                {scanResult && (
                  <Button
                    className="w-full"
                    onClick={resumeScanning}
                    variant="secondary"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Scan Another Code
                  </Button>
                )}

                <Button className="w-full" onClick={stopCamera} variant="outline">
                  <X className="w-4 h-4 mr-2" />
                  Close Scanner
                </Button>
              </div>
            ) : null}

            <Button variant="outline" className="w-full" disabled={!scanResult}>
              <CreditCard className="w-4 h-4 mr-2" />
              {scanResult ? 'Process Payment' : 'Scan QR to Continue'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Scanner Info</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Real QR code scanning with camera</p>
          <p>• Supports various QR code formats</p>
          <p>• Requires camera permissions</p>
          <p>• Works best in good lighting</p>
          {!window.isSecureContext && (
            <p className="text-amber-600">• ⚠️ HTTPS required for camera access on mobile</p>
          )}
          {window.isSecureContext && (
            <p className="text-green-600">• ✅ Secure context (HTTPS) detected</p>
          )}
          <p className="text-xs">
            • Camera Status: {hasCamera === null ? 'Checking...' : hasCamera === true ? 'Available' : 'Not Found'}
          </p>
          <p className="text-xs">
            • Browser: {navigator.userAgent.includes('Chrome') ? 'Chrome' :
              navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome') ? 'Safari' :
                navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Unknown'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};