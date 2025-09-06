import React from 'react';
import { MonthlyOutcome } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import Icon from '../ui/Icon';

interface OutcomeCellProps {
    outcome: MonthlyOutcome | null;
    onClick: () => void;
}

const OutcomeCell: React.FC<OutcomeCellProps> = ({ outcome, onClick }) => {
    const { language } = useLanguage();
    const formatCurrency = (amount: number) => new Intl.NumberFormat(language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);

    const isConfirmed = outcome?.isConfirmed ?? false;
    const amount = outcome?.amount ?? 0;

    const cellClasses = [
        'px-3 py-2',
        'whitespace-nowrap',
        'text-sm text-center',
        'cursor-pointer',
        'transition-colors',
        'hover:bg-blue-50 dark:hover:bg-blue-900/30',
        'relative',
        isConfirmed ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'
    ].join(' ');

    return (
        <td onClick={onClick} className={cellClasses}>
            {amount > 0 && formatCurrency(amount)}
            {outcome?.photoUrl && (
                <Icon name="camera" className="h-3 w-3 absolute top-1 right-1 text-gray-400 dark:text-gray-500" />
            )}
        </td>
    );
};

export default OutcomeCell;
