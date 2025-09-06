import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import ModuleWithTabs from './ModuleWithTabs';
import SelectYearPrompt from '../ui/SelectYearPrompt';
import OutcomeMatrix from './OutcomeMatrix';
import OutcomeAuditTrail from './OutcomeAuditTrail';
import OutcomeYearlyView from './OutcomeYearlyView';
import OutcomeAnalyticsDashboard from './OutcomeAnalyticsDashboard';

interface RegularOutcomeProps {
    selectedYear: number | null;
    onGenerateReport: (props: any) => void;
}

const RegularOutcome: React.FC<RegularOutcomeProps> = ({ selectedYear, onGenerateReport }) => {
    const { t } = useLanguage();

    if (selectedYear === null) {
        return <SelectYearPrompt />;
    }
    
    const tabs = [
        { name: t('monthly'), content: (
            <div className="space-y-8">
                <OutcomeMatrix selectedYear={selectedYear} onGenerateReport={onGenerateReport} />
                <OutcomeAuditTrail selectedYear={selectedYear} />
            </div>
        ) },
        { name: t('yearly_view'), content: <OutcomeYearlyView /> },
        { name: t('analytic_charts'), content: <OutcomeAnalyticsDashboard selectedYear={selectedYear} /> },
    ];


    return (
        <ModuleWithTabs
            tabs={tabs}
            variant="secondary"
        />
    );
};

export default RegularOutcome;