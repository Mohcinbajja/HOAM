import React, { useMemo } from 'react';
import { useData } from '../../../contexts/DataContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import Card from '../../ui/Card';

interface CategoryPerformanceChartProps {
    selectedYear: number;
}

const CategoryPerformanceChart: React.FC<CategoryPerformanceChartProps> = ({ selectedYear }) => {
    const { t, language } = useLanguage();
    const { selectedProperty, getExpenseCategoriesForProperty, getMonthlyOutcomesForYear } = useData();

    const chartData = useMemo(() => {
        if (!selectedProperty) return [];
        const activeCategories = getExpenseCategoriesForProperty(selectedProperty.id);
        const outcomes = getMonthlyOutcomesForYear(selectedProperty.id, selectedYear);

        return activeCategories.map(category => {
            const totalSpent = outcomes
                .filter(o => o.categoryId === category.id && o.isConfirmed)
                .reduce((sum, o) => sum + o.amount, 0);
            return { name: category.name, spent: totalSpent };
        }).sort((a, b) => b.spent - a.spent);

    }, [selectedProperty, getExpenseCategoriesForProperty, getMonthlyOutcomesForYear, selectedYear]);

    const maxValue = useMemo(() => {
        if (chartData.length === 0) return 1;
        const max = Math.max(...chartData.map(d => d.spent));
        return max === 0 ? 1 : max;
    }, [chartData]);
    
    const formatCurrency = (amount: number) => new Intl.NumberFormat(language, { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

    return (
        <Card title={t('outcome_by_category')}>
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
        </Card>
    );
};

export default CategoryPerformanceChart;
