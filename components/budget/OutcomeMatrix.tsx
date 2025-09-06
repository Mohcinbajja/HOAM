

import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { ExpenseCategory, MonthlyOutcome } from '../../types';
import OutcomeCell from './OutcomeCell';
import OutcomeEntryModal from './OutcomeEntryModal';
import Icon from '../ui/Icon';
import Button from '../ui/Button';
import { downloadElementAsPdf, exportDataToXlsx } from '../../lib/exportUtils';
import BudgetTableReport from './BudgetTableReport';

interface OutcomeMatrixProps {
    selectedYear: number;
    onGenerateReport: (props: any) => void;
}

type ModalInfo = {
    category: ExpenseCategory;
    month: number;
    outcome: MonthlyOutcome | null;
}

const OutcomeMatrix: React.FC<OutcomeMatrixProps> = ({ selectedYear, onGenerateReport }) => {
    const { t, language } = useLanguage();
    const { 
        selectedProperty, 
        initializeExpenseCategories,
        getExpenseCategoriesForProperty,
        addExpenseCategory,
        updateExpenseCategory,
        archiveExpenseCategory,
        getMonthlyOutcomesForYear,
        isExpenseCategoryInUse,
    } = useData();

    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [outcomes, setOutcomes] = useState<MonthlyOutcome[]>([]);
    const [modalInfo, setModalInfo] = useState<ModalInfo | null>(null);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState<{id: string, name: string} | null>(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isExportingPdf, setIsExportingPdf] = useState(false);

    useEffect(() => {
        if (selectedProperty) {
            const initialCategories = initializeExpenseCategories(selectedProperty.id);
            setCategories(initialCategories.filter(c => !c.isArchived));
            const yearOutcomes = getMonthlyOutcomesForYear(selectedProperty.id, selectedYear);
            setOutcomes(yearOutcomes);
        }
    }, [selectedProperty, selectedYear, initializeExpenseCategories, getMonthlyOutcomesForYear]);
    
    // This effect ensures the local category list is updated when global state changes (e.g., after adding/editing)
    useEffect(() => {
        if (selectedProperty) {
            setCategories(getExpenseCategoriesForProperty(selectedProperty.id));
        }
    }, [getExpenseCategoriesForProperty, selectedProperty, outcomes]); // Depend on outcomes to refresh after update


    const handleCellClick = (category: ExpenseCategory, month: number) => {
        const outcome = outcomes.find(o => o.categoryId === category.id && o.month === month) || null;
        setModalInfo({ category, month, outcome });
    };
    
    const handleAddCategory = () => {
        if (newCategoryName.trim() && selectedProperty) {
            addExpenseCategory(selectedProperty.id, newCategoryName.trim());
            setNewCategoryName('');
        }
    };
    
    const handleUpdateCategory = (categoryId: string) => {
        if (editingCategory && editingCategory.name.trim()) {
            updateExpenseCategory(categoryId, editingCategory.name.trim());
            setEditingCategory(null);
        }
    };
    
    const handleDeleteCategory = (categoryId: string) => {
        if(window.confirm(t('delete_category_confirm'))) {
            archiveExpenseCategory(categoryId);
        }
    };

    const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'] as const;
    const formatNumber = (amount: number) => new Intl.NumberFormat(language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
    
    const currency = selectedProperty?.details.currency || 'USD';
    const formatCurrency = (amount: number) => new Intl.NumberFormat(language, { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount);

    const { constructionYear, constructionMonth } = useMemo(() => {
        if (!selectedProperty) return { constructionYear: 1900, constructionMonth: 0 };
        const constructionDate = new Date(selectedProperty.details.constructionDate);
        return {
            constructionYear: constructionDate.getFullYear(),
            constructionMonth: constructionDate.getMonth(),
        };
    }, [selectedProperty]);

    const handleExportPdf = () => {
        setIsExportingPdf(true);
    };

    useEffect(() => {
        if (isExportingPdf) {
            const generate = async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
                try {
                    await downloadElementAsPdf('outcome-matrix-report', `${t('outcome_matrix')}_${selectedYear}`, 'l');
                } finally {
                    setIsExportingPdf(false);
                }
            };
            generate();
        }
    }, [isExportingPdf, selectedYear, t]);

    const handleExportXlsx = () => {
        const headers = [t('expense_category'), ...monthKeys.map(m => t(m)), t('total')];
        
        const data = categories.map(category => {
            let categoryTotal = 0;
            const monthlyValues = monthKeys.map((_, index) => {
                 const outcome = outcomes.find(o => o.categoryId === category.id && o.month === index) || null;
                 const amount = outcome?.isConfirmed ? outcome.amount : 0;
                 categoryTotal += amount;
                 return amount;
            });
            return [category.name, ...monthlyValues, categoryTotal];
        });

        const footer = [
            t('total'),
            ...monthKeys.map((_, index) => outcomes.filter(o => o.month === index && o.isConfirmed).reduce((sum, o) => sum + o.amount, 0)),
            outcomes.filter(o => o.isConfirmed).reduce((sum, o) => sum + o.amount, 0)
        ];

        exportDataToXlsx(headers, [...data, footer], `${t('outcome_matrix')}_${selectedYear}`, t('outcome'));
    };

    const pdfReportData = useMemo(() => {
        if (!isExportingPdf) return null;
    
        const headers = [t('expense_category'), ...monthKeys.map(m => t(m)), t('total')];
        const rows = categories.map(category => {
            let categoryTotal = 0;
            const monthlyValues = monthKeys.map((_, index) => {
                 const outcome = outcomes.find(o => o.categoryId === category.id && o.month === index) || null;
                 const amount = outcome?.isConfirmed ? outcome.amount : 0;
                 categoryTotal += amount;
                 return formatCurrency(amount);
            });
            return [category.name, ...monthlyValues, formatCurrency(categoryTotal)];
        });
        const footer = [[
            t('total'),
            ...monthKeys.map((_, index) => formatCurrency(outcomes.filter(o => o.month === index && o.isConfirmed).reduce((sum, o) => sum + o.amount, 0))),
            formatCurrency(outcomes.filter(o => o.isConfirmed).reduce((sum, o) => sum + o.amount, 0))
        ]];
    
        return { headers, rows, footer };
    }, [isExportingPdf, categories, outcomes, monthKeys, selectedYear, t, formatCurrency]);


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
                            <th className="sticky left-0 bg-gray-100 dark:bg-gray-700 px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('expense_category')}</th>
                            {monthKeys.map(month => (
                                <th key={month} className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t(month)}</th>
                            ))}
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('total')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                       {categories.map(category => {
                           let categoryTotal = 0;
                           const isEditing = editingCategory?.id === category.id;
                           return (
                               <tr key={category.id}>
                                   <td className="sticky left-0 bg-white dark:bg-gray-800 px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white group">
                                       <div className="flex items-center justify-between">
                                          {isEditing ? (
                                              <input 
                                                 type="text" 
                                                 value={editingCategory.name}
                                                 onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                                                 onBlur={() => handleUpdateCategory(category.id)}
                                                 onKeyDown={(e) => e.key === 'Enter' && handleUpdateCategory(category.id)}
                                                 className="bg-transparent border-b border-blue-500 focus:outline-none"
                                                 autoFocus
                                              />
                                          ) : (
                                              <span>{category.name}</span>
                                          )}
                                           <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => onGenerateReport({ reportKey: 'report_regular_budget', view: 'outcome_monthly_by_category', year: selectedYear, itemId: category.id })} 
                                                    className="p-1"
                                                    title={t('report')}
                                                >
                                                    <Icon name="reports" className="w-4 h-4 text-gray-500"/>
                                                </button>
                                               {!category.isPredefined && (
                                                 <>
                                                   <button onClick={() => setEditingCategory({id: category.id, name: category.name})} className="p-1"><Icon name="edit" className="w-4 h-4 text-gray-500"/></button>
                                                   <button onClick={() => handleDeleteCategory(category.id)} disabled={isExpenseCategoryInUse(category.id)} className="p-1 disabled:opacity-25"><Icon name="delete" className="w-4 h-4 text-red-500"/></button>
                                                 </>
                                               )}
                                           </div>
                                       </div>
                                   </td>
                                   {monthKeys.map((_, index) => {
                                       const isMonthActive = selectedYear > constructionYear || (selectedYear === constructionYear && index >= constructionMonth);
                                       if (!isMonthActive) {
                                           return <td key={index} className="px-3 py-2 text-center text-gray-400 bg-gray-50 dark:bg-gray-700/50">-</td>;
                                       }
                                       const outcome = outcomes.find(o => o.categoryId === category.id && o.month === index) || null;
                                       if(outcome?.isConfirmed){
                                           categoryTotal += outcome.amount;
                                       }
                                       return <OutcomeCell key={index} outcome={outcome} onClick={() => handleCellClick(category, index)} />
                                   })}
                                   <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-semibold">{formatNumber(categoryTotal)}</td>
                               </tr>
                           )
                       })}
                    </tbody>
                    <tfoot className="bg-gray-100 dark:bg-gray-700 font-bold">
                        <tr>
                            <td className="sticky left-0 bg-gray-100 dark:bg-gray-700 px-3 py-2">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        placeholder={t('new_category_name')}
                                        className="w-full px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm"
                                    />
                                    <Button onClick={handleAddCategory} disabled={!newCategoryName.trim()}>{t('add')}</Button>
                                </div>
                            </td>
                            {monthKeys.map((_, index) => {
                                const isMonthActive = selectedYear > constructionYear || (selectedYear === constructionYear && index >= constructionMonth);
                                if (!isMonthActive) {
                                    return <td key={index} className="px-3 py-2 text-center text-sm">-</td>;
                                }
                                const monthTotal = outcomes.filter(o => o.month === index && o.isConfirmed).reduce((sum, o) => sum + o.amount, 0);
                                return <td key={index} className="px-3 py-2 text-center text-sm">{formatNumber(monthTotal)}</td>
                            })}
                            <td className="px-3 py-2 text-right text-sm">
                                {formatNumber(outcomes.filter(o=>o.isConfirmed).reduce((sum, o) => sum + o.amount, 0))}
                            </td>
                        </tr>
                        <tr>
                            <td className="sticky left-0 bg-gray-100 dark:bg-gray-700 px-3 py-2 text-left text-xs uppercase text-gray-500 dark:text-gray-300">{t('report')}</td>
                            {monthKeys.map((monthKey, index) => {
                                const isMonthActive = selectedYear > constructionYear || (selectedYear === constructionYear && index >= constructionMonth);
                                return (
                                    <td key={index} className="px-3 py-2 text-center">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => onGenerateReport({ reportKey: 'report_regular_budget', view: 'outcome_monthly_by_month', year: selectedYear, month: index })}
                                            title={`${t('export_pdf')} for ${t(monthKey)}`}
                                            disabled={!isMonthActive}
                                        >
                                            <Icon name="pdf" className="w-4 h-4" />
                                        </Button>
                                    </td>
                                );
                            })}
                            <td colSpan={1}></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            {isExportingPdf && pdfReportData && (
                <BudgetTableReport
                    id="outcome-matrix-report"
                    title={`${t('outcome_matrix')} - ${selectedYear}`}
                    headers={pdfReportData.headers}
                    rows={pdfReportData.rows}
                    footer={pdfReportData.footer}
                />
            )}
            {modalInfo && (
                <OutcomeEntryModal 
                    isOpen={!!modalInfo}
                    onClose={() => setModalInfo(null)}
                    modalInfo={modalInfo}
                    selectedYear={selectedYear}
                />
            )}
        </div>
    );
}

export default OutcomeMatrix;