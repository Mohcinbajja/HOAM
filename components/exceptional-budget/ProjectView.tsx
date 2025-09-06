import React, { useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Icon from '../ui/Icon';
import Button from '../ui/Button';
import ModuleWithTabs from '../budget/ModuleWithTabs';
import IncomeTab from './IncomeTab';
import OutcomeTab from './OutcomeTab';
import BalanceTab from './BalanceTab';

interface ProjectViewProps {
    projectId: string;
    onBack: () => void;
}

const ProjectView: React.FC<ProjectViewProps> = ({ projectId, onBack }) => {
    const { t, language } = useLanguage();
    const { selectedProperty, exceptionalProjects, exceptionalContributions, externalContributors, exceptionalOutcomes } = useData();
    const currency = selectedProperty?.details.currency || 'USD';

    const project = useMemo(() => {
        return exceptionalProjects.find(p => p.id === projectId);
    }, [projectId, exceptionalProjects]);

    const { totalIncome, totalOutcome, balance } = useMemo(() => {
        const incomeFromOwners = exceptionalContributions
            .filter(c => c.projectId === projectId)
            .reduce((sum, c) => sum + c.paidAmount, 0);
        const incomeFromExternal = externalContributors
            .filter(c => c.projectId === projectId)
            .reduce((sum, c) => sum + c.paidAmount, 0);
        const totalIncome = incomeFromOwners + incomeFromExternal;
        
        const totalOutcome = exceptionalOutcomes
            .filter(o => o.projectId === projectId && o.isConfirmed)
            .reduce((sum, o) => sum + o.amount, 0);
            
        return { totalIncome, totalOutcome, balance: totalIncome - totalOutcome };
    }, [projectId, exceptionalContributions, externalContributors, exceptionalOutcomes]);

    const formatCurrency = (amount: number) => new Intl.NumberFormat(language, { style: 'currency', currency }).format(amount);

    if (!project) {
        return (
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
                <p>Project not found.</p>
                <Button onClick={onBack} className="mt-4">Back</Button>
            </div>
        );
    }

    const getBalanceColor = () => {
        if (balance > 0) return 'text-green-600 dark:text-green-400';
        if (balance < 0) return 'text-red-600 dark:text-red-400';
        return 'text-gray-700 dark:text-gray-300';
    };

    const tabs = [
        { name: t('income'), content: <IncomeTab project={project} /> },
        { name: t('outcome'), content: <OutcomeTab project={project} /> },
        { name: t('balance'), content: <BalanceTab project={project} /> },
    ];

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="flex items-center mb-4">
                <Button variant="secondary" onClick={onBack} className="mr-4">
                    <Icon name="back" className="h-5 w-5" />
                </Button>
                <div>
                    <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">{project.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{project.description}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-center">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">{t('total_income')}</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalIncome)}</p>
                </div>
                <div className="text-center">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">{t('total_outcome')}</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalOutcome)}</p>
                </div>
                <div className="text-center">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">{t('current_balance')}</p>
                    <p className={`text-2xl font-bold ${getBalanceColor()}`}>{balance > 0 ? '+' : ''}{formatCurrency(balance)}</p>
                </div>
            </div>

            <ModuleWithTabs tabs={tabs} variant="secondary" />
        </div>
    );
};

export default ProjectView;
