import React from 'react';
import Icon from './Icon';

interface SuccessToastProps {
    message: string;
}

const SuccessToast: React.FC<SuccessToastProps> = ({ message }) => {
    if (!message) return null;

    return (
        <div 
            className="fixed bottom-5 right-5 bg-green-500 text-white py-3 px-5 rounded-lg shadow-lg flex items-center z-[100] animate-fade-in-out"
            role="alert"
            aria-live="assertive"
        >
            <Icon name="check_circle" className="h-6 w-6 mr-3" />
            <span>{message}</span>
            <style>{`
                @keyframes fade-in-out {
                    0% { opacity: 0; transform: translateY(20px); }
                    10% { opacity: 1; transform: translateY(0); }
                    90% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(20px); }
                }
                .animate-fade-in-out {
                    animation: fade-in-out 3s ease-in-out forwards;
                }
            `}</style>
        </div>
    );
};

export default SuccessToast;
