import React, { useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Card from '../ui/Card';
import BarChart from '../ui/BarChart';

const OutcomeYearlyView: React.FC = () => {
    const { t, language } = useLanguage();
    const { selectedProperty, expenseCategories, monthlyOutcomes } = useData();

    const yearlyData = useMemo(() => {
        if (!selectedProperty) return null;

        const propertyOutcomes = monthlyOutcomes.filter(o => o.propertyId === selectedProperty.id && o.isConfirmed);
        if (propertyOutcomes.length === 0) return null;

        const activeCategories = expenseCategories.filter(c => c.propertyId === selectedProperty.id && !c.isArchived);
        const years = [...new Set(propertyOutcomes.map(o => o.year))].sort((a, b) => a - b);

        const tableData = activeCategories.map(category => {
            const yearlyTotals = years.reduce((acc, year) => {
                acc[year] = 0;
                return acc;
            }, {} as { [key: number]: number });

            let grandTotal = 0;
            propertyOutcomes
                .filter(o => o.categoryId === category.id)
                .forEach(o => {
                    yearlyTotals[o.year] += o.amount;
                    grandTotal += o.amount;
                });
            
            return {
                categoryName: category.name,
                yearlyTotals,
                grandTotal
            };
        }).sort((a, b) => a.categoryName.localeCompare(b.categoryName));

        const footerTotals = years.reduce((acc, year) => {
            acc[year] = tableData.reduce((sum, row) => sum + row.yearlyTotals[year], 0);
            return acc;
        }, {} as { [key: number]: number });
        
        const footerGrandTotal = Object.values(footerTotals).reduce((sum, total) => sum + total, 0);
        
        const chartData = years.map(year => ({
            label: year.toString(),
            value: footerTotals[year]
        }));

        return { years, tableData, footerTotals, footerGrandTotal, chartData };
    }, [selectedProperty, monthlyOutcomes, expenseCategories]);

    if (!yearlyData) {
        return (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                {t('no_yearly_data')}
            </div>
        );
    }
    
    const { years, tableData, footerTotals, footerGrandTotal, chartData } = yearlyData;
    const formatCurrency = (amount: number) => new Intl.NumberFormat(language, { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
    
    return (
        <div className="space-y-8">
            <Card title={t('outcome_matrix')}>
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="sticky left-0 bg-gray-100 dark:bg-gray-700 px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('expense_category')}</th>
                                {years.map(year => (
                                    <th key={year} className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{year}</th>
                                ))}
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('grand_total')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {tableData.map(row => (
                                <tr key={row.categoryName}>
                                    <td className="sticky left-0 bg-white dark:bg-gray-800 px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{row.categoryName}</td>
                                    {years.map(year => (
                                        <td key={year} className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-300">{formatCurrency(row.yearlyTotals[year])}</td>
                                    ))}
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-semibold text-gray-800 dark:text-gray-100">{formatCurrency(row.grandTotal)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-100 dark:bg-gray-700 font-bold">
                            <tr>
                                <td className="sticky left-0 bg-gray-100 dark:bg-gray-700 px-3 py-2 text-left text-xs uppercase text-gray-600 dark:text-gray-200">{t('total')}</td>
                                {years.map(year => (
                                    <td key={year} className="px-3 py-2 text-right text-sm text-gray-800 dark:text-gray-100">{formatCurrency(footerTotals[year])}</td>
                                ))}
                                <td className="px-3 py-2 text-right text-sm text-gray-800 dark:text-gray-100">{formatCurrency(footerGrandTotal)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </Card>
            <BarChart title={t('total_outcome_by_year')} data={chartData} />
        </div>
    );
};

export default OutcomeYearlyView;
