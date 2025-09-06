import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useData } from '../../contexts/DataContext';
import Card from '../ui/Card';
import { ExpenseCategory } from '../../types';
import MonthlyExpensesForCategoryChart from './charts/MonthlyExpensesForCategoryChart';
import ExpensesByCategoryForMonthChart from './charts/ExpensesByCategoryForMonthChart';
import CategoryPerformanceChart from './charts/CategoryPerformanceChart';
import YearlyExpensesForCategoryChart from './charts/YearlyExpensesForCategoryChart';

interface OutcomeAnalyticsDashboardProps {
    selectedYear: number;
}

const OutcomeAnalyticsDashboard: React.FC<OutcomeAnalyticsDashboardProps> = ({ selectedYear }) => {
    const { t, language } = useLanguage();
    const { selectedProperty, getExpenseCategoriesForProperty } = useData();

    // Monthly state
    const [monthlyViewBy, setMonthlyViewBy] = useState<'month' | 'category'>('month');
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
    const [selectedCategoryIdMonthly, setSelectedCategoryIdMonthly] = useState<string | null>(null);

    // Yearly state
    const [yearlyViewBy, setYearlyViewBy] = useState<'all_categories' | 'single_category'>('all_categories');
    const [selectedCategoryIdYearly, setSelectedCategoryIdYearly] = useState<string | null>(null);

    const activeCategories = useMemo(() => {
        if (!selectedProperty) return [];
        return getExpenseCategoriesForProperty(selectedProperty.id).sort((a,b) => a.name.localeCompare(b.name));
    }, [getExpenseCategoriesForProperty, selectedProperty]);

    // Set default selected category if not set
    useEffect(() => {
        if (activeCategories.length > 0) {
            if (!selectedCategoryIdMonthly) {
                setSelectedCategoryIdMonthly(activeCategories[0].id);
            }
            if (!selectedCategoryIdYearly) {
                setSelectedCategoryIdYearly(activeCategories[0].id);
            }
        }
    }, [activeCategories, selectedCategoryIdMonthly, selectedCategoryIdYearly]);

    const monthOptions = useMemo(() => {
        return Array.from({ length: 12 }, (_, i) => ({
            value: i,
            label: new Date(selectedYear, i).toLocaleString(language, { month: 'long' }),
        }));
    }, [selectedYear, language]);

    const selectedCategoryMonthly = useMemo(() => activeCategories.find(c => c.id === selectedCategoryIdMonthly), [activeCategories, selectedCategoryIdMonthly]);
    const selectedCategoryYearly = useMemo(() => activeCategories.find(c => c.id === selectedCategoryIdYearly), [activeCategories, selectedCategoryIdYearly]);
    
    const selectClasses = "px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";

    return (
        <div className="space-y-8">
            <Card title={t('monthly_analysis_for_year', { year: selectedYear })}>
                <div className="flex flex-wrap items-center gap-4 mb-6 p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <span className="text-sm font-medium">{t('view_by')}:</span>
                    <div className="flex items-center gap-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="radio" name="monthlyView" value="month" checked={monthlyViewBy === 'month'} onChange={() => setMonthlyViewBy('month')} className="form-radio text-blue-600" />
                            <span>{t('by_month')}</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="radio" name="monthlyView" value="category" checked={monthlyViewBy === 'category'} onChange={() => setMonthlyViewBy('category')} className="form-radio text-blue-600" />
                            <span>{t('by_category')}</span>
                        </label>
                    </div>
                    {monthlyViewBy === 'month' && (
                        <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} className={selectClasses}>
                            {monthOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    )}
                    {monthlyViewBy === 'category' && (
                        <select value={selectedCategoryIdMonthly ?? ''} onChange={e => setSelectedCategoryIdMonthly(e.target.value)} className={selectClasses}>
                            <option value="" disabled>{t('select_a_category')}</option>
                            {activeCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    )}
                </div>
                {monthlyViewBy === 'month' && <ExpensesByCategoryForMonthChart selectedYear={selectedYear} selectedMonth={selectedMonth} />}
                {monthlyViewBy === 'category' && selectedCategoryMonthly && <MonthlyExpensesForCategoryChart selectedYear={selectedYear} category={selectedCategoryMonthly} />}
            </Card>

            <Card title={t('yearly_analysis')}>
                 <div className="flex flex-wrap items-center gap-4 mb-6 p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <span className="text-sm font-medium">{t('view_by')}:</span>
                    <div className="flex items-center gap-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="radio" name="yearlyView" value="all_categories" checked={yearlyViewBy === 'all_categories'} onChange={() => setYearlyViewBy('all_categories')} className="form-radio text-blue-600" />
                            <span>{t('all_categories_for_year')}</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="radio" name="yearlyView" value="single_category" checked={yearlyViewBy === 'single_category'} onChange={() => setYearlyViewBy('single_category')} className="form-radio text-blue-600" />
                            <span>{t('single_category_across_years')}</span>
                        </label>
                    </div>
                    {yearlyViewBy === 'single_category' && (
                        <select value={selectedCategoryIdYearly ?? ''} onChange={e => setSelectedCategoryIdYearly(e.target.value)} className={selectClasses}>
                            <option value="" disabled>{t('select_a_category')}</option>
                            {activeCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    )}
                </div>
                {yearlyViewBy === 'all_categories' && <CategoryPerformanceChart selectedYear={selectedYear} />}
                {yearlyViewBy === 'single_category' && selectedCategoryYearly && <YearlyExpensesForCategoryChart category={selectedCategoryYearly} />}
            </Card>
        </div>
    );
};

export default OutcomeAnalyticsDashboard;