import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import ModuleWithTabs from './ModuleWithTabs';
import IncomeMatrix from './IncomeMatrix';
import AuditTrail from './AuditTrail';
import YearlyView from './YearlyView';
import AnalyticsDashboard from './AnalyticsDashboard';
import SelectYearPrompt from '../ui/SelectYearPrompt';
import FeePolicies from './FeePolicies';

interface RegularIncomeProps {
    selectedYear: number | null;
    onGenerateReport: (props: any) => void;
}

const RegularIncome: React.FC<RegularIncomeProps> = ({ selectedYear, onGenerateReport }) => {
    const { t } = useLanguage();

    if (selectedYear === null) {
        return <SelectYearPrompt />;
    }

    const tabs = [
        { name: t('fee_policies'), content: <FeePolicies selectedYear={selectedYear} /> },
        { name: t('monthly'), content: (
            <div className="space-y-8">
                <IncomeMatrix selectedYear={selectedYear} onGenerateReport={onGenerateReport} />
                <AuditTrail selectedYear={selectedYear} />
            </div>
        ) },
        { name: t('yearly_view'), content: <YearlyView /> },
        { name: t('analytic_charts'), content: <AnalyticsDashboard selectedYear={selectedYear} /> },
    ];

    return (
        <ModuleWithTabs
            tabs={tabs}
            variant="secondary"
        />
    );
};

export default RegularIncome;