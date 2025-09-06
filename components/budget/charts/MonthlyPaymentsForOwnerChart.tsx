import React, { useMemo } from 'react';
import { useData } from '../../../contexts/DataContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import BarChart from '../../ui/BarChart';
import { Owner } from '../../../types';

interface MonthlyPaymentsForOwnerChartProps {
    selectedYear: number;
    owner: Owner;
}

const MonthlyPaymentsForOwnerChart: React.FC<MonthlyPaymentsForOwnerChartProps> = ({ selectedYear, owner }) => {
    const { t } = useLanguage();
    const { selectedProperty, getPaymentsForYear } = useData();

    const chartData = useMemo(() => {
        if (!selectedProperty) return [];
        const payments = getPaymentsForYear(selectedProperty.id, selectedYear);
        const ownerPayments = payments.filter(p => p.ownerId === owner.id);

        return Array.from({ length: 12 }, (_, monthIndex) => {
            const payment = ownerPayments.find(p => p.month === monthIndex);
            return {
                label: new Date(selectedYear, monthIndex).toLocaleString('default', { month: 'short' }),
                value: payment?.amountPaid || 0,
            };
        });
    }, [selectedProperty, getPaymentsForYear, selectedYear, owner.id]);
    
    // FIX: Use 't' function with replacements instead of string.replace().
    const title = t('monthly_payments_for_owner', { owner: owner.fullName });

    const hasData = useMemo(() => chartData.some(d => d.value > 0), [chartData]);

    if (!hasData) {
        return <p className="text-center text-gray-500 dark:text-gray-400 py-8">{t('no_data_for_selection')}</p>
    }

    return (
        <BarChart title={title} data={chartData} />
    );
};

export default MonthlyPaymentsForOwnerChart;
