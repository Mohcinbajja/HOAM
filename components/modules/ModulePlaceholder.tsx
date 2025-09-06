
import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface ModulePlaceholderProps {
    title: string;
}

const ModulePlaceholder: React.FC<ModulePlaceholderProps> = ({ title }) => {
    const { t } = useLanguage();
    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">{title}</h3>
            <div className="mt-8 text-center">
                 <h4 className="text-xl font-medium text-gray-700 dark:text-gray-300">{t('content_placeholder_title')}</h4>
                <p className="mt-2 text-gray-500 dark:text-gray-400">{t('content_placeholder_desc')}</p>
            </div>
        </div>
    );
};

export default ModulePlaceholder;
