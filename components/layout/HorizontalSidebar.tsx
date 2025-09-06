import React from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Module } from '../../types';

const HorizontalSidebar: React.FC = () => {
    const { activeModule, setActiveModule } = useData();
    const { t } = useLanguage();

    const modules = Object.values(Module);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
            <nav className="flex space-x-1 p-1">
                {modules.map((module) => (
                    <button
                        key={module}
                        onClick={() => setActiveModule(module)}
                        className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                            activeModule === module
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                    >
                        {t(`module_${module.toLowerCase()}` as any)}
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default HorizontalSidebar;