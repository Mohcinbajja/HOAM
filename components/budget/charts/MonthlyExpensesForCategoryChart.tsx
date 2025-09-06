import React, { useMemo } from 'react';
import { useData } from '../../../contexts/DataContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import BarChart from '../../ui/BarChart';
import { ExpenseCategory } from '../../../types';

interface MonthlyExpensesForCategoryChartProps {
    selectedYear: number;
    category: ExpenseCategory;
}

const MonthlyExpensesForCategoryChart: React.FC<MonthlyExpensesForCategoryChartProps> = ({ selectedYear, category }) => {
    const { t } = useLanguage();
    const { selectedProperty, getMonthlyOutcomesForYear } = useData();

    const chartData = useMemo(() => {
        if (!selectedProperty) return [];
        const outcomes = getMonthlyOutcomesForYear(selectedProperty.id, selectedYear);
        const categoryOutcomes = outcomes.filter(o => o.categoryId === category.id && o.isConfirmed);

        return Array.from({ length: 12 }, (_, monthIndex) => {
            const outcome = categoryOutcomes.find(o => o.month === monthIndex);
            return {
                label: new Date(selectedYear, monthIndex).toLocaleString('default', { month: 'short' }),
                value: outcome?.amount || 0,
            };
        });
    }, [selectedProperty, getMonthlyOutcomesForYear, selectedYear, category.id]);
    
    const title = t('monthly_expenses_for_category', { category: category.name });
    const hasData = useMemo(() => chartData.some(d => d.value > 0), [chartData]);

    if (!hasData) {
        return <p className="text-center text-gray-500 dark:text-gray-400 py-8">{t('no_data_for_selection')}</p>
    }

    return (
        <BarChart title={title} data={chartData} />
    );
};

export default MonthlyExpensesForCategoryChart;