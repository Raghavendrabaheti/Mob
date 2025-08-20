import { Button } from '@/components/ui/button';
import { QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface QRScannerDialogProps {
    trigger?: React.ReactNode;
    className?: string;
}

export const QRScannerDialog = ({ trigger, className }: QRScannerDialogProps) => {
    const navigate = useNavigate();

    const handleScanClick = () => {
        // Navigate to full-screen scanner instead of opening a dialog
        navigate('/app/scanner');
    };

    const defaultTrigger = (
        <Button
            onClick={handleScanClick}
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
        <>
            {trigger ? (
                <div onClick={handleScanClick} className="cursor-pointer">
                    {trigger}
                </div>
            ) : (
                defaultTrigger
            )}
        </>
    );
};
