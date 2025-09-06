import React, { useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import ReportFooter from './ReportFooter';
import ReportHeader from './ReportHeader';
import { ContributionStatus } from '../../types';
import BarChart from '../ui/BarChart';
import Card from '../ui/Card';

interface ExceptionalBudgetReportProps {
    selectedYear: number;
}

const ExceptionalBudgetReport: React.FC<ExceptionalBudgetReportProps> = ({ selectedYear }) => {
    const { t, language } = useLanguage();
    const { selectedProperty, owners, exceptionalProjects, exceptionalContributions, externalContributors, exceptionalOutcomes } = useData();
    const currency = selectedProperty?.details.currency || 'USD';
    const formatCurrency = (amount: number) => new Intl.NumberFormat(language, { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount);
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString(language);
    const getStatusText = (status: ContributionStatus) => t(status.toLowerCase().replace(/_/g, '') as any);

    const reportData = useMemo(() => {
        if (!selectedProperty) return null;

        const projectsForYear = exceptionalProjects.filter(p => p.propertyId === selectedProperty.id && p.year === selectedYear);
        const ownersMap = new Map(owners.map(o => [o.id, o.fullName]));

        const projectDetails = projectsForYear.map(project => {
            const ownerContribs = exceptionalContributions
                .filter(c => c.projectId === project.id)
                .map(c => ({ name: ownersMap.get(c.ownerId) || 'Unknown', ...c }));
            
            const externalContribs = externalContributors
                .filter(c => c.projectId === project.id)
                .map(c => ({ name: c.fullName, ...c }));
            const allContributions = [...ownerContribs, ...externalContribs];

            const outcomes = exceptionalOutcomes.filter(o => o.projectId === project.id);
            
            const totalIncome = allContributions.reduce((sum, c) => sum + c.paidAmount, 0);
            const totalOutcome = outcomes.filter(o => o.isConfirmed).reduce((sum, o) => sum + o.amount, 0);
            
            return {
                ...project,
                contributions: allContributions,
                outcomes,
                totalIncome,
                totalOutcome,
                balance: totalIncome - totalOutcome,
            };
        });

        const grandTotalIncome = projectDetails.reduce((sum, p) => sum + p.totalIncome, 0);
        const grandTotalOutcome = projectDetails.reduce((sum, p) => sum + p.totalOutcome, 0);
        const grandTotalBalance = grandTotalIncome - grandTotalOutcome;

        return { projects: projectDetails, grandTotalIncome, grandTotalOutcome, grandTotalBalance };
    }, [selectedProperty, selectedYear, exceptionalProjects, exceptionalContributions, externalContributors, exceptionalOutcomes, owners]);


    if (!reportData) return null;

    const chartData = reportData.projects.map(p => ({
        label: p.name,
        value: p.balance,
    }));

    return (
        <div id="report_exceptional_budget-report-area" className="report-page">
            <div className="report-header-group"><ReportHeader /></div>
            <div className="report-body-group">
                <main className="space-y-8">
                    <div className="text-center mt-8 mb-12">
                        <h1 className="text-3xl font-bold uppercase tracking-wider text-gray-800 dark-text-fix">{t('report_exceptional_budget')}</h1>
                        <p className="text-lg text-gray-600 dark-text-fix mt-2">{selectedYear}</p>
                    </div>

                    <div className="break-inside-avoid">
                        <BarChart title={t('current_balance')} data={chartData} />
                    </div>

                    {reportData.projects.length > 0 ? (
                        reportData.projects.map(project => (
                            <div key={project.id} className="break-inside-avoid mb-8">
                                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                    <h2 className="text-xl font-bold dark-text-fix">{project.name}</h2>
                                    <p className="text-sm text-gray-600 dark-text-fix">{project.description}</p>
                                </div>
                                
                                <h3 className="text-lg font-semibold mt-4 mb-2 dark-text-fix">{t('income')}</h3>
                                <table className="min-w-full text-xs">
                                    <thead className="bg-gray-50 dark:bg-gray-800"><tr className="text-left">
                                        <th className="p-1 dark-text-fix">{t('full_name')}</th>
                                        <th className="p-1 text-right dark-text-fix">{t('expected_amount')}</th>
                                        <th className="p-1 text-right dark-text-fix">{t('paid_amount')}</th>
                                        <th className="p-1 text-center dark-text-fix">{t('status')}</th>
                                    </tr></thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                    {project.contributions.map(c => (
                                        <tr key={c.id}><td className="p-1 dark-text-fix">{c.name}</td><td className="p-1 text-right dark-text-fix">{formatCurrency(c.expectedAmount)}</td><td className="p-1 text-right dark-text-fix">{formatCurrency(c.paidAmount)}</td><td className="p-1 text-center dark-text-fix">{getStatusText(c.status)}</td></tr>
                                    ))}
                                    </tbody>
                                </table>

                                <h3 className="text-lg font-semibold mt-4 mb-2 dark-text-fix">{t('outcome')}</h3>
                                <table className="min-w-full text-xs">
                                    <thead className="bg-gray-50 dark:bg-gray-800"><tr className="text-left">
                                        <th className="p-1 dark-text-fix">{t('expense_date')}</th>
                                        <th className="p-1 dark-text-fix">{t('description')}</th>
                                        <th className="p-1 text-right dark-text-fix">{t('amount')}</th>
                                        <th className="p-1 text-center dark-text-fix">{t('status')}</th>
                                    </tr></thead>
                                     <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                    {project.outcomes.map(o => (
                                        <tr key={o.id}><td className="p-1 dark-text-fix">{formatDate(o.date)}</td><td className="p-1 dark-text-fix">{o.description}</td><td className="p-1 text-right dark-text-fix">{formatCurrency(o.amount)}</td><td className="p-1 text-center dark-text-fix">{t(o.isConfirmed ? 'confirmed' : 'pending')}</td></tr>
                                    ))}
                                    </tbody>
                                </table>
                                
                                <div className="grid grid-cols-3 gap-2 mt-4 text-center text-xs font-bold">
                                    <div className="p-1 bg-green-100 rounded dark-text-fix">{t('total_income')}: {formatCurrency(project.totalIncome)}</div>
                                    <div className="p-1 bg-red-100 rounded dark-text-fix">{t('total_outcome')}: {formatCurrency(project.totalOutcome)}</div>
                                    <div className="p-1 bg-blue-100 rounded dark-text-fix">{t('balance')}: {formatCurrency(project.balance)}</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 dark-text-fix py-8">{t('no_projects_desc')}</p>
                    )}
                    
                    {/* Grand Totals */}
                    <div className="break-before-page pt-8">
                         <Card title={`${t('grand_total')} (${selectedYear})`}>
                             <table className="min-w-full">
                                 <tbody className="font-bold text-lg">
                                     <tr className="text-right border-b">
                                         <td className="p-4 text-left dark-text-fix">{t('total_income')}</td>
                                         <td className="p-4 dark-text-fix text-green-700">{formatCurrency(reportData.grandTotalIncome)}</td>
                                     </tr>
                                     <tr className="text-right border-b">
                                         <td className="p-4 text-left dark-text-fix">{t('total_outcome')}</td>
                                         <td className="p-4 dark-text-fix text-red-700">{formatCurrency(reportData.grandTotalOutcome)}</td>
                                     </tr>
                                     <tr className="text-right">
                                         <td className="p-4 text-left dark-text-fix">{t('balance')}</td>
                                         <td className={`p-4 dark-text-fix ${reportData.grandTotalBalance < 0 ? 'text-red-700' : 'text-gray-800'}`}>{formatCurrency(reportData.grandTotalBalance)}</td>
                                     </tr>
                                 </tbody>
                             </table>
                         </Card>
                    </div>
                </main>
            </div>
            <div className="report-footer-group"><ReportFooter /></div>
        </div>
    );
};

export default ExceptionalBudgetReport;
