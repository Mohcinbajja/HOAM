import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Owner } from '../../types';
import Icon from '../ui/Icon';
import Button from '../ui/Button';
import OwnerCard from '../owners/OwnerCard';
import OwnerModal from '../owners/OwnerModal';
import ToggleOwnerStatusModal from '../owners/ToggleOwnerStatusModal';
import ViewSwitcher from '../ui/ViewSwitcher';
import OwnerListItem from '../owners/OwnerListItem';

const Owners: React.FC = () => {
    const { t } = useLanguage();
    const { 
        selectedProperty, 
        owners, 
        units,
        updatePropertyDetails,
        setHasUnsavedChanges,
        registerActions,
        unregisterActions,
        showSuccessMessage,
    } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [ownerToEdit, setOwnerToEdit] = useState<Owner | null>(null);
    const [ownerToToggleStatus, setOwnerToToggleStatus] = useState<Owner | null>(null);
    const [totalUnits, setTotalUnits] = useState(selectedProperty?.details.totalUnits || 0);
    const [view, setView] = useState<'grid' | 'list'>('grid');

    const originalTotalUnits = useRef(selectedProperty?.details.totalUnits || 0);

    useEffect(() => {
        if (selectedProperty) {
            const currentTotal = selectedProperty.details.totalUnits || 0;
            setTotalUnits(currentTotal);
            originalTotalUnits.current = currentTotal;
            setHasUnsavedChanges(false);
        }
    }, [selectedProperty, setHasUnsavedChanges]);

    useEffect(() => {
        setHasUnsavedChanges(totalUnits !== originalTotalUnits.current);
    }, [totalUnits, setHasUnsavedChanges]);

    const handleSave = useCallback(async () => {
        if (totalUnits !== originalTotalUnits.current && selectedProperty) {
            updatePropertyDetails(selectedProperty.id, { totalUnits: totalUnits });
            originalTotalUnits.current = totalUnits;
            showSuccessMessage(t('total_units_updated'));
            setHasUnsavedChanges(false);
        }
    }, [totalUnits, selectedProperty, updatePropertyDetails, showSuccessMessage, t, setHasUnsavedChanges]);

    const handleDiscard = useCallback(() => {
        setTotalUnits(originalTotalUnits.current);
        setHasUnsavedChanges(false);
    }, [setHasUnsavedChanges]);
    
    useEffect(() => {
        registerActions(handleSave, handleDiscard);
        return () => {
            unregisterActions();
        };
    }, [registerActions, unregisterActions, handleSave, handleDiscard]);

    if (!selectedProperty) return null;

    const propertyOwners = useMemo(() => {
        return owners
            .filter(o => o.propertyId === selectedProperty.id)
            .sort((a, b) => a.fullName.localeCompare(b.fullName));
    }, [owners, selectedProperty.id]);

    const activeOwners = useMemo(() => {
        return propertyOwners.filter(o => o.isActive);
    }, [propertyOwners]);

    const propertyUnits = useMemo(() => {
        return units.filter(u => u.propertyId === selectedProperty.id);
    }, [units, selectedProperty.id]);
    
    const propertyUnitsCount = propertyUnits.length;
    const totalUnitsDefined = selectedProperty.details.totalUnits || 0;

    const handleTotalUnitsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        setTotalUnits(isNaN(value) ? 0 : value);
    };

    const handleCreate = async () => {
        if (totalUnits !== originalTotalUnits.current) {
            await handleSave();
        }
        setOwnerToEdit(null);
        setIsModalOpen(true);
    };

    const handleEdit = (owner: Owner) => {
        setOwnerToEdit(owner);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setOwnerToEdit(null);
    };

    const handleToggleStatus = (owner: Owner) => {
        setOwnerToToggleStatus(owner);
    };

    const handleCloseToggleModal = () => {
        setOwnerToToggleStatus(null);
    };
    
    return (
        <>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">{t('module_owners')}</h3>
                    <div className="flex flex-wrap items-center justify-start sm:justify-end gap-x-4 gap-y-2 w-full sm:w-auto">
                        <ViewSwitcher currentView={view} onViewChange={setView} />
                        <div className="flex items-center">
                            <label htmlFor="total-units" className="mr-2 text-sm font-medium text-gray-900 dark:text-gray-300 whitespace-nowrap">{t('total_units')}</label>
                            <input
                                type="number"
                                id="total-units"
                                value={totalUnits}
                                onChange={handleTotalUnitsChange}
                                min="0"
                                className="w-24 px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                        <Button onClick={handleCreate} disabled={totalUnits <= 0 || propertyUnitsCount >= totalUnits}>
                            <Icon name="plus" className="h-5 w-5 mr-2" />
                            {t('create_owner')}
                        </Button>
                    </div>
                </div>

                {totalUnitsDefined > 0 && propertyUnitsCount < totalUnitsDefined && (
                    <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            {t('units_count_warning', { current: propertyUnitsCount, total: totalUnitsDefined })}
                        </p>
                    </div>
                )}

                {totalUnits > 0 ? (
                    activeOwners.length > 0 ? (
                        view === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {activeOwners.map(owner => (
                                    <OwnerCard 
                                        key={owner.id} 
                                        owner={owner} 
                                        onEdit={() => handleEdit(owner)}
                                        onToggleStatus={() => handleToggleStatus(owner)} 
                                    />
                                ))}
                            </div>
                        ) : (
                            <div>
                                {/* List Header */}
                                <div className="hidden md:grid grid-cols-12 gap-4 items-center px-3 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    <div className="col-span-3">{t('full_name')}</div>
                                    <div className="col-span-2">{t('email_address')}</div>
                                    <div className="col-span-2">{t('unit')}</div>
                                    <div className="col-span-2">{t('join_date')}</div>
                                    <div className="col-span-1">{t('status')}</div>
                                    <div className="col-span-2 text-right">{t('actions')}</div>
                                </div>
                                {/* List Body */}
                                <div className="space-y-2 mt-2">
                                    {activeOwners.map(owner => (
                                        <OwnerListItem 
                                            key={owner.id} 
                                            owner={owner} 
                                            onEdit={() => handleEdit(owner)}
                                            onToggleStatus={() => handleToggleStatus(owner)} 
                                        />
                                    ))}
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                            <Icon name="owners" className="mx-auto h-12 w-12 text-gray-400" />
                            <h4 className="mt-4 text-xl font-medium text-gray-700 dark:text-gray-300">{t('no_owners_title')}</h4>
                            <p className="mt-2 text-gray-500 dark:text-gray-400">{t('no_owners_desc')}</p>
                        </div>
                    )
                ) : (
                     <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                        <Icon name="units" className="mx-auto h-12 w-12 text-gray-400" />
                        <h4 className="mt-4 text-xl font-medium text-gray-700 dark:text-gray-300">{t('set_total_units_prompt_title')}</h4>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">{t('set_total_units_prompt_desc')}</p>
                    </div>
                )}
            </div>
            <OwnerModal isOpen={isModalOpen} onClose={handleCloseModal} ownerToEdit={ownerToEdit} />
            <ToggleOwnerStatusModal isOpen={!!ownerToToggleStatus} onClose={handleCloseToggleModal} owner={ownerToToggleStatus} />
        </>
    );
};

export default Owners;
