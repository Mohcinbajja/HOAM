import React, { useMemo } from 'react';
import { useData } from '../../../contexts/DataContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { AmountType, PaymentStatus } from '../../../types';
import Card from '../../ui/Card';

interface MonthlyPerformanceChartProps {
    selectedYear: number;
}

const MonthlyPerformanceChart: React.FC<MonthlyPerformanceChartProps> = ({ selectedYear }) => {
    const { t, language } = useLanguage();
    const { selectedProperty, owners, units, unitTypes, getPaymentsForYear, getUnitTypeFeePolicy } = useData();
    const currency = selectedProperty?.details.currency || 'USD';

    const chartData = useMemo(() => {
        if (!selectedProperty) return [];
        const activeOwners = owners.filter(o => o.propertyId === selectedProperty.id && o.isActive);
        const payments = getPaymentsForYear(selectedProperty.id, selectedYear);
        const now = new Date();

        const data = Array.from({ length: 12 }, (_, monthIndex) => {
            const monthName = new Date(selectedYear, monthIndex).toLocaleString(language, { month: 'short' });
            let totalPaid = 0;
            let totalDeficit = 0;
            
            const isPastMonth = selectedYear < now.getFullYear() || (selectedYear === now.getFullYear() && monthIndex < now.getMonth());

            activeOwners.forEach(owner => {
                const ownerUnits = units.filter(u => u.ownerId === owner.id);
                const ownerUnitType = unitTypes.find(ut => ownerUnits.some(ou => ou.unitTypeId === ut.id));
                
                // FIX: Get base fee from fee policy instead of non-existent 'monthlyFee' property.
                const policy = ownerUnitType ? getUnitTypeFeePolicy(selectedProperty.id, selectedYear, ownerUnitType.id) : undefined;
                const baseMonthlyFee = policy?.baseFee || 0;
                
                const payment = payments.find(p => p.ownerId === owner.id && p.month === monthIndex);
                const amountPaid = payment?.amountPaid || 0;
                totalPaid += amountPaid;

                if (isPastMonth && payment?.status !== PaymentStatus.PAUSED) {
                    let adjustedDue = baseMonthlyFee;
                    if (policy && policy.penalty.amount > 0) {
                        adjustedDue += policy.penalty.type === AmountType.FIXED
                            ? policy.penalty.amount
                            : baseMonthlyFee * (policy.penalty.amount / 100);
                    }
                    if (adjustedDue > amountPaid) {
                        totalDeficit += adjustedDue - amountPaid;
                    }
                }
            });

            return { month: monthName, paid: totalPaid, deficit: totalDeficit };
        });
        return data;
    }, [selectedProperty, owners, units, unitTypes, getPaymentsForYear, selectedYear, language, getUnitTypeFeePolicy]);

    const maxValue = useMemo(() => {
        if (chartData.length === 0) return 1;
        const max = Math.max(...chartData.map(d => d.paid + d.deficit));
        return max === 0 ? 1 : max;
    }, [chartData]);

    const formatCurrency = (amount: number) => new Intl.NumberFormat(language, { notation: 'compact', compactDisplay: 'short' }).format(amount);

    return (
        <Card title={t('monthly_balance')}>
            <div className="w-full h-72 flex flex-col">
                <div className="flex-grow flex items-end justify-around space-x-2 pt-4 border-b border-gray-200 dark:border-gray-700">
                    {chartData.map(({ month, paid, deficit }) => {
                        const total = paid + deficit;
                        const paidHeight = total > 0 ? `${(paid / total) * 100}%` : '0%';
                        const deficitHeight = total > 0 ? `${(deficit / total) * 100}%` : '0%';
                        const barContainerHeight = `${(total / maxValue) * 100}%`;
                        
                        return (
                            <div key={month} className="flex-1 flex flex-col items-center h-full group" style={{ minWidth: '20px' }}>
                                <div className="relative w-full flex-grow flex items-end">
                                    <div className="w-full rounded-t-md overflow-hidden transition-all duration-300 hover:shadow-lg" style={{ height: barContainerHeight }}>
                                        <div 
                                            className="w-full bg-red-400 dark:bg-red-600"
                                            style={{ height: deficitHeight }}
                                            title={`${t('deficit')}: ${formatCurrency(deficit)}`}
                                        />
                                        <div 
                                            className="w-full bg-green-400 dark:bg-green-600"
                                            style={{ height: paidHeight }}
                                            title={`${t('paid')}: ${formatCurrency(paid)}`}
                                        />
                                    </div>
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded py-1 px-2 pointer-events-none whitespace-nowrap">
                                        {formatCurrency(total)}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="w-full flex justify-around space-x-2 mt-2">
                    {chartData.map(({ month }) => (
                         <div key={month} className="flex-1 text-center text-xs text-gray-600 dark:text-gray-400 font-medium">
                            {month}
                        </div>
                    ))}
                </div>
            </div>
             <div className="mt-4 flex justify-center items-center space-x-4 text-sm">
                <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-green-400 dark:bg-green-600 mr-2"></span>
                    <span>{t('paid')}</span>
                </div>
                <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-red-400 dark:bg-red-600 mr-2"></span>
                    <span>{t('deficit')}</span>
                </div>
            </div>
        </Card>
    );
};

export default MonthlyPerformanceChart;
