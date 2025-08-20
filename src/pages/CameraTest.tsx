import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, AlertCircle, CheckCircle } from 'lucide-react';

export const CameraTest = () => {
    const [tests, setTests] = useState({
        mediaDevicesSupport: false,
        enumerateDevices: false,
        getUserMedia: false,
        cameras: [] as MediaDeviceInfo[],
        error: ''
    });

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        runBasicTests();
    }, []);

    const runBasicTests = async () => {
        const newTests = { ...tests };

        // Test 1: Check if MediaDevices API is supported
        newTests.mediaDevicesSupport = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

        if (newTests.mediaDevicesSupport) {
            try {
                // Test 2: Enumerate devices
                const devices = await navigator.mediaDevices.enumerateDevices();
                newTests.enumerateDevices = true;
                newTests.cameras = devices.filter(device => device.kind === 'videoinput');
            } catch (err) {
                newTests.error = `Enumerate devices failed: ${err}`;
            }
        }

        setTests(newTests);
    };

    const testCameraAccess = async () => {
        setIsLoading(true);
        const newTests = { ...tests };

        try {
            // Test getUserMedia
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            newTests.getUserMedia = true;
            newTests.error = '';

            // Stop the stream immediately
            stream.getTracks().forEach(track => track.stop());
        } catch (err) {
            newTests.getUserMedia = false;
            if (err instanceof Error) {
                newTests.error = `getUserMedia failed: ${err.name} - ${err.message}`;
            }
        }

        setTests(newTests);
        setIsLoading(false);
    };

    return (
        <div className="max-w-lg mx-auto p-4 space-y-4">
            <div className="pt-4">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Camera className="w-6 h-6" />
                    Camera Test
                </h1>
                <p className="text-muted-foreground">Debug camera access issues</p>
            </div>

            <Card>
                <CardHeader><CardTitle>Camera API Tests</CardTitle></CardHeader>
                <CardContent className="space-y-4">

                    <div className="flex items-center gap-2">
                        {tests.mediaDevicesSupport ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-red-600" />
                        )}
                        <span>MediaDevices API Support</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {tests.enumerateDevices ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-red-600" />
                        )}
                        <span>Enumerate Devices</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {tests.getUserMedia ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : tests.getUserMedia === false ? (
                            <AlertCircle className="w-5 h-5 text-red-600" />
                        ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                        )}
                        <span>Camera Access (getUserMedia)</span>
                    </div>

                    <Button
                        onClick={testCameraAccess}
                        disabled={isLoading || !tests.mediaDevicesSupport}
                        className="w-full"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent mr-2"></div>
                                Testing Camera Access...
                            </>
                        ) : (
                            <>
                                <Camera className="w-4 h-4 mr-2" />
                                Test Camera Access
                            </>
                        )}
                    </Button>

                    {tests.error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                            <strong>Error:</strong> {tests.error}
                        </div>
                    )}

                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Detected Cameras</CardTitle></CardHeader>
                <CardContent>
                    {tests.cameras.length > 0 ? (
                        <div className="space-y-2">
                            {tests.cameras.map((camera, index) => (
                                <div key={camera.deviceId} className="p-3 bg-gray-50 rounded-lg">
                                    <p className="font-medium">Camera {index + 1}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Label: {camera.label || 'No label (permissions needed)'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        ID: {camera.deviceId.substring(0, 20)}...
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">No cameras detected or permissions not granted</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Environment Info</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <p><strong>HTTPS:</strong> {window.isSecureContext ? '✅ Yes' : '❌ No'}</p>
                    <p><strong>User Agent:</strong> {navigator.userAgent}</p>
                    <p><strong>Current URL:</strong> {window.location.href}</p>
                </CardContent>
            </Card>
        </div>
    );
};
