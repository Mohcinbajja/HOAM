import React, { useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import SelectYearPrompt from '../ui/SelectYearPrompt';
import { useData } from '../../contexts/DataContext';
import Card from '../ui/Card';
import { Owner } from '../../types';

interface RegularBalanceProps {
    selectedYear: number | null;
}

interface BalanceTransaction {
    id: string;
    date: string;
    description: string;
    amount: number;
    type: 'income' | 'outcome';
}

const RegularBalance: React.FC<RegularBalanceProps> = ({ selectedYear }) => {
    const { t, language } = useLanguage();
    const { selectedProperty, paymentHistory, outcomeTransactions, owners } = useData();
    
    if (selectedYear === null) {
        return <SelectYearPrompt />;
    }

    const { totalIncome, totalOutcome, balance, combinedTransactions } = useMemo(() => {
        if (!selectedProperty) {
            return { totalIncome: 0, totalOutcome: 0, balance: 0, combinedTransactions: [] };
        }

        const incomeForYear = paymentHistory.filter(p => p.propertyId === selectedProperty.id && p.year === selectedYear);
        const totalIncome = incomeForYear.reduce((sum, p) => sum + p.amountPaid, 0);

        const outcomeForYear = outcomeTransactions.filter(t => t.propertyId === selectedProperty.id && t.year === selectedYear);
        const totalOutcome = outcomeForYear.reduce((sum, t) => sum + t.amount, 0);

        const balance = totalIncome - totalOutcome;

        const ownersMap = new Map(owners.map(o => [o.id, o.fullName]));

        const incomeTransactions: BalanceTransaction[] = incomeForYear.map(entry => ({
            id: entry.transactionId,
            date: entry.transactionDate,
            description: t('payment_from_owner_for_month', {
                owner: ownersMap.get(entry.ownerId) || 'Unknown Owner',
                month: new Date(entry.year, entry.month).toLocaleString(language, { month: 'long' })
            }),
            amount: entry.amountPaid,
            type: 'income'
        }));

        const outcomeTransactionsUnified: BalanceTransaction[] = outcomeForYear.map(entry => ({
            id: entry.id,
            date: entry.transactionDate,
            description: entry.description,
            amount: -entry.amount, // Negative for outflow, positive for cancellation/refund
            type: 'outcome'
        }));

        const combinedTransactions = [...incomeTransactions, ...outcomeTransactionsUnified]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return { totalIncome, totalOutcome, balance, combinedTransactions };

    }, [selectedProperty, paymentHistory, outcomeTransactions, selectedYear, owners, language, t]);

    const currency = selectedProperty?.details.currency || 'USD';
    const formatCurrency = (amount: number) => new Intl.NumberFormat(language, { style: 'currency', currency }).format(amount);
    const formatDate = (dateString: string) => new Date(dateString).toLocaleString(language, {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
        <div className="space-y-8">
            <Card title={t('balance')}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('total')} {t('income')}</p>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{formatCurrency(totalIncome)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('total')} {t('outcome')}</p>
                        <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">{formatCurrency(totalOutcome)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('balance')}</p>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{formatCurrency(balance)}</p>
                    </div>
                </div>
                <div className="text-center pt-8 mt-8 border-t dark:border-gray-700">
                    <p className="text-lg font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t('yearly_balance')}</p>
                    <p className={`text-5xl font-extrabold mt-2 ${balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {formatCurrency(balance)}
                    </p>
                </div>
            </Card>

            <Card title={t('transactions_log')}>
                {combinedTransactions.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('description')}</th>
                                    {/* FIX: Use 'amount_type' translation key instead of non-existent 'type'. */}
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
        </div>
    );
};

export default RegularBalance;
