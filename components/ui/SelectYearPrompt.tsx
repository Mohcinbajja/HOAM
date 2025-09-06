import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import Icon from './Icon';

const SelectYearPrompt: React.FC = () => {
    const { t } = useLanguage();
    return (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            <Icon name="calendar_days" className="mx-auto h-12 w-12 text-gray-400" />
            <h4 className="mt-4 text-xl font-medium text-gray-700 dark:text-gray-300">{t('select_year')}</h4>
            <p className="mt-2 text-gray-500 dark:text-gray-400">{t('select_year_to_continue')}</p>
        </div>
    );
};

export default SelectYearPrompt;