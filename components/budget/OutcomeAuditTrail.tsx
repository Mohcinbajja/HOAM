import React, { useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Card from '../ui/Card';

interface OutcomeAuditTrailProps {
    selectedYear: number;
}

const OutcomeAuditTrail: React.FC<OutcomeAuditTrailProps> = ({ selectedYear }) => {
    const { t, language } = useLanguage();
    const { selectedProperty, outcomeTransactions } = useData();

    const transactionsForYear = useMemo(() => {
        if (!selectedProperty) return [];
        return outcomeTransactions
            .filter(t => t.propertyId === selectedProperty.id && t.year === selectedYear)
            .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
    }, [outcomeTransactions, selectedProperty, selectedYear]);

    const currency = selectedProperty?.details.currency || 'USD';
    const formatCurrency = (amount: number) => new Intl.NumberFormat(language, { style: 'currency', currency }).format(amount);
    const formatDate = (dateString: string) => new Date(dateString).toLocaleString(language, {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
        <div className="mt-8">
            <Card title={t('audit_trail')}>
                {transactionsForYear.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('description')}</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('amount')}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {transactionsForYear.map(entry => (
                                    <tr key={entry.id}>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(entry.transactionDate)}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">{entry.description}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold">
                                            <span className={entry.amount >= 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                                                {formatCurrency(entry.amount)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                        {t('no_payments_for_year')}
                    </p>
                )}
            </Card>
        </div>
    );
};

export default OutcomeAuditTrail;
