

import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Owner, MonthlyPayment, PaymentStatus, UnitTypeFeePolicy, AmountType } from '../../types';
import PaymentCell from './PaymentCell';
import PaymentModal from './PaymentModal';
import Icon from '../ui/Icon';
import Button from '../ui/Button';
import { downloadElementAsPdf, exportDataToXlsx } from '../../lib/exportUtils';
import BudgetTableReport from './BudgetTableReport';

interface IncomeMatrixProps {
    selectedYear: number;
    onGenerateReport: (props: any) => void;
}

const IncomeMatrix: React.FC<IncomeMatrixProps> = ({ selectedYear, onGenerateReport }) => {
    const { t, language } = useLanguage();
    const { 
        selectedProperty, 
        owners, 
        units,
        unitTypes,
        getPaymentsForYear, 
        getUnitTypeFeePolicy 
    } = useData();
    
    const [payments, setPayments] = useState<MonthlyPayment[]>([]);
    const [modalInfo, setModalInfo] = useState<any | null>(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isExportingPdf, setIsExportingPdf] = useState(false);
    
    useEffect(() => {
        if (selectedProperty) {
            setPayments(getPaymentsForYear(selectedProperty.id, selectedYear));
        }
    }, [selectedProperty, selectedYear, getPaymentsForYear, payments]); // Listen to payments to force re-render on change

    const getMonthCategory = (year: number, month: number): 'past' | 'current' | 'future' => {
        const now = new Date();
        now.setHours(0,0,0,0);
        const date = new Date(year, month);
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

    const matrixData = useMemo(() => {
        if (!selectedProperty) return null;

        const constructionDate = new Date(selectedProperty.details.constructionDate);
        const constructionYear = constructionDate.getFullYear();
        const constructionMonth = constructionDate.getMonth();

        const activeOwners = owners
            .filter(o => 
                o.propertyId === selectedProperty.id && 
                o.isActive &&
                (!o.joinDate || new Date(o.joinDate) <= new Date(selectedYear, 11, 31))
            )
            .sort((a, b) => a.fullName.localeCompare(b.fullName));

        const monthlyTotals = Array(12).fill(0).map(() => ({ paid: 0, expected: 0, deficit: 0 }));

        const ownerRows = activeOwners.map(owner => {
            let totalPaid = 0;
            let totalExpected = 0;
            const ownerUnits = units.filter(u => u.ownerId === owner.id);
            const ownerUnitType = unitTypes.find(ut => ownerUnits.some(ou => ou.unitTypeId === ut.id));
            const ownerJoinDate = owner.joinDate ? new Date(owner.joinDate) : null;

            const cells = Array.from({ length: 12 }, (_, monthIndex) => {
                const isMonthActiveForProperty = selectedYear > constructionYear || (selectedYear === constructionYear && monthIndex >= constructionMonth);
                const hasOwnerJoined = !ownerJoinDate || ownerJoinDate <= new Date(selectedYear, monthIndex + 1, 0);
                const isCellActive = isMonthActiveForProperty && hasOwnerJoined;

                if (!isCellActive || !ownerUnitType) {
                    return { active: false, payment: null, expected: 0, paid: 0, monthCategory: 'future' as const, policy: undefined };
                }

                const payment = payments.find(p => p.ownerId === owner.id && p.month === monthIndex) || null;
                const paid = payment?.amountPaid || 0;
                const policy = getUnitTypeFeePolicy(selectedProperty.id, selectedYear, ownerUnitType.id);
                const baseFee = policy?.baseFee || 0;
                const monthCategory = getMonthCategory(selectedYear, monthIndex);
                const expected = getAdjustedMonthlyFee(baseFee, policy, monthCategory);

                totalPaid += paid;
                totalExpected += expected;
                monthlyTotals[monthIndex].paid += paid;
                monthlyTotals[monthIndex].expected += expected;

                return { active: true, payment, expected, paid, monthCategory, policy, ownerUnitType };
            });

            const totalDeficit = totalExpected - totalPaid;
            return { owner, cells, totalPaid, totalExpected, totalDeficit };
        });
        
        monthlyTotals.forEach(m => { m.deficit = m.expected - m.paid; });
        const grandTotalPaid = monthlyTotals.reduce((sum, m) => sum + m.paid, 0);
        const grandTotalExpected = monthlyTotals.reduce((sum, m) => sum + m.expected, 0);
        const grandTotalDeficit = grandTotalExpected - grandTotalPaid;

        return { ownerRows, monthlyTotals, grandTotalPaid, grandTotalExpected, grandTotalDeficit };
    }, [selectedProperty, selectedYear, owners, units, unitTypes, payments, getUnitTypeFeePolicy]);

    const handleCellClick = (owner: Owner, monthIndex: number) => {
        if (!selectedProperty || !matrixData) return;
        const ownerRow = matrixData.ownerRows.find(r => r.owner.id === owner.id);
        const cellData = ownerRow?.cells[monthIndex];
        if (!cellData || !cellData.active) return;
        
        const { payment, monthCategory, ownerUnitType, policy } = cellData;
        const baseFeeForYear = policy?.baseFee || 0;
        
        setModalInfo({ owner, month: monthIndex, year: selectedYear, baseFeeForYear, payment, monthCategory, unitType: ownerUnitType });
    };

    const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'] as const;
    const formatNumber = (amount: number) => new Intl.NumberFormat(language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
    
    const currency = selectedProperty?.details.currency || 'USD';
    const formatCurrency = (amount: number) => new Intl.NumberFormat(language, { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount);
    
    const handleExportPdf = () => {
        setIsExportingPdf(true);
    };

    useEffect(() => {
        if (isExportingPdf) {
            const generate = async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
                try {
                    await downloadElementAsPdf('income-matrix-report', `${t('income_matrix')}_${selectedYear}`, 'l');
                } finally {
                    setIsExportingPdf(false);
                }
            };
            generate();
        }
    }, [isExportingPdf, selectedYear, t]);

    const handleExportXlsx = () => {
        if (!matrixData) return;

        const headers = [t('owner'), ...monthKeys.map(m => t(m)), t('total'), t('deficit')];
        
        const data = matrixData.ownerRows.map(row => {
            const monthlyValues = row.cells.map(cell => cell.active ? cell.paid : '');
            return [
                row.owner.fullName,
                ...monthlyValues,
                row.totalPaid,
                row.totalDeficit
            ];
        });

        // Add footer rows
        data.push([t('sum'), ...matrixData.monthlyTotals.map(m => m.paid), matrixData.grandTotalPaid, matrixData.grandTotalDeficit]);
        data.push([t('expected_income'), ...matrixData.monthlyTotals.map(m => m.expected), matrixData.grandTotalExpected, '']);
        data.push([t('deficit'), ...matrixData.monthlyTotals.map(m => m.deficit), matrixData.grandTotalDeficit, '']);

        exportDataToXlsx(headers, data, `${t('income_matrix')}_${selectedYear}`, t('income'));
    };


    if (!matrixData) {
        return <div className="text-center p-8">{t('no_payments_for_year')}</div>;
    }

    const { ownerRows, monthlyTotals, grandTotalPaid, grandTotalExpected, grandTotalDeficit } = matrixData;

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between mb-4 gap-4 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-2">
                    <Button variant="secondary" onClick={handleExportXlsx}><Icon name="excel" className="w-5 h-5 mr-2" />{t('export_excel')}</Button>
                    <Button variant="secondary" onClick={handleExportPdf} disabled={isExportingPdf}>
                        {isExportingPdf ? (
                            <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                            <Icon name="pdf" className="w-5 h-5 mr-2" />
                        )}
                        {t('export_pdf')}
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{t('zoom')}</span>
                    <Button variant="secondary" onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.1))}><Icon name="zoom_out" className="w-5 h-5" /></Button>
                    <Button variant="secondary" onClick={() => setZoomLevel(z => Math.min(1.5, z + 0.1))}><Icon name="zoom_in" className="w-5 h-5" /></Button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700" style={{ fontSize: `${zoomLevel}rem` }}>
                    <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                            <th className="sticky left-0 bg-gray-100 dark:bg-gray-700 px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('owner')}</th>
                            {monthKeys.map(month => (
                                <th key={month} className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t(month)}</th>
                            ))}
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('total')}</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('deficit')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {ownerRows.map(({ owner, cells, totalPaid, totalDeficit }) => (
                            <tr key={owner.id}>
                                <td className="sticky left-0 bg-white dark:bg-gray-800 px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white group">
                                    <div className="flex items-center justify-between">
                                        <span>{owner.fullName}</span>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="secondary" size="sm" onClick={() => onGenerateReport({ reportKey: 'report_regular_budget', view: 'income_monthly_by_owner', year: selectedYear, itemId: owner.id })} title={t('report')}>
                                                <Icon name="reports" className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </td>
                                {cells.map((cell, index) => (
                                    cell.active
                                        ? <PaymentCell key={index} payment={cell.payment} onClick={() => handleCellClick(owner, index)} monthCategory={cell.monthCategory} isEditable={!!cell.ownerUnitType} adjustedDue={cell.expected} />
                                        : <td key={index} className="px-3 py-2 text-center text-gray-400 bg-gray-50 dark:bg-gray-700/50">-</td>
                                ))}
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-semibold">{formatNumber(totalPaid)}</td>
                                <td className={`px-3 py-2 whitespace-nowrap text-sm text-right font-semibold ${totalDeficit > 0 ? 'text-red-600' : ''}`}>{formatNumber(totalDeficit)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-100 dark:bg-gray-700 font-bold">
                        <tr>
                            <td className="sticky left-0 bg-gray-100 dark:bg-gray-700 px-3 py-2 text-left text-xs uppercase text-gray-500 dark:text-gray-300">{t('sum')}</td>
                            {monthlyTotals.map((m, i) => <td key={i} className="px-3 py-2 text-center text-sm">{formatNumber(m.paid)}</td>)}
                            <td className="px-3 py-2 text-right text-sm">{formatNumber(grandTotalPaid)}</td>
                            <td className="px-3 py-2 text-right text-sm">{formatNumber(grandTotalDeficit)}</td>
                        </tr>
                        <tr>
                            <td className="sticky left-0 bg-gray-100 dark:bg-gray-700 px-3 py-2 text-left text-xs uppercase text-gray-500 dark:text-gray-300">{t('expected_income')}</td>
                            {monthlyTotals.map((m, i) => <td key={i} className="px-3 py-2 text-center text-sm text-gray-500">{formatNumber(m.expected)}</td>)}
                            <td className="px-3 py-2 text-right text-sm text-gray-500">{formatNumber(grandTotalExpected)}</td>
                            <td></td>
                        </tr>
                         <tr>
                            <td className="sticky left-0 bg-gray-100 dark:bg-gray-700 px-3 py-2 text-left text-xs uppercase text-gray-500 dark:text-gray-300">{t('deficit')}</td>
                            {monthlyTotals.map((m, i) => <td key={i} className={`px-3 py-2 text-center text-sm ${m.deficit > 0 ? 'text-red-600' : ''}`}>{formatNumber(m.deficit)}</td>)}
                            <td className={`px-3 py-2 text-right text-sm ${grandTotalDeficit > 0 ? 'text-red-600' : ''}`}>{formatNumber(grandTotalDeficit)}</td>
                            <td></td>
                        </tr>
                        <tr>
                            <td className="sticky left-0 bg-gray-100 dark:bg-gray-700 px-3 py-2 text-left text-xs uppercase text-gray-500 dark:text-gray-300">{t('report')}</td>
                            {monthKeys.map((monthKey, index) => (
                                <td key={index} className="px-3 py-2 text-center">
                                    <Button variant="secondary" size="sm" onClick={() => onGenerateReport({ reportKey: 'report_regular_budget', view: 'income_monthly_by_month', year: selectedYear, month: index })} title={`${t('export_pdf')} for ${t(monthKey)}`}>
                                        <Icon name="pdf" className="w-4 h-4" />
                                    </Button>
                                </td>
                            ))}
                            <td colSpan={2}></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            {isExportingPdf && matrixData && (
                <BudgetTableReport
                    id="income-matrix-report"
                    title={`${t('income_matrix')} - ${selectedYear}`}
                    headers={[t('owner'), ...monthKeys.map(m => t(m)), t('total'), t('deficit')]}
                    rows={matrixData.ownerRows.map(row => [
                        row.owner.fullName,
                        ...row.cells.map(cell => cell.active ? formatCurrency(cell.paid) : '-'),
                        formatCurrency(row.totalPaid),
                        formatCurrency(row.totalDeficit),
                    ])}
                    footer={[
                        [t('sum'), ...matrixData.monthlyTotals.map(m => formatCurrency(m.paid)), formatCurrency(matrixData.grandTotalPaid), formatCurrency(matrixData.grandTotalDeficit)],
                        [t('expected_income'), ...matrixData.monthlyTotals.map(m => formatCurrency(m.expected)), formatCurrency(matrixData.grandTotalExpected), ''],
                        [t('deficit'), ...matrixData.monthlyTotals.map(m => formatCurrency(m.deficit)), formatCurrency(matrixData.grandTotalDeficit), ''],
                    ]}
                />
            )}
            {modalInfo && (
                <PaymentModal
                    isOpen={!!modalInfo}
                    onClose={() => setModalInfo(null)}
                    modalInfo={modalInfo}
                />
            )}
        </div>
    );
};

export default IncomeMatrix;