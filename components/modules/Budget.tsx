import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const BudgetSection: React.FC<{ title: string }> = ({ title }) => {
    const { t } = useLanguage();
    return (
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="text-lg font-semibold mb-3">{title}</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded">
                    <p className="text-sm text-green-800 dark:text-green-200">{t('income')}</p>
                    <p className="text-xl font-bold text-green-900 dark:text-green-100">$0.00</p>
                </div>
                <div className="p-3 bg-red-100 dark:bg-red-900 rounded">
                    <p className="text-sm text-red-800 dark:text-red-200">{t('outcome')}</p>
                    <p className="text-xl font-bold text-red-900 dark:text-red-100">$0.00</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded">
                    <p className="text-sm text-blue-800 dark:text-blue-200">{t('balance')}</p>
                    <p className="text-xl font-bold text-blue-900 dark:text-blue-100">$0.00</p>
                </div>
            </div>
        </div>
    );
}

const Budget: React.FC = () => {
    const { t } = useLanguage();
    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">{t('module_budget')}</h3>
            <div className="space-y-6">
                {/* FIX: Used existing translation key 'module_regularbudget' to fix type error. */}
                <BudgetSection title={t('module_regularbudget')} />
                {/* FIX: Used existing translation key 'module_exceptionalbudget' to fix type error. */}
                <BudgetSection title={t('module_exceptionalbudget')} />
            </div>
        </div>
    );
};

export default Budget;
