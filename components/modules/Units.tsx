import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Icon from '../ui/Icon';
import Button from '../ui/Button';
import UnitTypeCard from '../units/UnitTypeCard';
import UnitTypeModal from '../units/UnitTypeModal';
import ViewSwitcher from '../ui/ViewSwitcher';
import UnitTypeListItem from '../units/UnitTypeListItem';

const Units: React.FC = () => {
    const { t } = useLanguage();
    const { selectedProperty, unitTypes } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [view, setView] = useState<'grid' | 'list'>('grid');

    if (!selectedProperty) return null;

    const propertyUnitTypes = unitTypes.filter(ut => ut.propertyId === selectedProperty.id);

    return (
        <>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">{t('module_units')}</h3>
                    <div className="flex items-center gap-4">
                        <ViewSwitcher currentView={view} onViewChange={setView} />
                        <Button onClick={() => setIsModalOpen(true)}>
                            <Icon name="plus" className="h-5 w-5 mr-2" />
                            {t('create_unit_type')}
                        </Button>
                    </div>
                </div>

                {propertyUnitTypes.length > 0 ? (
                    view === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {propertyUnitTypes.map(unitType => (
                                <UnitTypeCard key={unitType.id} unitType={unitType} />
                            ))}
                        </div>
                    ) : (
                        <div>
                            {/* List Header */}
                            <div className="hidden md:grid grid-cols-12 gap-4 items-center px-3 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                <div className="col-span-3">{t('unit_type_name')}</div>
                                <div className="col-span-4">{t('description')}</div>
                                <div className="col-span-2">{t('surface_m2')}</div>
                                <div className="col-span-2">{t('monthly_fees')}</div>
                                <div className="col-span-1 text-right">{t('actions')}</div>
                            </div>
                            {/* List Body */}
                            <div className="space-y-2 mt-2">
                                {propertyUnitTypes.map(unitType => (
                                    <UnitTypeListItem key={unitType.id} unitType={unitType} />
                                ))}
                            </div>
                        </div>
                    )
                ) : (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                        <Icon name="units" className="mx-auto h-12 w-12 text-gray-400" />
                        <h4 className="mt-4 text-xl font-medium text-gray-700 dark:text-gray-300">{t('no_unit_types_title')}</h4>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">{t('no_unit_types_desc')}</p>
                    </div>
                )}
            </div>
            <UnitTypeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
};

export default Units;