
import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';

interface NotificationProps {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const icons = {
        success: <CheckCircle className="h-6 w-6 text-emerald-500" />,
        error: <XCircle className="h-6 w-6 text-red-500" />,
        info: <Info className="h-6 w-6 text-sky-500" />,
        warning: <AlertTriangle className="h-6 w-6 text-amber-500" />,
    };

    const colors = {
        success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        info: 'bg-sky-50 border-sky-200 text-sky-800',
        warning: 'bg-amber-50 border-amber-200 text-amber-800',
    };

    return (
        <div 
            className={`fixed top-5 right-5 z-50 p-4 rounded-lg border-l-4 shadow-lg flex items-center space-x-3 max-w-sm animate-fade-in-down ${colors[type]}`}
        >
            {icons[type]}
            <p className="flex-1 font-medium">{message}</p>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-800 transition-colors">
                <XCircle className="h-5 w-5" />
            </button>
        </div>
    );
};

export default Notification;
