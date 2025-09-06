
import React from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Module } from '../../types';
import Icon from '../ui/Icon';

const moduleIcons: { [key in Module]?: string } = {
    [Module.Summary]: 'summary',
    [Module.Property]: 'property',
    [Module.Units]: 'units',
    [Module.Owners]: 'owners',
    [Module.Committee]: 'committee',
    [Module.RegularBudget]: 'calendar_days',
    [Module.ExceptionalBudget]: 'alert_triangle',
    [Module.Reports]: 'reports',
    [Module.Documents]: 'documents',
    [Module.Archive]: 'archive',
};

const VerticalSidebar: React.FC = () => {
    const { activeModule, setActiveModule, selectProperty, hasUnsavedChanges, showUnsavedChangesModal } = useData();
    const { t } = useLanguage();

    const modules = Object.values(Module);

    const handleModuleClick = (module: Module) => {
        if (hasUnsavedChanges && module !== activeModule) {
            showUnsavedChangesModal(() => setActiveModule(module));
        } else if (module !== activeModule) {
            setActiveModule(module);
        }
    };

    const handleBackToProperties = () => {
        if (hasUnsavedChanges) {
            showUnsavedChangesModal(() => selectProperty(null));
        } else {
            selectProperty(null);
        }
    };

    return (
        <aside className="w-full lg:w-64 flex-shrink-0 no-print" aria-label="Sidebar">
            <div className="overflow-y-auto py-4 px-3 bg-white dark:bg-gray-800 rounded-lg shadow h-full">
                <div className="pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
                     <button
                        onClick={handleBackToProperties}
                        className="w-full flex items-center p-2 text-base font-normal rounded-lg text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                    >
                        <Icon name="back" className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                        <span className="ml-3">{t('back_to_properties')}</span>
                    </button>
                </div>
                <ul className="space-y-2">
                    {modules.map((module) => (
                        <li key={module}>
                            <button
                                onClick={() => handleModuleClick(module)}
                                className={`w-full flex items-center p-2 text-base font-normal rounded-lg transition-colors duration-150 ${
                                    activeModule === module
                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                                        : 'text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700'
                                }`}
                            >
                                <Icon name={moduleIcons[module] || 'summary'} className="w-6 h-6 text-gray-500 dark:text-gray-400 transition duration-75" />
                                <span className="ml-3">{t(`module_${module.toLowerCase()}` as any)}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
};

export default VerticalSidebar;