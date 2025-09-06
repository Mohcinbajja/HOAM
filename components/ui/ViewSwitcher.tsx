import React from 'react';
import Icon from './Icon';
import { useLanguage } from '../../contexts/LanguageContext';

type View = 'grid' | 'list';

interface ViewSwitcherProps {
    currentView: View;
    onViewChange: (view: View) => void;
}

const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ currentView, onViewChange }) => {
    const { t } = useLanguage();

    const baseClasses = "p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors";
    const activeClasses = "bg-white dark:bg-gray-800 shadow text-blue-600 dark:text-blue-300";
    const inactiveClasses = "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600";

    return (
        <div className="flex items-center space-x-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
            <button
                onClick={() => onViewChange('grid')}
                className={`${baseClasses} ${currentView === 'grid' ? activeClasses : inactiveClasses}`}
                aria-label={t('grid_view')}
                title={t('grid_view')}
            >
                <Icon name="grid" className="h-5 w-5" />
            </button>
            <button
                onClick={() => onViewChange('list')}
                className={`${baseClasses} ${currentView === 'list' ? activeClasses : inactiveClasses}`}
                aria-label={t('list_view')}
                title={t('list_view')}
            >
                <Icon name="list" className="h-5 w-5" />
            </button>
        </div>
    );
};

export default ViewSwitcher;
