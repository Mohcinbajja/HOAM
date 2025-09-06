import React, { useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import ReportFooter from './ReportFooter';
import ReportHeader from './ReportHeader';
import Card from '../ui/Card';

const CombinedIncomeReport: React.FC = () => {
    const { t, language } = useLanguage();
    // FIX: Rename 'owners' to 'allOwners' to avoid redeclaration.
    const { selectedProperty, monthlyPayments, exceptionalContributions, externalContributors, exceptionalProjects, owners: allOwners } = useData();

    const reportData = useMemo(() => {
        if (!selectedProperty) return null;

        const ownerData: Map<string, {
            name: string;
            yearlyData: Map<number, { regular: number; exceptional: number }>;
            totalRegular: number;
            totalExceptional: number;
        }> = new Map();

        // FIX: Use 'allOwners' from context.
        const activeOwners = allOwners
            .filter(o => o.propertyId === selectedProperty.id && o.isActive)
            .sort((a, b) => a.fullName.localeCompare(b.fullName));
        
        activeOwners.forEach(owner => {
            ownerData.set(owner.id, {
                name: owner.fullName,
                yearlyData: new Map(),
                totalRegular: 0,
                totalExceptional: 0,
            });
        });

        const allYears = new Set<number>();
        const projectsByYear: Record<number, string[]> = {};
        exceptionalProjects.forEach(project => {
            if (project.propertyId === selectedProperty.id) {
                if (!projectsByYear[project.year]) projectsByYear[project.year] = [];
                projectsByYear[project.year].push(project.id);
                allYears.add(project.year);
            }
        });

        monthlyPayments.forEach(p => {
            if (p.propertyId === selectedProperty.id && ownerData.has(p.ownerId)) {
                allYears.add(p.year);
                const ownerRecord = ownerData.get(p.ownerId)!;
                const yearData = ownerRecord.yearlyData.get(p.year) || { regular: 0, exceptional: 0 };
                yearData.regular += p.amountPaid;
                ownerRecord.yearlyData.set(p.year, yearData);
            }
        });

        const processContribution = (c: { projectId: string; ownerId?: string; contributorId?: string; paidAmount: number }) => {
            for (const yearStr in projectsByYear) {
                const year = Number(yearStr);
                if (projectsByYear[year].includes(c.projectId)) {
                    const ownerId = c.ownerId || c.contributorId;
                    if (ownerId && ownerData.has(ownerId)) {
                        const ownerRecord = ownerData.get(ownerId)!;
                        const yearData = ownerRecord.yearlyData.get(year) || { regular: 0, exceptional: 0 };
                        yearData.exceptional += c.paidAmount;
                        ownerRecord.yearlyData.set(year, yearData);
                    }
                    break;
                }
            }
        };

        exceptionalContributions.forEach(processContribution);
        // Assuming external contributors are mapped to an owner record if their ID matches.
        // If not, they would need to be handled separately. For now, we assume IDs are consistent.
        // externalContributors.forEach(processContribution);


        const sortedYears = Array.from(allYears).sort((a, b) => a - b);

        const yearlyTotals = new Map<number, { regular: number; exceptional: number; total: number }>();
        sortedYears.forEach(year => yearlyTotals.set(year, { regular: 0, exceptional: 0, total: 0 }));
        
        const grandTotal = { regular: 0, exceptional: 0, total: 0 };

        activeOwners.forEach(owner => {
            const record = ownerData.get(owner.id)!;
            sortedYears.forEach(year => {
                const yearData = record.yearlyData.get(year) || { regular: 0, exceptional: 0 };
                record.totalRegular += yearData.regular;
                record.totalExceptional += yearData.exceptional;

                const yearTotal = yearlyTotals.get(year)!;
                yearTotal.regular += yearData.regular;
                yearTotal.exceptional += yearData.exceptional;
                yearTotal.total += yearData.regular + yearData.exceptional;
            });
             grandTotal.regular += record.totalRegular;
             grandTotal.exceptional += record.totalExceptional;
             grandTotal.total += record.totalRegular + record.totalExceptional;
        });

        return { owners: activeOwners, ownerData, sortedYears, yearlyTotals, grandTotal };
    // FIX: Update dependency array to use 'allOwners'.
    }, [selectedProperty, monthlyPayments, exceptionalProjects, exceptionalContributions, externalContributors, allOwners]);
    
    if (!reportData || !selectedProperty) {
        return <div>{t('no_data_for_selection')}</div>;
    }

    const currency = selectedProperty.details.currency;
    const formatCurrency = (amount: number) => new Intl.NumberFormat(language, { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount);
    
    const { owners, ownerData, sortedYears, yearlyTotals, grandTotal } = reportData;

    return (
        <div id="report_combined_income-report-area">
            {/* Page per Year */}
            {sortedYears.map(year => {
                 const totals = yearlyTotals.get(year)!;
                 return (
                    <div key={year} className="report-page">
                        <div className="report-header-group"><ReportHeader /></div>
                        <div className="report-body-group">
                            <main>
                                <div className="text-center mt-8 mb-12">
                                    <h1 className="text-3xl font-bold uppercase tracking-wider text-gray-800 dark-text-fix">{t('report_combined_income')}</h1>
                                    <p className="text-lg text-gray-600 dark-text-fix mt-2">{year}</p>
                                </div>
                                <table className="min-w-full divide-y dark-text-fix divide-gray-200 dark:divide-gray-600">
                                    <thead className="bg-gray-100 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 dark-text-fix uppercase">{t('owner')}</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 dark-text-fix uppercase">{t('total_regular_payments')}</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 dark-text-fix uppercase">{t('total_exceptional_contributions')}</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 dark-text-fix uppercase">{t('total_income')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                                        {owners.map(owner => {
                                            const data = ownerData.get(owner.id)?.yearlyData.get(year) || { regular: 0, exceptional: 0 };
                                            return (
                                                <tr key={owner.id}>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium dark-text-fix">{owner.fullName}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right dark-text-fix">{formatCurrency(data.regular)}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right dark-text-fix">{formatCurrency(data.exceptional)}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-semibold dark-text-fix">{formatCurrency(data.regular + data.exceptional)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot className="bg-gray-100 dark:bg-gray-700 font-bold">
                                        <tr>
                                            <td className="px-4 py-2 text-left text-sm dark-text-fix">{t('total')}</td>
                                            <td className="px-4 py-2 text-right text-sm dark-text-fix">{formatCurrency(totals.regular)}</td>
                                            <td className="px-4 py-2 text-right text-sm dark-text-fix">{formatCurrency(totals.exceptional)}</td>
                                            <td className="px-4 py-2 text-right text-sm dark-text-fix">{formatCurrency(totals.total)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </main>
                        </div>
                        <div className="report-footer-group"><ReportFooter /></div>
                    </div>
                 );
            })}
            
            {/* Grand Total Summary Page */}
            <div className="report-page">
                <div className="report-header-group"><ReportHeader /></div>
                <div className="report-body-group">
                    <main>
                        <div className="text-center mt-8 mb-12">
                            <h1 className="text-3xl font-bold uppercase tracking-wider text-gray-800 dark-text-fix">{t('grand_total')}</h1>
                             <p className="text-lg text-gray-600 dark-text-fix mt-2">{t('all_owners')} ({t('all_years')})</p>
                        </div>
                        <table className="min-w-full divide-y dark-text-fix divide-gray-200 dark:divide-gray-600">
                            <thead className="bg-gray-100 dark:bg-gray-700">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 dark-text-fix uppercase">{t('owner')}</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 dark-text-fix uppercase">{t('total_regular_payments')}</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 dark-text-fix uppercase">{t('total_exceptional_contributions')}</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 dark-text-fix uppercase">{t('grand_total')}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                                {owners.map(owner => {
                                    const data = ownerData.get(owner.id)!;
                                    return (
                                        <tr key={owner.id}>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium dark-text-fix">{owner.fullName}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-right dark-text-fix">{formatCurrency(data.totalRegular)}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-right dark-text-fix">{formatCurrency(data.totalExceptional)}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-semibold dark-text-fix">{formatCurrency(data.totalRegular + data.totalExceptional)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                             <tfoot className="bg-gray-100 dark:bg-gray-700 font-bold">
                                <tr>
                                    <td className="px-4 py-2 text-left text-sm dark-text-fix">{t('grand_total')}</td>
                                    <td className="px-4 py-2 text-right text-sm dark-text-fix">{formatCurrency(grandTotal.regular)}</td>
                                    <td className="px-4 py-2 text-right text-sm dark-text-fix">{formatCurrency(grandTotal.exceptional)}</td>
                                    <td className="px-4 py-2 text-right text-sm dark-text-fix">{formatCurrency(grandTotal.total)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </main>
                </div>
                <div className="report-footer-group"><ReportFooter /></div>
            </div>
        </div>
    );
};

export default CombinedIncomeReport;
