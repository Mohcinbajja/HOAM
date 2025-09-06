import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import ModuleWithTabs from '../budget/ModuleWithTabs';
import RegularIncome from '../budget/RegularIncome';
import RegularOutcome from '../budget/RegularOutcome';
import RegularBalance from '../budget/RegularBalance';
import { useData } from '../../contexts/DataContext';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import ReportModal from '../reports/ReportModal';

const RegularBudget: React.FC = () => {
    const { t } = useLanguage();
    const { selectedProperty } = useData();
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [reportModalProps, setReportModalProps] = useState<any | null>(null);

    const tabs = [
        { name: t('income'), content: <RegularIncome selectedYear={selectedYear} onGenerateReport={setReportModalProps} /> },
        { name: t('outcome'), content: <RegularOutcome selectedYear={selectedYear} onGenerateReport={setReportModalProps} /> },
        { name: t('balance'), content: <RegularBalance selectedYear={selectedYear} /> },
    ];

    const generateYearOptions = () => {
        const constructionYear = selectedProperty?.details.constructionDate ? new Date(selectedProperty.details.constructionDate).getFullYear() : new Date().getFullYear() - 10;
        const currentYear = new Date().getFullYear();
        const futureYears = selectedProperty?.details.budgetFutureYears || 3;
        const years = [];
        for (let y = currentYear + futureYears; y >= constructionYear; y--) {
            years.push(y);
        }
        return years;
    };

    return (
        <>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                    <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">{t('module_regularbudget')}</h3>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="secondary"
                            onClick={() => setReportModalProps({ reportKey: 'report_regular_budget', year: selectedYear, view: 'full_year_summary' })}
                            disabled={!selectedYear}
                            title={t('print_report')}
                        >
                            <Icon name="print" className="h-5 w-5 mr-2" />
                            {t('report')}
                        </Button>
                        <div>
                            <label htmlFor="year-select" className="sr-only">{t('select_year')}</label>
                            <select
                                id="year-select"
                                value={selectedYear ?? ''}
                                onChange={e => setSelectedYear(e.target.value ? parseInt(e.target.value, 10) : null)}
                                className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                                <option value="" disabled>{t('select_year')}</option>
                                {generateYearOptions().map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <ModuleWithTabs
                    tabs={tabs}
                />
            </div>
            {reportModalProps && (
                <ReportModal
                    isOpen={!!reportModalProps}
                    onClose={() => setReportModalProps(null)}
                    {...reportModalProps}
                />
            )}
        </>
    );
};

export default RegularBudget;