import React, { useMemo } from 'react';
import { ExceptionalProject } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useData } from '../../contexts/DataContext';

interface ProjectCardProps {
    project: ExceptionalProject;
    onSelect: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect }) => {
    const { t, language } = useLanguage();
    const { selectedProperty, exceptionalContributions, externalContributors, exceptionalOutcomes } = useData();
    const currency = selectedProperty?.details.currency || 'USD';
    
    const { totalIncome, totalOutcome, balance } = useMemo(() => {
        const incomeFromOwners = exceptionalContributions
            .filter(c => c.projectId === project.id)
            .reduce((sum, c) => sum + c.paidAmount, 0);
        const incomeFromExternal = externalContributors
            .filter(c => c.projectId === project.id)
            .reduce((sum, c) => sum + c.paidAmount, 0);
        const totalIncome = incomeFromOwners + incomeFromExternal;
        
        const totalOutcome = exceptionalOutcomes
            .filter(o => o.projectId === project.id && o.isConfirmed)
            .reduce((sum, o) => sum + o.amount, 0);
            
        return { totalIncome, totalOutcome, balance: totalIncome - totalOutcome };
    }, [project.id, exceptionalContributions, externalContributors, exceptionalOutcomes]);

    const formatCurrency = (amount: number) => new Intl.NumberFormat(language, { style: 'currency', currency }).format(amount);

    return (
        <div 
            onClick={onSelect}
            className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 shadow-sm transition-all hover:shadow-md hover:ring-2 hover:ring-blue-500 cursor-pointer flex flex-col justify-between"
        >
            <div>
                <h4 className="font-bold text-lg text-gray-800 dark:text-white break-all">{project.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(project.startDate).toLocaleDateString(language)} - {project.endDate ? new Date(project.endDate).toLocaleDateString(language) : 'Ongoing'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 h-10 overflow-hidden">{project.description}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 space-y-2 text-sm">
                <div className="flex justify-between items-center">
                    <span className="text-green-600 dark:text-green-400 font-medium">{t('total_income')}:</span>
                    <span className="font-semibold">{formatCurrency(totalIncome)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-red-600 dark:text-red-400 font-medium">{t('total_outcome')}:</span>
                    <span className="font-semibold">{formatCurrency(totalOutcome)}</span>
                </div>
                 <div className="flex justify-between items-center font-bold text-lg">
                    <span className="text-blue-600 dark:text-blue-400">{t('current_balance')}:</span>
                    <span className={balance >= 0 ? 'text-gray-800 dark:text-white' : 'text-red-500'}>{formatCurrency(balance)}</span>
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;
