import React, { useMemo } from 'react';
import { useData } from '../../../contexts/DataContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import BarChart from '../../ui/BarChart';
import { ExpenseCategory } from '../../../types';

interface YearlyExpensesForCategoryChartProps {
    category: ExpenseCategory;
}

const YearlyExpensesForCategoryChart: React.FC<YearlyExpensesForCategoryChartProps> = ({ category }) => {
    const { t } = useLanguage();
    const { selectedProperty, monthlyOutcomes } = useData();

    const chartData = useMemo(() => {
        if (!selectedProperty) return [];
        const categoryOutcomes = monthlyOutcomes.filter(o => o.propertyId === selectedProperty.id && o.categoryId === category.id && o.isConfirmed);
        
        const yearlyTotals = categoryOutcomes.reduce((acc, outcome) => {
            acc[outcome.year] = (acc[outcome.year] || 0) + outcome.amount;
            return acc;
        }, {} as Record<number, number>);

        return Object.entries(yearlyTotals)
            .sort(([yearA], [yearB]) => parseInt(yearA) - parseInt(yearB))
            .map(([year, total]) => ({
                label: year,
                value: total,
            }));
    }, [selectedProperty, monthlyOutcomes, category.id]);
    
    const title = t('yearly_expenses_for_category', { category: category.name });
    const hasData = useMemo(() => chartData.some(d => d.value > 0), [chartData]);

    if (!hasData) {
        return <p className="text-center text-gray-500 dark:text-gray-400 py-8">{t('no_data_for_selection')}</p>
    }

    return (
        <BarChart title={title} data={chartData} />
    );
};

export default YearlyExpensesForCategoryChart;