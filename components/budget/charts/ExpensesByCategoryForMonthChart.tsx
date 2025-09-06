import React, { useMemo } from 'react';
import { useData } from '../../../contexts/DataContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import Card from '../../ui/Card';

interface ExpensesByCategoryForMonthChartProps {
    selectedYear: number;
    selectedMonth: number;
}

const ExpensesByCategoryForMonthChart: React.FC<ExpensesByCategoryForMonthChartProps> = ({ selectedYear, selectedMonth }) => {
    const { t, language } = useLanguage();
    const { selectedProperty, getExpenseCategoriesForProperty, getMonthlyOutcomesForYear } = useData();
    
    const monthName = new Date(selectedYear, selectedMonth).toLocaleString(language, { month: 'long' });

    const chartData = useMemo(() => {
        if (!selectedProperty) return [];
        const activeCategories = getExpenseCategoriesForProperty(selectedProperty.id);
        const outcomes = getMonthlyOutcomesForYear(selectedProperty.id, selectedYear);

        return activeCategories.map(category => {
            const outcome = outcomes.find(o => o.categoryId === category.id && o.month === selectedMonth && o.isConfirmed);
            const amount = outcome?.amount || 0;
            return { name: category.name, spent: amount };
        }).filter(d => d.spent > 0)
          .sort((a, b) => b.spent - a.spent);

    }, [selectedProperty, getExpenseCategoriesForProperty, getMonthlyOutcomesForYear, selectedYear, selectedMonth]);

    const maxValue = useMemo(() => {
        if (chartData.length === 0) return 1;
        const max = Math.max(...chartData.map(d => d.spent));
        return max === 0 ? 1 : max;
    }, [chartData]);
    
    const formatCurrency = (amount: number) => new Intl.NumberFormat(language, { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
    
    // FIX: Use 't' function with replacements instead of string.replace().
    const title = t('expenses_by_category_for_month', { month: monthName });

    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{title}</h3>
            {chartData.length > 0 ? (
                <div className="space-y-3 pr-4" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {chartData.map(({ name, spent }) => {
                        const barWidth = `${(spent / maxValue) * 100}%`;
                        return (
                            <div key={name} className="flex items-center group">
                                <div className="w-1/3 text-sm font-medium text-gray-700 dark:text-gray-300 truncate pr-2" title={name}>
                                    {name}
                                </div>
                                <div className="w-2/3">
                                    <div className="flex items-center">
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-5">
                                            <div 
                                                className="bg-red-500 h-5 rounded-full hover:bg-red-600 transition-colors"
                                                style={{ width: barWidth }}
                                            />
                                        </div>
                                        <span className="ml-3 text-sm font-semibold text-gray-800 dark:text-gray-100 whitespace-nowrap">
                                            {formatCurrency(spent)}
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

export default ExpensesByCategoryForMonthChart;
