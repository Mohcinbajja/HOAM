import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useData } from '../../contexts/DataContext';
import Card from '../ui/Card';
import PaymentsByOwnerForMonthChart from './charts/PaymentsByOwnerForMonthChart';
import MonthlyPaymentsForOwnerChart from './charts/MonthlyPaymentsForOwnerChart';
import OwnerPerformanceChart from './charts/OwnerPerformanceChart';
import YearlyPaymentsForOwnerChart from './charts/YearlyPaymentsForOwnerChart';
import { Owner } from '../../types';

interface AnalyticsDashboardProps {
    selectedYear: number;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ selectedYear }) => {
    const { t, language } = useLanguage();
    const { selectedProperty, owners } = useData();

    // Monthly state
    const [monthlyViewBy, setMonthlyViewBy] = useState<'month' | 'owner'>('month');
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
    const [selectedOwnerIdMonthly, setSelectedOwnerIdMonthly] = useState<string | null>(null);

    // Yearly state
    const [yearlyViewBy, setYearlyViewBy] = useState<'all_owners' | 'single_owner'>('all_owners');
    const [selectedOwnerIdYearly, setSelectedOwnerIdYearly] = useState<string | null>(null);

    const activeOwners = useMemo(() => {
        if (!selectedProperty) return [];
        return owners.filter(o => o.propertyId === selectedProperty.id && o.isActive).sort((a,b) => a.fullName.localeCompare(b.fullName));
    }, [owners, selectedProperty]);

    // Set default selected owner if not set
    useEffect(() => {
        if (activeOwners.length > 0) {
            if (!selectedOwnerIdMonthly) {
                setSelectedOwnerIdMonthly(activeOwners[0].id);
            }
            if (!selectedOwnerIdYearly) {
                setSelectedOwnerIdYearly(activeOwners[0].id);
            }
        }
    }, [activeOwners, selectedOwnerIdMonthly, selectedOwnerIdYearly]);

    const monthOptions = useMemo(() => {
        return Array.from({ length: 12 }, (_, i) => ({
            value: i,
            label: new Date(selectedYear, i).toLocaleString(language, { month: 'long' }),
        }));
    }, [selectedYear, language]);

    const selectedOwnerMonthly = useMemo(() => activeOwners.find(o => o.id === selectedOwnerIdMonthly), [activeOwners, selectedOwnerIdMonthly]);
    const selectedOwnerYearly = useMemo(() => activeOwners.find(o => o.id === selectedOwnerIdYearly), [activeOwners, selectedOwnerIdYearly]);
    
    const selectClasses = "px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";

    return (
        <div className="space-y-8">
            {/* FIX: Use 't' function with replacements instead of string.replace(). */}
            <Card title={t('monthly_analysis_for_year', { year: selectedYear })}>
                <div className="flex flex-wrap items-center gap-4 mb-6 p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <span className="text-sm font-medium">{t('view_by')}:</span>
                    <div className="flex items-center gap-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="radio" name="monthlyView" value="month" checked={monthlyViewBy === 'month'} onChange={() => setMonthlyViewBy('month')} className="form-radio text-blue-600" />
                            <span>{t('by_month')}</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="radio" name="monthlyView" value="owner" checked={monthlyViewBy === 'owner'} onChange={() => setMonthlyViewBy('owner')} className="form-radio text-blue-600" />
                            <span>{t('by_owner')}</span>
                        </label>
                    </div>
                    {monthlyViewBy === 'month' && (
                        <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} className={selectClasses}>
                            {monthOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    )}
                    {monthlyViewBy === 'owner' && (
                        <select value={selectedOwnerIdMonthly ?? ''} onChange={e => setSelectedOwnerIdMonthly(e.target.value)} className={selectClasses}>
                            <option value="" disabled>{t('select_an_owner')}</option>
                            {activeOwners.map(o => <option key={o.id} value={o.id}>{o.fullName}</option>)}
                        </select>
                    )}
                </div>
                {monthlyViewBy === 'month' && <PaymentsByOwnerForMonthChart selectedYear={selectedYear} selectedMonth={selectedMonth} />}
                {monthlyViewBy === 'owner' && selectedOwnerMonthly && <MonthlyPaymentsForOwnerChart selectedYear={selectedYear} owner={selectedOwnerMonthly} />}
            </Card>

            <Card title={t('yearly_analysis')}>
                 <div className="flex flex-wrap items-center gap-4 mb-6 p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <span className="text-sm font-medium">{t('view_by')}:</span>
                    <div className="flex items-center gap-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="radio" name="yearlyView" value="all_owners" checked={yearlyViewBy === 'all_owners'} onChange={() => setYearlyViewBy('all_owners')} className="form-radio text-blue-600" />
                            <span>{t('all_owners')} ({selectedYear})</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="radio" name="yearlyView" value="single_owner" checked={yearlyViewBy === 'single_owner'} onChange={() => setYearlyViewBy('single_owner')} className="form-radio text-blue-600" />
                            <span>{t('single_owner_across_years')}</span>
                        </label>
                    </div>
                    {yearlyViewBy === 'single_owner' && (
                        <select value={selectedOwnerIdYearly ?? ''} onChange={e => setSelectedOwnerIdYearly(e.target.value)} className={selectClasses}>
                            <option value="" disabled>{t('select_an_owner')}</option>
                            {activeOwners.map(o => <option key={o.id} value={o.id}>{o.fullName}</option>)}
                        </select>
                    )}
                </div>
                {yearlyViewBy === 'all_owners' && <OwnerPerformanceChart selectedYear={selectedYear} />}
                {yearlyViewBy === 'single_owner' && selectedOwnerYearly && <YearlyPaymentsForOwnerChart owner={selectedOwnerYearly} />}
            </Card>
        </div>
    );
};

export default AnalyticsDashboard;