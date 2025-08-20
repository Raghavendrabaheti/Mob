import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, QrCode, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export const ComingSoon = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Add a subtle animation entrance effect
        document.title = 'Coming Soon - MoneySmart';
    }, []);

    const handleGoBack = () => {
        navigate(-1); // Go back to previous page
    };

    const handleGoToScanner = () => {
        navigate('/app/scanner');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-lg mx-auto w-full">
                <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
                    <CardContent className="p-8 text-center space-y-6">
                        {/* Icon */}
                        <div className="relative">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <QrCode className="w-12 h-12 text-white" />
                            </div>
                            <div className="absolute -top-2 -right-2">
                                <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
                            </div>
                        </div>

                        {/* Main content */}
                        <div className="space-y-4">
                            <h1 className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Coming Soon
                            </h1>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                QR Code processing feature is currently under development.
                                We're working hard to bring you an amazing experience!
                            </p>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                                <p className="font-medium">✨ What's coming:</p>
                                <ul className="text-left mt-2 space-y-1 list-disc list-inside">
                                    <li>Instant QR code processing</li>
                                    <li>Smart transaction detection</li>
                                    <li>Automatic expense categorization</li>
                                    <li>Receipt scanning & parsing</li>
                                </ul>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="space-y-3 pt-4">
                            <Button
                                onClick={handleGoBack}
                                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg"
                                size="lg"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Go Back
                            </Button>

                            <Button
                                onClick={handleGoToScanner}
                                variant="outline"
                                className="w-full border-blue-200 hover:bg-blue-50 transition-all duration-300"
                                size="lg"
                            >
                                <QrCode className="w-4 h-4 mr-2" />
                                Scan Another Code
                            </Button>
                        </div>

                        {/* Footer */}
                        <div className="pt-6 border-t border-gray-100">
                            <p className="text-xs text-gray-400">
                                Stay tuned for updates! We'll notify you when this feature is ready.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
