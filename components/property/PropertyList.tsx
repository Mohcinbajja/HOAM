import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Property } from '../../types';
import PropertyCard from './PropertyCard';
import PropertyModal from './PropertyModal';
import Icon from '../ui/Icon';
import ViewSwitcher from '../ui/ViewSwitcher';
import PropertyGridItem from './PropertyGridItem';

const PropertyList: React.FC = () => {
    const { properties, selectedProperty, selectProperty } = useData();
    const { t } = useLanguage();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [view, setView] = useState<'list' | 'grid'>('grid');

    return (
        <>
            <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                    <h2 className="text-xl font-bold">{t('my_properties')}</h2>
                    <div className="flex items-center space-x-4">
                        <ViewSwitcher currentView={view} onViewChange={(v) => setView(v)} />
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Icon name="plus" className="h-5 w-5" />
                            <span>{t('create_property')}</span>
                        </button>
                    </div>
                </div>
                {properties.length > 0 ? (
                    view === 'list' ? (
                        <div className="grid grid-cols-1 gap-4">
                            {properties.map(prop => (
                                <PropertyCard
                                    key={prop.id}
                                    property={prop}
                                    isSelected={selectedProperty?.id === prop.id}
                                    onSelect={() => selectProperty(prop)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {properties.map(prop => (
                                <PropertyGridItem
                                    key={prop.id}
                                    property={prop}
                                    isSelected={selectedProperty?.id === prop.id}
                                    onSelect={() => selectProperty(prop)}
                                />
                            ))}
                        </div>
                    )
                ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">{t('no_properties')}</p>
                )}
            </div>
            <PropertyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
};

export default PropertyList;