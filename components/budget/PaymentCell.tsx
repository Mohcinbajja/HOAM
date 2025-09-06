import React, { useEffect, useState } from 'react';
import { MonthlyPayment, PaymentStatus } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface PaymentCellProps {
    onClick: () => void;
    payment: MonthlyPayment | null;
    monthCategory: 'past' | 'current' | 'future';
    isEditable: boolean;
    adjustedDue: number;
}

const PaymentCell: React.FC<PaymentCellProps> = ({ onClick, payment, monthCategory, isEditable, adjustedDue }) => {
    const { language } = useLanguage();
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // This is the most reliable way to sync with Tailwind's class-based dark mode
        const observer = new MutationObserver(() => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        
        // Initial check
        setIsDarkMode(document.documentElement.classList.contains('dark'));

        return () => observer.disconnect();
    }, []);

    const status = payment?.status ?? PaymentStatus.UNPAID;
    const amountPaid = payment?.amountPaid ?? 0;

    const formatNumber = (val: number) => new Intl.NumberFormat(language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
    const formatNumberNoCents = (val: number) => new Intl.NumberFormat(language, { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);

    const finalClasses = isEditable ? 'cursor-pointer' : 'cursor-not-allowed';

    if (status === PaymentStatus.PARTIALLY_PAID && adjustedDue > 0 && amountPaid > 0) {
        const remaining = adjustedDue - amountPaid;
        const paidPercentage = (amountPaid / adjustedDue) * 100;
        
        const greenBg = '#dcfce7'; // green-100
        const redBg = '#fee2e2';   // red-100
        const darkGreenBg = 'rgba(20, 83, 45, 0.5)'; // green-900 with 50% opacity
        const darkRedBg = 'rgba(127, 29, 29, 0.5)'; // red-900 with 50% opacity

        const cellStyle = {
            background: `linear-gradient(to bottom, ${isDarkMode ? darkGreenBg : greenBg} ${paidPercentage}%, ${isDarkMode ? darkRedBg : redBg} ${paidPercentage}%)`,
        };

        return (
            <td
                onClick={isEditable ? onClick : undefined}
                className={`px-1 py-2 whitespace-nowrap text-xs text-center ${finalClasses}`}
                style={cellStyle}
            >
                <div className="flex flex-col justify-center items-center font-semibold">
                    <span className="text-green-800 dark:text-green-300">
                        {formatNumberNoCents(amountPaid)}
                    </span>
                    <span className="text-red-800 dark:text-red-300">
                        {formatNumberNoCents(remaining)}
                    </span>
                </div>
            </td>
        );
    }
    
    const getStatusClasses = () => {
        switch (status) {
            case PaymentStatus.PAID:
                return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300';
            case PaymentStatus.PAUSED:
                return 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-300';
            case PaymentStatus.UNPAID:
                if (monthCategory === 'past') {
                    return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300';
                }
                return 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400';
            default:
                return 'bg-white dark:bg-gray-800';
        }
    };
    
    const amountToDisplay = (status === PaymentStatus.UNPAID && monthCategory === 'past') 
        ? adjustedDue 
        : (payment?.amountPaid ?? 0);
    
    const hoverClasses = isEditable ? 'hover:bg-blue-50 dark:hover:bg-blue-900/30' : '';

    return (
        <td
            onClick={isEditable ? onClick : undefined}
            className={`px-3 py-2 whitespace-nowrap text-sm text-center transition-colors ${finalClasses} ${getStatusClasses()} ${hoverClasses}`}
        >
            {formatNumber(amountToDisplay)}
        </td>
    );
};

export default PaymentCell;