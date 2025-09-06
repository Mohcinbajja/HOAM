import React, { useMemo } from 'react';
import { useData } from '../../../contexts/DataContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import BarChart from '../../ui/BarChart';
import { Owner } from '../../../types';

interface YearlyPaymentsForOwnerChartProps {
    owner: Owner;
}

const YearlyPaymentsForOwnerChart: React.FC<YearlyPaymentsForOwnerChartProps> = ({ owner }) => {
    const { t } = useLanguage();
    const { selectedProperty, monthlyPayments } = useData();

    const chartData = useMemo(() => {
        if (!selectedProperty) return [];
        const ownerPayments = monthlyPayments.filter(p => p.propertyId === selectedProperty.id && p.ownerId === owner.id);
        
        const yearlyTotals = ownerPayments.reduce((acc, payment) => {
            acc[payment.year] = (acc[payment.year] || 0) + payment.amountPaid;
            return acc;
        }, {} as Record<number, number>);

        return Object.entries(yearlyTotals)
            .sort(([yearA], [yearB]) => parseInt(yearA) - parseInt(yearB))
            .map(([year, total]) => ({
                label: year,
                value: total,
            }));
    }, [selectedProperty, monthlyPayments, owner.id]);
    
    // FIX: Use 't' function with replacements instead of string.replace().
    const title = t('yearly_payments_for_owner', { owner: owner.fullName });

    const hasData = useMemo(() => chartData.some(d => d.value > 0), [chartData]);

    if (!hasData) {
        return <p className="text-center text-gray-500 dark:text-gray-400 py-8">{t('no_data_for_selection')}</p>
    }

    return (
        <BarChart title={title} data={chartData} />
    );
};

export default YearlyPaymentsForOwnerChart;
