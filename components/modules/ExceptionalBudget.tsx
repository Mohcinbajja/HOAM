import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useData } from '../../contexts/DataContext';
import ProjectList from '../exceptional-budget/ProjectList';
import ProjectView from '../exceptional-budget/ProjectView';
import SelectYearPrompt from '../ui/SelectYearPrompt';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import ReportModal from '../reports/ReportModal';

const ExceptionalBudget: React.FC = () => {
    const { t } = useLanguage();
    const { selectedProperty } = useData();
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [viewingProjectId, setViewingProjectId] = useState<string | null>(null);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

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

    const handleProjectSelect = (projectId: string) => {
        setViewingProjectId(projectId);
    };

    const handleBackToList = () => {
        setViewingProjectId(null);
    };

    if (viewingProjectId) {
        return <ProjectView projectId={viewingProjectId} onBack={handleBackToList} />;
    }

    return (
        <>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                    <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">{t('module_exceptionalbudget')}</h3>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="secondary"
                            onClick={() => setIsReportModalOpen(true)}
                            disabled={!selectedYear}
                            title={t('print_report')}
                        >
                            <Icon name="print" className="h-5 w-5 mr-2" />
                            {t('report')}
                        </Button>
                        <div>
                            <label htmlFor="year-select-ex" className="sr-only">{t('select_year')}</label>
                            <select
                                id="year-select-ex"
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

                {selectedYear !== null ? (
                    <ProjectList selectedYear={selectedYear} onProjectSelect={handleProjectSelect} />
                ) : (
                    <SelectYearPrompt />
                )}
            </div>
            {isReportModalOpen && selectedYear && (
                <ReportModal
                    isOpen={isReportModalOpen}
                    onClose={() => setIsReportModalOpen(false)}
                    reportKey="report_exceptional_budget"
                    year={selectedYear}
                />
            )}
        </>
    );
};

export default ExceptionalBudget;