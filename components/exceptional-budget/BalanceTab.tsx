import React, { useMemo } from 'react';
import { ExceptionalProject } from '../../types';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Card from '../ui/Card';

interface BalanceTabProps {
    project: ExceptionalProject;
}

interface BalanceTransaction {
    id: string;
    date: string;
    description: string;
    amount: number;
    type: 'income' | 'outcome';
}

const BalanceTab: React.FC<BalanceTabProps> = ({ project }) => {
    const { t, language } = useLanguage();
    const { exceptionalPaymentHistory, exceptionalOutcomes, owners, externalContributors, selectedProperty } = useData();
    const currency = selectedProperty?.details.currency || 'USD';

    const combinedTransactions = useMemo(() => {
        const contributorsMap = new Map();
        owners.forEach(o => contributorsMap.set(o.id, o.fullName));
        externalContributors.forEach(c => contributorsMap.set(c.id, c.fullName));

        const incomeTransactions: BalanceTransaction[] = exceptionalPaymentHistory
            .filter(h => h.projectId === project.id)
            .map(h => ({
                id: h.transactionId,
                date: h.transactionDate,
                description: t('payment_received_audit', { 
                    contributor: contributorsMap.get(h.contributorId) || 'Unknown', 
                    project: project.name 
                }),
                amount: h.amountPaid,
                type: 'income'
            }));

        const outcomeTransactions: BalanceTransaction[] = exceptionalOutcomes
            .filter(o => o.projectId === project.id)
            .flatMap(o => {
                const transactions: BalanceTransaction[] = [];
                if (o.isConfirmed && o.confirmedAt) {
                    transactions.push({
                        id: `${o.id}-confirmed`,
                        date: o.confirmedAt,
                        description: t('expense_confirmed_audit', { project: project.name, description: o.description }),
                        amount: -o.amount,
                        type: 'outcome'
                    });
                }
                // We could also log cancellations if needed
                return transactions;
            });

        return [...incomeTransactions, ...outcomeTransactions]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            
    }, [project.id, project.name, exceptionalPaymentHistory, exceptionalOutcomes, owners, externalContributors, t]);

    const formatCurrency = (amount: number) => new Intl.NumberFormat(language, { style: 'currency', currency }).format(amount);
    const formatDate = (dateString: string) => new Date(dateString).toLocaleString(language, {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
        <Card title={t('transactions_log')}>
            {combinedTransactions.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('description')}</th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('amount_type')}</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('amount')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {combinedTransactions.map(tx => (
                                <tr key={tx.id}>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(tx.date)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{tx.description}</td>
                                    <td className="px-4 py-3 text-center">
                                        {tx.type === 'income' ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">{t('income')}</span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">{t('outcome')}</span>
                                        )}
                                    </td>
                                    <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-semibold ${tx.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {formatCurrency(tx.amount)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    {t('no_transactions_for_year')}
                </p>
            )}
        </Card>
    );
};

export default BalanceTab;
