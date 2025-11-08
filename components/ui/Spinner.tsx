
import React from 'react';

interface SpinnerProps {
    overlay?: boolean;
    text?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ overlay = false, text = 'Memproses...' }) => {
    const spinnerElement = (
        <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 border-4 border-t-4 border-slate-200 border-t-sky-500 rounded-full animate-spin"></div>
            {text && <p className="text-sky-600 font-medium">{text}</p>}
        </div>
    );

    if (overlay) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-xl">
                   {spinnerElement}
                </div>
            </div>
        );
    }

    return spinnerElement;
};

export default Spinner;
