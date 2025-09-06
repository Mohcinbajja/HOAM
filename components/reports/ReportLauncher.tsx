import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useData } from '../../contexts/DataContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { TranslationKey } from '../../lib/translations';
import ReportModal from './ReportModal';

const selectClasses = "w-full mt-1 px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";

const ReportGroup: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">{title}</h3>
        <div className="space-y-3">{children}</div>
    </div>
);

const ReportActionRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between p-2 rounded-md bg-gray-50 dark:bg-gray-800/50 gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <div className="flex w-full sm:w-auto items-center justify-end gap-2">
            {children}
        </div>
    </div>
);


const ReportLauncher: React.FC = () => {
    const { t, language } = useLanguage();
    const { selectedProperty, owners, monthlyPayments, exceptionalProjects } = useData();

    const [modalProps, setModalProps] = useState<any | null>(null);
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [month, setMonth] = useState<number>(new Date().getMonth());
    const [ownerId, setOwnerId] = useState<string | null>(null);

    const activeOwners = useMemo(() => {
        if (!selectedProperty) return [];
        return owners.filter(o => o.propertyId === selectedProperty.id && o.isActive).sort((a, b) => a.fullName.localeCompare(b.fullName));
    }, [owners, selectedProperty]);
    
    useEffect(() => {
        if (activeOwners.length > 0 && !ownerId) {
            setOwnerId(activeOwners[0].id);
        }
    }, [activeOwners, ownerId]);

    const yearOptions = useMemo(() => {
        if (!selectedProperty) return [];
        const constructionYear = selectedProperty.details.constructionDate ? new Date(selectedProperty.details.constructionDate).getFullYear() : new Date().getFullYear() - 10;
        const currentYear = new Date().getFullYear();
        const years = new Set<number>();
        for (let y = currentYear + 1; y >= constructionYear; y--) years.add(y);
        monthlyPayments.filter(p => p.propertyId === selectedProperty.id).forEach(p => years.add(p.year));
        exceptionalProjects.filter(p => p.propertyId === selectedProperty.id).forEach(p => years.add(p.year));
        return Array.from(years).sort((a, b) => b - a);
    }, [selectedProperty, monthlyPayments, exceptionalProjects]);
    
    const monthOptions = useMemo(() => {
        return Array.from({ length: 12 }, (_, i) => ({
            value: i,
            label: new Date(year, i).toLocaleString(language, { month: 'long' }),
        }));
    }, [year, language]);

    useEffect(() => {
        if (yearOptions.length > 0 && !yearOptions.includes(year)) {
            setYear(yearOptions[0]);
        }
    }, [yearOptions, year]);

    const generateReport = (reportType: string, view: string, params: object = {}) => {
        setModalProps({ reportKey: reportType, view, year, ...params });
    };

    return (
        <>
            <div className="max-w-4xl mx-auto space-y-8">
                <Card title={t('administrative_reports')}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[ 'report_property', 'report_units', 'report_owners', 'report_committee' ].map((key) => (
                             <div key={key} className="p-4 border dark:border-gray-700 rounded-lg flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                                 <span className="font-medium">{t(key as TranslationKey)}</span>
                                <Button size="sm" onClick={() => setModalProps({ reportKey: key })}>
                                    <Icon name="reports" className="h-4 w-4 mr-2" />
                                    {t('generate_report')}
                                </Button>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card title={t('financial_reports')}>
                    <div className="space-y-6">
                        <ReportGroup title={t('module_regularbudget')}>
                            <div className="space-y-6">
                                {/* INCOME REPORTS */}
                                <ReportGroup title={t('report_income_reports')}>
                                    <div className="pl-4 border-l-2 border-gray-200 dark:border-gray-600 space-y-4">
                                        <div>
                                            <h4 className="font-medium mb-2">{t('report_monthly_reports')}</h4>
                                            <div className="space-y-2">
                                                <ReportActionRow label={t('report_owner_statement')}>
                                                    <select value={ownerId ?? ''} onChange={e => setOwnerId(e.target.value)} className={selectClasses}><option value="" disabled>{t('report_select_owner')}</option>{activeOwners.map(o => <option key={o.id} value={o.id}>{o.fullName}</option>)}</select>
                                                    <select value={year} onChange={e => setYear(Number(e.target.value))} className={selectClasses}>{yearOptions.map(y => <option key={y} value={y}>{y}</option>)}</select>
                                                    <Button onClick={() => generateReport('report_regular_budget', 'income_monthly_by_owner', { itemId: ownerId })} size="sm" disabled={!ownerId}>{t('generate_report')}</Button>
                                                </ReportActionRow>
                                                <ReportActionRow label={t('report_monthly_summary')}>
                                                    <select value={month} onChange={e => setMonth(Number(e.target.value))} className={selectClasses}>{monthOptions.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}</select>
                                                    <select value={year} onChange={e => setYear(Number(e.target.value))} className={selectClasses}>{yearOptions.map(y => <option key={y} value={y}>{y}</option>)}</select>
                                                    <Button onClick={() => generateReport('report_regular_budget', 'income_monthly_by_month', { month })} size="sm">{t('generate_report')}</Button>
                                                </ReportActionRow>
                                                <ReportActionRow label={t('report_deficit_report')}>
                                                    <select value={month} onChange={e => setMonth(Number(e.target.value))} className={selectClasses}>{monthOptions.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}</select>
                                                    <select value={year} onChange={e => setYear(Number(e.target.value))} className={selectClasses}>{yearOptions.map(y => <option key={y} value={y}>{y}</option>)}</select>
                                                    <Button onClick={() => generateReport('report_regular_budget', 'income_monthly_deficit', { month })} size="sm">{t('generate_report')}</Button>
                                                </ReportActionRow>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-medium mb-2">{t('report_yearly_reports')}</h4>
                                            <div className="space-y-2">
                                                <ReportActionRow label={t('report_annual_income_report')}>
                                                    <select value={year} onChange={e => setYear(Number(e.target.value))} className={selectClasses}>{yearOptions.map(y => <option key={y} value={y}>{y}</option>)}</select>
                                                    <Button onClick={() => generateReport('report_regular_budget', 'income_yearly_all')} size="sm">{t('generate_report')}</Button>
                                                </ReportActionRow>
                                                <ReportActionRow label={t('report_deficit_report')}>
                                                    <select value={year} onChange={e => setYear(Number(e.target.value))} className={selectClasses}>{yearOptions.map(y => <option key={y} value={y}>{y}</option>)}</select>
                                                    <Button onClick={() => generateReport('report_regular_budget', 'income_yearly_deficit')} size="sm">{t('generate_report')}</Button>
                                                </ReportActionRow>
                                            </div>
                                        </div>
                                    </div>
                                </ReportGroup>
                                
                                {/* OUTCOME REPORTS */}
                                <ReportGroup title={t('report_outcome_reports')}>
                                <div className="pl-4 border-l-2 border-gray-200 dark:border-gray-600 space-y-4">
                                        <div>
                                            <h4 className="font-medium mb-2">{t('report_monthly_reports')}</h4>
                                            <div className="space-y-2">
                                                <ReportActionRow label={t('report_monthly_summary')}>
                                                    <select value={month} onChange={e => setMonth(Number(e.target.value))} className={selectClasses}>{monthOptions.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}</select>
                                                    <select value={year} onChange={e => setYear(Number(e.target.value))} className={selectClasses}>{yearOptions.map(y => <option key={y} value={y}>{y}</option>)}</select>
                                                    <Button onClick={() => generateReport('report_regular_budget', 'outcome_monthly_by_month', { month })} size="sm">{t('generate_report')}</Button>
                                                </ReportActionRow>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-medium mb-2">{t('report_yearly_reports')}</h4>
                                            <div className="space-y-2">
                                                <ReportActionRow label={t('report_annual_outcome_report')}>
                                                    <select value={year} onChange={e => setYear(Number(e.target.value))} className={selectClasses}>{yearOptions.map(y => <option key={y} value={y}>{y}</option>)}</select>
                                                    <Button onClick={() => generateReport('report_regular_budget', 'outcome_yearly_all')} size="sm">{t('generate_report')}</Button>
                                                </ReportActionRow>
                                            </div>
                                        </div>
                                    </div>
                                </ReportGroup>
                                
                                {/* BALANCE REPORTS */}
                                <ReportGroup title={t('report_balance_reports')}>
                                    <ReportActionRow label={t('report_net_financial_balance')}>
                                        <select value={year} onChange={e => setYear(Number(e.target.value))} className={selectClasses}>{yearOptions.map(y => <option key={y} value={y}>{y}</option>)}</select>
                                        <Button onClick={() => generateReport('report_regular_budget', 'balance')} size="sm">{t('generate_report')}</Button>
                                    </ReportActionRow>
                                    <ReportActionRow label={t('report_combined_income')}>
                                        <Button onClick={() => setModalProps({ reportKey: 'report_combined_income' })} size="sm">{t('generate_report')}</Button>
                                    </ReportActionRow>
                                </ReportGroup>
                            </div>
                        </ReportGroup>
                        <ReportGroup title={t('module_exceptionalbudget')}>
                            <ReportActionRow label={t('report_exceptional_budget')}>
                                <select value={year} onChange={e => setYear(Number(e.target.value))} className={selectClasses}>{yearOptions.map(y => <option key={y} value={y}>{y}</option>)}</select>
                                <Button onClick={() => setModalProps({ reportKey: 'report_exceptional_budget', year })} size="sm">{t('generate_report')}</Button>
                            </ReportActionRow>
                        </ReportGroup>
                    </div>
                </Card>
            </div>
            {modalProps && (
                <ReportModal
                    isOpen={!!modalProps}
                    onClose={() => setModalProps(null)}
                    {...modalProps}
                />
            )}
        </>
    );
};

export default ReportLauncher;
