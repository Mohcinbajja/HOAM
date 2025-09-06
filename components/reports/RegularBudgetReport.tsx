import React, { useMemo, useCallback } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import ReportFooter from './ReportFooter';
import ReportHeader from './ReportHeader';
import { TranslationKey } from '../../lib/translations';
import { AmountType, PaymentStatus, UnitTypeFeePolicy } from '../../types';

interface RegularBudgetReportProps {
    view: string;
    year: number;
    month?: number;
    itemId?: string; // ownerId or categoryId
}

const ReportTable: React.FC<{ headers: string[], rows: (string|number)[][], footer?: (string|number)[] }> = ({ headers, rows, footer }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>{headers.map((h, i) => <th key={i} className={`px-3 py-2 text-left dark-text-fix ${i > 0 ? 'text-right' : ''}`}>{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {rows.map((row, i) => (
                    <tr key={i}>{row.map((cell, j) => <td key={j} className={`px-3 py-2 dark-text-fix ${j > 0 ? 'text-right' : ''}`}>{cell}</td>)}</tr>
                ))}
            </tbody>
            {footer && (
                 <tfoot className="bg-gray-100 dark:bg-gray-700 font-bold">
                    <tr>{footer.map((f, i) => <td key={i} className={`px-3 py-2 dark-text-fix ${i > 0 ? 'text-right' : ''}`}>{f}</td>)}</tr>
                </tfoot>
            )}
        </table>
    </div>
);


const RegularBudgetReport: React.FC<RegularBudgetReportProps> = ({ view, year, month, itemId }) => {
    const { t, language } = useLanguage();
    const { selectedProperty, owners, monthlyPayments, expenseCategories, monthlyOutcomes, units, unitTypes, getUnitTypeFeePolicy } = useData();
    
    const currency = selectedProperty?.details.currency || 'USD';
    const formatCurrency = useCallback((amount: number) => 
        new Intl.NumberFormat(language, { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount),
        [language, currency]
    );

    const reportContent = useMemo(() => {
        if (!selectedProperty) return { title: 'Error', content: <p>No property selected.</p> };

        const allYears = [...new Set(monthlyPayments.map(p => p.year))].sort();
        const activeOwners = owners.filter(o => o.propertyId === selectedProperty.id && o.isActive);
        const activeCategories = expenseCategories.filter(c => c.propertyId === selectedProperty.id && !c.isArchived);

        let title: string = t('report_regular_budget');
        let headers: string[] = [];
        let rows: (string|number)[][] = [];
        let footer: (string|number)[] = [];
        
        const getMonthCategory = (y: number, m: number): 'past' | 'current' | 'future' => {
            const now = new Date(); now.setHours(0, 0, 0, 0);
            const date = new Date(y, m);
            if (date.getFullYear() < now.getFullYear() || (date.getFullYear() === now.getFullYear() && date.getMonth() < now.getMonth())) return 'past';
            if (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()) return 'current';
            return 'future';
        };

        const getAdjustedMonthlyFee = (baseFee: number, policy: UnitTypeFeePolicy | undefined, monthCategory: 'past' | 'current' | 'future'): number => {
            if (!policy) return baseFee;
            if (monthCategory === 'past' && policy.penalty.amount > 0) {
                return baseFee + (policy.penalty.type === AmountType.FIXED ? policy.penalty.amount : baseFee * (policy.penalty.amount / 100));
            }
            if (monthCategory === 'future' && policy.discount.amount > 0) {
                return baseFee - (policy.discount.type === AmountType.FIXED ? policy.discount.amount : baseFee * (policy.discount.amount / 100));
            }
            return baseFee;
        };
        
        const constructionDate = new Date(selectedProperty.details.constructionDate);
        const constructionYear = constructionDate.getFullYear();
        const constructionMonth = constructionDate.getMonth();
        const isPropertyMonthValid = (m: number) => year > constructionYear || (year === constructionYear && m >= constructionMonth);


        switch (view) {
            case 'full_year_summary': {
                title = t('report_regular_budget') + ` - ${year}`;

                const paymentsForYear = monthlyPayments.filter(p => p.propertyId === selectedProperty!.id && p.year == year);
                const outcomesForYear = monthlyOutcomes.filter(o => o.propertyId === selectedProperty!.id && o.year == year && o.isConfirmed);
                const propertyOwners = owners.filter(o => o.propertyId === selectedProperty!.id && o.isActive && (!o.joinDate || new Date(o.joinDate).getFullYear() <= year));
                const propertyCategories = expenseCategories.filter(c => c.propertyId === selectedProperty!.id && !c.isArchived);
                
                const totalIncome = paymentsForYear.reduce((sum, p) => sum + p.amountPaid, 0);
                const totalOutcome = outcomesForYear.reduce((sum, o) => sum + o.amount, 0);
                const balance = totalIncome - totalOutcome;

                const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'] as const;

                const content = (
                    <div className="space-y-8">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-2 bg-green-100 rounded"><p className="text-sm dark-text-fix">{t('total_income')}</p><p className="font-bold dark-text-fix">{formatCurrency(totalIncome)}</p></div>
                            <div className="p-2 bg-red-100 rounded"><p className="text-sm dark-text-fix">{t('total_outcome')}</p><p className="font-bold dark-text-fix">{formatCurrency(totalOutcome)}</p></div>
                            <div className="p-2 bg-blue-100 rounded"><p className="text-sm dark-text-fix">{t('balance')}</p><p className="font-bold dark-text-fix">{formatCurrency(balance)}</p></div>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold mb-4 dark-text-fix">{t('income')}</h2>
                            <table className="min-w-full text-xs">
                                <thead className="bg-gray-100"><tr><th className="p-1 text-left dark-text-fix">{t('owner')}</th>{monthKeys.map(m => <th key={m} className="p-1 text-center dark-text-fix">{t(m)}</th>)}<th className="p-1 text-right dark-text-fix">{t('total')}</th></tr></thead>
                                <tbody>
                                    {propertyOwners.map(owner => {
                                        let totalPaid = 0;
                                        const ownerJoinDate = owner.joinDate ? new Date(owner.joinDate) : constructionDate;
                                        const startDate = ownerJoinDate > constructionDate ? ownerJoinDate : constructionDate;
                                        
                                        const cells = monthKeys.map((_, m) => {
                                            const currentMonthDate = new Date(year, m + 1, 0);
                                            const hasJoined = !owner.joinDate || new Date(owner.joinDate) <= currentMonthDate;
                                            
                                            if (!isPropertyMonthValid(m) || !hasJoined) {
                                                return <td key={m} className="p-1 text-center dark-text-fix text-gray-400">-</td>;
                                            }
                                            
                                            const payment = paymentsForYear.find(p => p.ownerId === owner.id && p.month == m);
                                            const paid = payment?.amountPaid || 0;
                                            totalPaid += paid;
                                            const status = payment?.status || PaymentStatus.UNPAID;
                                            let bgColor = 'transparent';
                                            if (status === PaymentStatus.PAID) bgColor = '#dcfce7'; // green-100
                                            else if (status === PaymentStatus.PARTIALLY_PAID) bgColor = '#fef9c3'; // yellow-100
                                            else if (status === PaymentStatus.UNPAID && getMonthCategory(year, m) === 'past') bgColor = '#fee2e2'; // red-100
                                            return <td key={m} style={{backgroundColor: bgColor}} className="p-1 text-center dark-text-fix">{formatCurrency(paid)}</td>;
                                        });
                                        return (
                                            <tr key={owner.id}>
                                                <td className="p-1 font-semibold dark-text-fix">{owner.fullName}</td>
                                                {cells}
                                                <td className="p-1 text-right font-semibold dark-text-fix">{formatCurrency(totalPaid)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div>
                             <h2 className="text-xl font-semibold mb-4 dark-text-fix">{t('outcome')}</h2>
                             <table className="min-w-full text-xs">
                                <thead className="bg-gray-100"><tr><th className="p-1 text-left dark-text-fix">{t('expense_category')}</th>{monthKeys.map(m => <th key={m} className="p-1 text-center dark-text-fix">{t(m)}</th>)}<th className="p-1 text-right dark-text-fix">{t('total')}</th></tr></thead>
                                <tbody>
                                    {propertyCategories.map(cat => {
                                        let total = 0;
                                        const cells = monthKeys.map((_, m) => {
                                            if (!isPropertyMonthValid(m)) {
                                                return <td key={m} className="p-1 text-center dark-text-fix text-gray-400">-</td>;
                                            }
                                            const outcome = outcomesForYear.find(o => o.categoryId === cat.id && o.month == m);
                                            const amount = outcome?.amount || 0;
                                            total += amount;
                                            return <td key={m} className="p-1 text-center dark-text-fix">{formatCurrency(amount)}</td>;
                                        });
                                        return (
                                            <tr key={cat.id}>
                                                <td className="p-1 font-semibold dark-text-fix">{cat.name}</td>
                                                {cells}
                                                <td className="p-1 text-right font-semibold dark-text-fix">{formatCurrency(total)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                             </table>
                        </div>
                    </div>
                );
                return { title, content };
            }
            case 'income_monthly_by_month': {
                const monthName = new Date(year, month!).toLocaleString(language, { month: 'long' });
                title = t('monthly_income_for_month', { month: monthName, year });
                headers = [t('owner'), t('amount_paid'), t('status')];
                const payments = monthlyPayments.filter(p => p.propertyId === selectedProperty.id && p.year == year && p.month == month);
                const paymentsMap = new Map(payments.map(p => [p.ownerId, p]));
                rows = activeOwners.map(owner => {
                    const p = paymentsMap.get(owner.id);
                    return [owner.fullName, formatCurrency(p?.amountPaid || 0), t((p?.status || 'unpaid').toLowerCase() as TranslationKey)];
                });
                const total = payments.reduce((sum, p) => sum + p.amountPaid, 0);
                footer = [t('total'), formatCurrency(total), ''];
                break;
            }
            case 'income_monthly_by_owner': {
                const owner = owners.find(o => o.id === itemId);
                title = t('monthly_income_for_owner', { owner: owner?.fullName, year });
                headers = [t('month'), t('amount_paid'), t('status')];
                const payments = monthlyPayments.filter(p => p.propertyId === selectedProperty.id && p.year == year && p.ownerId === itemId);
                const paymentsMap = new Map(payments.map(p => [p.month, p]));

                const ownerJoinDate = owner?.joinDate ? new Date(owner.joinDate) : null;
                const startDate = (ownerJoinDate && ownerJoinDate > constructionDate) ? ownerJoinDate : constructionDate;
                const startYear = startDate.getFullYear();
                const startMonth = startDate.getMonth();
                
                rows = Array.from({ length: 12 }, (_, i) => i)
                    .filter(i => {
                        if (year < startYear) return false;
                        if (year === startYear && i < startMonth) return false;
                        return true;
                    })
                    .map(i => {
                        const p = paymentsMap.get(i);
                        return [new Date(year, i).toLocaleString(language, { month: 'long' }), formatCurrency(p?.amountPaid || 0), t((p?.status || 'unpaid').toLowerCase() as TranslationKey)];
                    });
                const total = payments.reduce((sum, p) => sum + p.amountPaid, 0);
                footer = [t('total'), formatCurrency(total), ''];
                break;
            }
            case 'income_yearly_all': {
                title = t('yearly_income_all_owners', { year });
                headers = [t('owner'), t('total_paid')];
                const payments = monthlyPayments.filter(p => p.propertyId === selectedProperty.id && p.year == year);
                rows = activeOwners.map(owner => {
                    const total = payments.filter(p => p.ownerId === owner.id).reduce((sum, p) => sum + p.amountPaid, 0);
                    return [owner.fullName, formatCurrency(total)];
                });
                const grandTotal = payments.reduce((sum, p) => sum + p.amountPaid, 0);
                footer = [t('grand_total'), formatCurrency(grandTotal)];
                break;
            }
             case 'income_yearly_single': {
                const owner = owners.find(o => o.id === itemId);
                title = t('yearly_income_for_owner', { owner: owner?.fullName });
                headers = [t('year'), t('total_paid')];
                const payments = monthlyPayments.filter(p => p.propertyId === selectedProperty.id && p.ownerId === itemId);
                const yearMap = new Map<number, number>();
                payments.forEach(p => yearMap.set(p.year, (yearMap.get(p.year) || 0) + p.amountPaid));
                rows = allYears.map(y => [y, formatCurrency(yearMap.get(y) || 0)]);
                const grandTotal = payments.reduce((sum, p) => sum + p.amountPaid, 0);
                footer = [t('grand_total'), formatCurrency(grandTotal)];
                break;
            }
            case 'income_monthly_deficit': {
                const monthName = new Date(year, month!).toLocaleString(language, { month: 'long' });
                title = `${t('report_deficit_report')} - ${monthName} ${year}`;
                headers = [t('owner'), t('expected_amount'), t('paid_amount'), t('deficit')];
                const deficits: { name: string, expected: number, paid: number, deficit: number }[] = [];
                activeOwners.forEach(owner => {
                    const ownerUnits = units.filter(u => u.ownerId === owner.id);
                    const ownerUnitType = unitTypes.find(ut => ownerUnits.some(ou => ou.unitTypeId === ut.id));
                    if (!ownerUnitType) return;
                    const policy = getUnitTypeFeePolicy(selectedProperty.id, year, ownerUnitType.id);
                    const baseFee = policy?.baseFee || 0;
                    const monthCategory = getMonthCategory(year, month!);
                    const adjustedDue = getAdjustedMonthlyFee(baseFee, policy, monthCategory);
                    const payment = monthlyPayments.find(p => p.propertyId === selectedProperty.id && p.year === year && p.month === month && p.ownerId === owner.id);
                    const paid = payment?.amountPaid || 0;
                    const deficit = adjustedDue - paid;
                    if (deficit > 0.01 && payment?.status !== PaymentStatus.PAUSED) {
                        deficits.push({ name: owner.fullName, expected: adjustedDue, paid, deficit });
                    }
                });
                rows = deficits.map(d => [d.name, formatCurrency(d.expected), formatCurrency(d.paid), formatCurrency(d.deficit)]);
                const totalDeficit = deficits.reduce((sum, d) => sum + d.deficit, 0);
                footer = [t('total'), '', '', formatCurrency(totalDeficit)];
                break;
            }
            case 'income_yearly_deficit': {
                title = `${t('report_deficit_report')} - ${year}`;
                headers = [t('owner'), t('total_deficit')];
                const yearlyDeficits: { name: string, deficit: number }[] = [];
                activeOwners.forEach(owner => {
                    const ownerUnits = units.filter(u => u.ownerId === owner.id);
                    const ownerUnitType = unitTypes.find(ut => ownerUnits.some(ou => ou.unitTypeId === ut.id));
                    if (!ownerUnitType) return;
                    const ownerJoinDate = owner.joinDate ? new Date(owner.joinDate) : constructionDate;
                    const startDate = ownerJoinDate > constructionDate ? ownerJoinDate : constructionDate;
                    let totalDeficit = 0;
                    for (let m = 0; m < 12; m++) {
                        const monthDate = new Date(year, m + 1, 0); // End of month
                        if (monthDate < startDate) continue;
                        const policy = getUnitTypeFeePolicy(selectedProperty.id, year, ownerUnitType.id);
                        const baseFee = policy?.baseFee || 0;
                        const monthCategory = getMonthCategory(year, m);
                        const adjustedDue = getAdjustedMonthlyFee(baseFee, policy, monthCategory);
                        const payment = monthlyPayments.find(p => p.propertyId === selectedProperty.id && p.year === year && p.month === m && p.ownerId === owner.id);
                        const paid = payment?.amountPaid || 0;
                        const deficit = adjustedDue - paid;
                        if (deficit > 0.01 && payment?.status !== PaymentStatus.PAUSED) {
                            totalDeficit += deficit;
                        }
                    }
                    if (totalDeficit > 0.01) {
                        yearlyDeficits.push({ name: owner.fullName, deficit: totalDeficit });
                    }
                });
                rows = yearlyDeficits.sort((a,b) => b.deficit - a.deficit).map(d => [d.name, formatCurrency(d.deficit)]);
                const grandTotalDeficit = yearlyDeficits.reduce((sum, d) => sum + d.deficit, 0);
                footer = [t('grand_total'), formatCurrency(grandTotalDeficit)];
                break;
            }
            case 'outcome_monthly_by_month': {
                const monthName = new Date(year, month!).toLocaleString(language, { month: 'long' });
                title = t('monthly_outcome_for_month', { month: monthName, year });
                headers = [t('expense_category'), t('amount')];
                const outcomes = monthlyOutcomes.filter(o => o.propertyId === selectedProperty.id && o.year == year && o.month == month && o.isConfirmed);
                const outcomesMap = new Map(outcomes.map(o => [o.categoryId, o.amount]));
                rows = activeCategories.map(cat => [cat.name, formatCurrency(outcomesMap.get(cat.id) || 0)]);
                const total = outcomes.reduce((sum, o) => sum + o.amount, 0);
                footer = [t('total'), formatCurrency(total)];
                break;
            }
            case 'outcome_monthly_by_category': {
                 const category = expenseCategories.find(c => c.id === itemId);
                title = t('monthly_outcome_for_category', { category: category?.name, year });
                headers = [t('month'), t('amount')];
                const outcomes = monthlyOutcomes.filter(o => o.propertyId === selectedProperty.id && o.year == year && o.categoryId === itemId && o.isConfirmed);
                const outcomesMap = new Map(outcomes.map(o => [o.month, o.amount]));
                rows = Array.from({ length: 12 }, (_, i) => i)
                    .filter(isPropertyMonthValid)
                    .map(i => [new Date(year, i).toLocaleString(language, { month: 'long' }), formatCurrency(outcomesMap.get(i) || 0)]);
                const total = outcomes.reduce((sum, o) => sum + o.amount, 0);
                footer = [t('total'), formatCurrency(total)];
                break;
            }
            case 'outcome_yearly_all': {
                title = t('yearly_outcome_all_categories', { year });
                headers = [t('expense_category'), t('total')];
                const outcomes = monthlyOutcomes.filter(o => o.propertyId === selectedProperty.id && o.year == year && o.isConfirmed);
                rows = activeCategories.map(cat => {
                    const total = outcomes.filter(o => o.categoryId === cat.id).reduce((sum, o) => sum + o.amount, 0);
                    return [cat.name, formatCurrency(total)];
                });
                const grandTotal = outcomes.reduce((sum, o) => sum + o.amount, 0);
                footer = [t('grand_total'), formatCurrency(grandTotal)];
                break;
            }
            case 'outcome_yearly_single': {
                const category = expenseCategories.find(c => c.id === itemId);
                title = t('yearly_outcome_for_category', { category: category?.name });
                headers = [t('year'), t('total')];
                const outcomes = monthlyOutcomes.filter(o => o.propertyId === selectedProperty.id && o.categoryId === itemId && o.isConfirmed);
                const yearMap = new Map<number, number>();
                outcomes.forEach(o => yearMap.set(o.year, (yearMap.get(o.year) || 0) + o.amount));
                rows = allYears.map(y => [y, formatCurrency(yearMap.get(y) || 0)]);
                const grandTotal = outcomes.reduce((sum, o) => sum + o.amount, 0);
                footer = [t('grand_total'), formatCurrency(grandTotal)];
                break;
            }
            case 'balance': {
                title = t('balance_report_for_year', { year });
                headers = [t('month'), t('income'), t('outcome'), t('balance')];
                const incomes = monthlyPayments.filter(p => p.propertyId === selectedProperty.id && p.year == year);
                const outcomes = monthlyOutcomes.filter(o => o.propertyId === selectedProperty.id && o.year == year && o.isConfirmed);
                rows = Array.from({ length: 12 }, (_, i) => i)
                    .filter(isPropertyMonthValid)
                    .map(i => {
                        const monthIncome = incomes.filter(p => p.month == i).reduce((sum, p) => sum + p.amountPaid, 0);
                        const monthOutcome = outcomes.filter(o => o.month == i).reduce((sum, o) => sum + o.amount, 0);
                        return [
                            new Date(year, i).toLocaleString(language, { month: 'long' }),
                            formatCurrency(monthIncome),
                            formatCurrency(monthOutcome),
                            formatCurrency(monthIncome - monthOutcome)
                        ];
                    });
                const totalIncome = incomes.reduce((sum, p) => sum + p.amountPaid, 0);
                const totalOutcome = outcomes.reduce((sum, o) => sum + o.amount, 0);
                footer = [t('total'), formatCurrency(totalIncome), formatCurrency(totalOutcome), formatCurrency(totalIncome - totalOutcome)];
                break;
            }
            default:
                return { title: 'Invalid Report', content: <p>The selected report type is not valid.</p> };
        }

        return {
            title,
            content: <ReportTable headers={headers} rows={rows} footer={footer} />
        };

    }, [view, year, month, itemId, selectedProperty, language, t, owners, monthlyPayments, expenseCategories, monthlyOutcomes, units, unitTypes, getUnitTypeFeePolicy, formatCurrency]);

    return (
        <div id="report_regular_budget-report-area" className="report-page">
            <div className="report-header-group"><ReportHeader /></div>
            <div className="report-body-group">
                <main className="space-y-8">
                    <div className="text-center mt-8 mb-12">
                        <h1 className="text-2xl font-bold text-gray-800 dark-text-fix">{reportContent.title}</h1>
                    </div>
                    {reportContent.content}
                </main>
            </div>
            <div className="report-footer-group"><ReportFooter /></div>
        </div>
    );
};

export default RegularBudgetReport;