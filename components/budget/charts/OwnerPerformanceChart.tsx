import React, { useMemo } from 'react';
import { useData } from '../../../contexts/DataContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import Card from '../../ui/Card';

interface OwnerPerformanceChartProps {
    selectedYear: number;
}

const OwnerPerformanceChart: React.FC<OwnerPerformanceChartProps> = ({ selectedYear }) => {
    const { t, language } = useLanguage();
    const { selectedProperty, owners, getPaymentsForYear } = useData();
    const currency = selectedProperty?.details.currency || 'USD';

    const chartData = useMemo(() => {
        if (!selectedProperty) return [];
        const activeOwners = owners.filter(o => o.propertyId === selectedProperty.id && o.isActive);
        const payments = getPaymentsForYear(selectedProperty.id, selectedYear);

        return activeOwners.map(owner => {
            const totalPaid = payments
                .filter(p => p.ownerId === owner.id)
                .reduce((sum, p) => sum + p.amountPaid, 0);
            return { name: owner.fullName, paid: totalPaid };
        }).sort((a, b) => b.paid - a.paid); // Sort from highest to lowest paid

    }, [selectedProperty, owners, getPaymentsForYear, selectedYear]);

    const maxValue = useMemo(() => {
        if (chartData.length === 0) return 1;
        const max = Math.max(...chartData.map(d => d.paid));
        return max === 0 ? 1 : max;
    }, [chartData]);
    
    const formatCurrency = (amount: number) => new Intl.NumberFormat(language, { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

    return (
        <Card title={`${t('income')} by ${t('owner')}`}>
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
        </Card>
    );
};

export default OwnerPerformanceChart;