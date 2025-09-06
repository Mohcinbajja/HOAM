import React, { useMemo } from 'react';
import { useData } from '../../../contexts/DataContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import Card from '../../ui/Card';

interface PaymentsByOwnerForMonthChartProps {
    selectedYear: number;
    selectedMonth: number;
}

const PaymentsByOwnerForMonthChart: React.FC<PaymentsByOwnerForMonthChartProps> = ({ selectedYear, selectedMonth }) => {
    const { t, language } = useLanguage();
    const { selectedProperty, owners, getPaymentsForYear } = useData();
    
    const monthName = new Date(selectedYear, selectedMonth).toLocaleString(language, { month: 'long' });

    const chartData = useMemo(() => {
        if (!selectedProperty) return [];
        const activeOwners = owners.filter(o => o.propertyId === selectedProperty.id && o.isActive);
        const payments = getPaymentsForYear(selectedProperty.id, selectedYear);

        return activeOwners.map(owner => {
            const payment = payments.find(p => p.ownerId === owner.id && p.month === selectedMonth);
            const amountPaid = payment?.amountPaid || 0;
            return { name: owner.fullName, paid: amountPaid };
        }).filter(d => d.paid > 0) // Only show owners who have paid
          .sort((a, b) => b.paid - a.paid);

    }, [selectedProperty, owners, getPaymentsForYear, selectedYear, selectedMonth]);

    const maxValue = useMemo(() => {
        if (chartData.length === 0) return 1;
        const max = Math.max(...chartData.map(d => d.paid));
        return max === 0 ? 1 : max;
    }, [chartData]);
    
    const formatCurrency = (amount: number) => new Intl.NumberFormat(language, { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
    
    // FIX: Use 't' function with replacements instead of string.replace().
    const title = t('payments_by_owner_for_month', { month: monthName });

    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{title}</h3>
            {chartData.length > 0 ? (
                <div className="space-y-3 pr-4" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {chartData.map(({ name, paid }) => {
                        const barWidth = `${(paid / maxValue) * 100}%`;
                        return (
                            <div key={name} className="flex items-center group">
                                <div className="w-1/3 text-sm font-medium text-gray-700 dark:text-gray-300 truncate pr-2" title={name}>
                                    {name}
                                </div>
                                <div className="w-2/3">
                                    <div className="flex items-center">
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-5">
                                            <div 
                                                className="bg-blue-500 h-5 rounded-full hover:bg-blue-600 transition-colors"
                                                style={{ width: barWidth }}
                                            />
                                        </div>
                                        <span className="ml-3 text-sm font-semibold text-gray-800 dark:text-gray-100 whitespace-nowrap">
                                            {formatCurrency(paid)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">{t('no_data_for_selection')}</p>
            )}
        </div>
    );
};

export default PaymentsByOwnerForMonthChart;
