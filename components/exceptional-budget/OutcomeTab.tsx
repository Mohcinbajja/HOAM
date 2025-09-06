import React, { useState, useMemo } from 'react';
import { ExceptionalProject, ExceptionalOutcome } from '../../types';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import OutcomeModal from './OutcomeModal';
import ExceptionalOutcomeChart from './ExceptionalOutcomeChart';

interface OutcomeTabProps {
    project: ExceptionalProject;
}

const OutcomeTab: React.FC<OutcomeTabProps> = ({ project }) => {
    const { t, language } = useLanguage();
    const { exceptionalOutcomes, selectedProperty } = useData();
    const [outcomeModalInfo, setOutcomeModalInfo] = useState<{ outcome: ExceptionalOutcome | null, isCreating: boolean }>({ outcome: null, isCreating: false });

    const currency = selectedProperty?.details.currency || 'USD';
    const formatCurrency = (amount: number) => new Intl.NumberFormat(language, { style: 'currency', currency }).format(amount);
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString(language);
    const formatDateWithTime = (dateString: string) => new Date(dateString).toLocaleString(language, {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const projectOutcomes = useMemo(() => {
        return exceptionalOutcomes.filter(o => o.projectId === project.id)
            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [project.id, exceptionalOutcomes]);

    const handleOpenModal = (outcome: ExceptionalOutcome | null, isCreating = false) => {
        setOutcomeModalInfo({ outcome, isCreating });
    };

    const confirmedOutcomesForAudit = useMemo(() => {
        return exceptionalOutcomes
            .filter(o => o.projectId === project.id && o.isConfirmed && o.confirmedAt)
            .map(o => ({
                id: o.id,
                date: o.confirmedAt!,
                description: t('expense_confirmed_audit', { project: project.name, description: o.description }),
                amount: -o.amount
            }))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [project.id, project.name, exceptionalOutcomes, t]);


    return (
        <div className="space-y-8">
            <Card title={t('outcome')}>
                <div className="flex justify-end mb-4">
                    <Button onClick={() => handleOpenModal(null, true)}>
                        <Icon name="plus" className="h-5 w-5 mr-2" /> {t('add_expense')}
                    </Button>
                </div>
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('expense_date')}</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('description')}</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('amount')}</th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('status')}</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {projectOutcomes.map(outcome => (
                                <tr key={outcome.id}>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">{formatDate(outcome.date)}</td>
                                    <td className="px-4 py-2 text-sm">{outcome.description}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-semibold">{formatCurrency(outcome.amount)}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-center text-sm">
                                        {outcome.isConfirmed 
                                            ? <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">{t('confirmed')}</span>
                                            : <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">{t('pending')}</span>
                                        }
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                                        {/* FIX: Use valid translation key 'expense_details'. */}
                                        <Button size="sm" variant="secondary" onClick={() => handleOpenModal(outcome)}>{t('expense_details')}</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

             <Card title={t('audit_trail')}>
                {/* FIX: Add missing children prop. */}
                {confirmedOutcomesForAudit.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('description')}</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('amount')}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {confirmedOutcomesForAudit.map(entry => (
                                    <tr key={entry.id}>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDateWithTime(entry.date)}</td>
                                        <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{entry.description}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-semibold text-red-600 dark:text-red-400">
                                            {formatCurrency(entry.amount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                        {t('no_transactions_for_year')}
                    </p>
                )}
             </Card>
            
            <ExceptionalOutcomeChart project={project} />

            <OutcomeModal 
                isOpen={outcomeModalInfo.isCreating || !!outcomeModalInfo.outcome}
                onClose={() => setOutcomeModalInfo({ outcome: null, isCreating: false })}
                outcome={outcomeModalInfo.outcome}
                projectId={project.id}
            />
        </div>
    );
};

export default OutcomeTab;
