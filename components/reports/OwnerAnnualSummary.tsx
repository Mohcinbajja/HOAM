import React, { useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Owner, PaymentStatus, ContributionStatus } from '../../types';
import Card from '../ui/Card';
import ReportFooter from './ReportFooter';
import ReportHeader from './ReportHeader';
import BarChart from '../ui/BarChart';

interface SortConfig {
  column: string;
  direction: 'asc' | 'desc';
}

interface OwnerAnnualSummaryProps {
    selectedYear: number;
    selectedOwner: Owner;
    sorts: Record<string, SortConfig>;
}

const OwnerAnnualSummary: React.FC<OwnerAnnualSummaryProps> = ({ selectedYear, selectedOwner, sorts }) => {
    const { t, language } = useLanguage();
    const { selectedProperty, monthlyPayments, exceptionalProjects, exceptionalContributions } = useData();

    const reportData = useMemo(() => {
        if (!selectedProperty) return null;
        
        const constructionDate = new Date(selectedProperty.details.constructionDate);
        const ownerJoinDate = selectedOwner.joinDate ? new Date(selectedOwner.joinDate) : null;
        const startDate = (ownerJoinDate && ownerJoinDate > constructionDate) ? ownerJoinDate : constructionDate;
        const startYear = startDate.getFullYear();
        const startMonth = startDate.getMonth();

        const isMonthValid = (monthIndex: number) => {
            if (selectedYear < startYear) return false;
            if (selectedYear === startYear && monthIndex < startMonth) return false;
            return true;
        };

        const totalRegular = monthlyPayments
            .filter(p => p.propertyId === selectedProperty.id && p.year === selectedYear && p.ownerId === selectedOwner.id && isMonthValid(p.month))
            .reduce((sum, p) => sum + p.amountPaid, 0);

        const exceptionalData = exceptionalContributions
            .filter(c => c.ownerId === selectedOwner.id && exceptionalProjects.find(p => p.id === c.projectId && p.year === selectedYear))
            .map(c => ({
                ...c,
                project: exceptionalProjects.find(p => p.id === c.projectId)
            }));
            
        let regularPaymentsData = Array.from({ length: 12 }, (_, i) => i)
            .filter(isMonthValid)
            .map(monthIndex => {
                const payment = monthlyPayments.find(p => p.propertyId === selectedProperty.id && p.year === selectedYear && p.ownerId === selectedOwner.id && p.month === monthIndex);
                return {
                    month: monthIndex,
                    amountPaid: payment?.amountPaid || 0,
                    status: payment?.status || PaymentStatus.UNPAID,
                };
            });

        const regularSortConfig = sorts?.regular;
        if (regularSortConfig && regularSortConfig.column) {
            regularPaymentsData.sort((a, b) => {
                const valA = a[regularSortConfig.column as keyof typeof a];
                const valB = b[regularSortConfig.column as keyof typeof b];
                let comparison = 0;
                if (typeof valA === 'number' && typeof valB === 'number') {
                    comparison = valA - valB;
                } else {
                    comparison = String(valA).localeCompare(String(valB));
                }
                return regularSortConfig.direction === 'desc' ? -comparison : comparison;
            });
        }
        
        // Sort exceptional contributions
        const exceptionalSortConfig = sorts?.exceptional;
        if (exceptionalSortConfig && exceptionalSortConfig.column) {
            exceptionalData.sort((a, b) => {
                const valA = exceptionalSortConfig.column === 'projectName' ? a.project?.name : a[exceptionalSortConfig.column as keyof typeof a];
                const valB = exceptionalSortConfig.column === 'projectName' ? b.project?.name : b[exceptionalSortConfig.column as keyof typeof b];

                let comparison = 0;
                if (typeof valA === 'number' && typeof valB === 'number') {
                    comparison = valA - valB;
                } else {
                    comparison = String(valA).localeCompare(String(valB));
                }
                return exceptionalSortConfig.direction === 'desc' ? -comparison : comparison;
            });
        }


        const totalExceptional = exceptionalData.reduce((sum, c) => sum + c.paidAmount, 0);

        return {
            totalRegular,
            totalExceptional,
            grandTotal: totalRegular + totalExceptional,
            regularPayments: regularPaymentsData,
            exceptionalContributions: exceptionalData,
        };
    }, [selectedYear, selectedOwner, monthlyPayments, exceptionalContributions, exceptionalProjects, selectedProperty, sorts]);
    
    if (!reportData || !selectedProperty || !selectedOwner) {
        return <div>{t('no_data_for_selection')}</div>;
    }

    const currency = selectedProperty.details.currency;
    const formatCurrency = (amount: number) => new Intl.NumberFormat(language, { style: 'currency', currency }).format(amount);
    const getStatusText = (status: PaymentStatus | ContributionStatus) => t(status.toLowerCase().replace(/_/g, '') as any);

    const chartData = [
        { label: t('total_regular_payments'), value: reportData.totalRegular },
        { label: t('total_exceptional_contributions'), value: reportData.totalExceptional }
    ];

    return (
        <div id="report_owner_annual_summary-report-area" className="report-page">
            <div className="report-header-group">
                <ReportHeader />
            </div>
            <div className="report-body-group">
                <main>
                     <div className="text-center mt-8 mb-12">
                        <h1 className="text-3xl font-bold uppercase tracking-wider text-gray-800 dark-text-fix">{t('report_owner_annual_summary')}</h1>
                        <p className="text-lg text-gray-600 dark-text-fix mt-2">{selectedOwner.fullName} - {selectedYear}</p>
                    </div>
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow">
                                <p className="text-sm dark-text-fix text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('total_regular_payments')}</p>
                                <p className="text-2xl font-bold dark-text-fix text-green-600 dark:text-green-400 mt-1">{formatCurrency(reportData.totalRegular)}</p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow">
                                <p className="text-sm dark-text-fix text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('total_exceptional_contributions')}</p>
                                <p className="text-2xl font-bold dark-text-fix text-blue-600 dark:text-blue-400 mt-1">{formatCurrency(reportData.totalExceptional)}</p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow">
                                <p className="text-sm dark-text-fix text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('grand_total')}</p>
                                <p className="text-2xl font-bold dark-text-fix text-gray-800 dark:text-white mt-1">{formatCurrency(reportData.grandTotal)}</p>
                            </div>
                        </div>
                        <div className="break-inside-avoid">
                            <BarChart title={t('yearly_analysis')} data={chartData} />
                        </div>
                        <div className="break-inside-avoid">
                            <Card title={t('regular_payments_for_year', {year: selectedYear})}>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y dark-text-fix divide-gray-200 dark:divide-gray-600">
                                        <thead className="bg-gray-100 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 dark-text-fix uppercase">{t('month')}</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 dark-text-fix uppercase">{t('amount_paid')}</th>
                                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 dark-text-fix uppercase">{t('status')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                                            {reportData.regularPayments.map(p => (
                                                <tr key={p.month}>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium dark-text-fix">{new Date(selectedYear!, p.month).toLocaleString(language, { month: 'long' })}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right dark-text-fix">{formatCurrency(p.amountPaid)}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-center dark-text-fix">{getStatusText(p.status)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                        <div className="break-inside-avoid">
                            <Card title={t('exceptional_contributions_for_year', {year: selectedYear})}>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y dark-text-fix divide-gray-200 dark:divide-gray-600">
                                        <thead className="bg-gray-100 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 dark-text-fix uppercase">{t('project')}</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 dark-text-fix uppercase">{t('expected_amount')}</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 dark-text-fix uppercase">{t('paid_amount')}</th>
                                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 dark-text-fix uppercase">{t('status')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                                            {reportData.exceptionalContributions.map(c => (
                                                <tr key={c.id}>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium dark-text-fix">{c.project?.name}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right dark-text-fix">{formatCurrency(c.expectedAmount)}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right dark-text-fix">{formatCurrency(c.paidAmount)}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-center dark-text-fix">{getStatusText(c.status)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
            <div className="report-footer-group">
                <ReportFooter />
            </div>
        </div>
    );
};

export default OwnerAnnualSummary;
