import React, { useState } from 'react';
import TabButton from '../ui/TabButton';

interface Tab {
    name: string;
    content: React.ReactNode;
}

interface ModuleWithTabsProps {
    title?: string;
    tabs: Tab[];
    variant?: 'primary' | 'secondary';
}

const ModuleWithTabs: React.FC<ModuleWithTabsProps> = ({ title, tabs, variant = 'primary' }) => {
    const [activeTab, setActiveTab] = useState(0);

    const navClasses = {
        primary: '-mb-px flex space-x-6',
        secondary: 'flex space-x-2 bg-gray-100 dark:bg-gray-900/50 p-1 rounded-lg'
    };

    return (
        <div>
            {title && <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">{title}</h3>}
            <div className={`border-b border-gray-200 dark:border-gray-700 ${title ? 'mt-4' : ''}`}>
                <nav className={navClasses[variant]} aria-label="Tabs">
                    {tabs.map((tab, index) => (
                        <TabButton
                            key={tab.name}
                            isActive={activeTab === index}
                            onClick={() => setActiveTab(index)}
                            variant={variant}
                        >
                            {tab.name}
                        </TabButton>
                    ))}
                </nav>
            </div>
            <div className="mt-6">
                {tabs[activeTab]?.content}
            </div>
        </div>
    );
};

export default ModuleWithTabs;