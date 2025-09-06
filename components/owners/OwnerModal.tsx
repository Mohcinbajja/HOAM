import React, { useState, useEffect, useCallback } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Owner, Unit } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import TabButton from '../ui/TabButton';

interface OwnerModalProps {
    isOpen: boolean;
    onClose: () => void;
    ownerToEdit: Owner | null;
}

type Tab = 'owner' | 'renter';

const OwnerModal: React.FC<OwnerModalProps> = ({ isOpen, onClose, ownerToEdit }) => {
    const { t } = useLanguage();
    const { selectedProperty, unitTypes, addOwnerWithUnit, editOwnerWithUnit, getUnitsByOwner, isUnitCodeUnique, isOwnershipTitleCodeUnique } = useData();
    const [activeTab, setActiveTab] = useState<Tab>('owner');
    
    const [ownerData, setOwnerData] = useState({
        fullName: '', address: '', phone: '', email: '',
        bankAccountNumber: '', ownershipTitleCode: '',
        isRented: false, displayRenter: false,
        joinDate: new Date().toISOString().split('T')[0],
        renterDetails: { fullName: '', address: '', phone: '', email: '' }
    });
    
    const [unitData, setUnitData] = useState<{ id: string; code?: string; unitTypeId: string }>({ id: '', code: '', unitTypeId: '' });
    const [errors, setErrors] = useState({ unitCode: '', ownershipTitleCode: '' });

    useEffect(() => {
        if (isOpen) {
            const constructionDate = selectedProperty?.details.constructionDate || new Date().toISOString().split('T')[0];
            if (ownerToEdit) {
                const { id, propertyId, isActive, ...editableOwnerData } = ownerToEdit;
                setOwnerData({
                    ...editableOwnerData,
                    joinDate: editableOwnerData.joinDate.split('T')[0] // Ensure format is YYYY-MM-DD
                });
                const ownerUnits = getUnitsByOwner(ownerToEdit.id);
                if (ownerUnits.length > 0) {
                    setUnitData(ownerUnits[0]);
                }
            } else {
                setOwnerData({
                    fullName: '', address: '', phone: '', email: '',
                    bankAccountNumber: '', ownershipTitleCode: '',
                    isRented: false, displayRenter: false,
                    joinDate: constructionDate, // Default join date to construction date
                    renterDetails: { fullName: '', address: '', phone: '', email: '' }
                });
                setUnitData({ id: '', code: '', unitTypeId: '' });
            }
            setErrors({ unitCode: '', ownershipTitleCode: '' });
            setActiveTab('owner');
        }
    }, [isOpen, ownerToEdit, getUnitsByOwner, selectedProperty]);

    const validateUnitCode = useCallback((code: string | undefined) => {
        const unitIdToExclude = ownerToEdit ? unitData.id : undefined;
        if (code && !isUnitCodeUnique(code, unitIdToExclude)) {
            setErrors(prev => ({ ...prev, unitCode: t('unit_code_exists_error') }));
        } else {
            setErrors(prev => ({ ...prev, unitCode: '' }));
        }
    }, [ownerToEdit, unitData.id, isUnitCodeUnique, t]);

    const validateOwnershipTitleCode = useCallback((code: string) => {
        const ownerIdToExclude = ownerToEdit ? ownerToEdit.id : undefined;
        if (code && !isOwnershipTitleCodeUnique(code, ownerIdToExclude)) {
            setErrors(prev => ({ ...prev, ownershipTitleCode: t('ownership_title_code_exists_error') }));
        } else {
            setErrors(prev => ({ ...prev, ownershipTitleCode: '' }));
        }
    }, [ownerToEdit, isOwnershipTitleCodeUnique, t]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, entity: 'owner' | 'renter' | 'unit') => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        if (entity === 'owner') {
            if (name === 'isRented') {
                if (checked) {
                    setActiveTab('renter');
                } else {
                    setActiveTab('owner');
                }
            }
             if (name === 'ownershipTitleCode') {
                validateOwnershipTitleCode(value);
            }
            setOwnerData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        } else if (entity === 'renter') {
            setOwnerData(prev => ({ ...prev, renterDetails: { ...prev.renterDetails, [name]: value } }));
        } else if (entity === 'unit') {
            if (name === 'code') {
                validateUnitCode(value);
            }
            setUnitData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleUnitTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setUnitData(prev => ({...prev, unitTypeId: e.target.value}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProperty || errors.unitCode || errors.ownershipTitleCode) return;

        const { id, ...unitUpdates } = unitData;

        // Ensure joinDate is in full ISO format before saving
        const finalOwnerData = {
            ...ownerData,
            joinDate: new Date(ownerData.joinDate).toISOString()
        };

        if (ownerToEdit) {
            const { renterDetails, ...ownerUpdates } = finalOwnerData;
            const finalOwnerUpdates = { ...ownerUpdates, renterDetails: ownerData.isRented ? renterDetails : { fullName: '', address: '', phone: '', email: '' } };
            editOwnerWithUnit(ownerToEdit.id, finalOwnerUpdates, unitData.id, unitUpdates);
        } else {
            addOwnerWithUnit(finalOwnerData, unitUpdates);
        }
        onClose();
    };

    const title = ownerToEdit ? t('edit_owner') : t('create_owner');
    const propertyUnitTypes = unitTypes.filter(ut => ut.propertyId === selectedProperty?.id);
    const inputFieldClasses = "mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
    
    const constructionDate = selectedProperty?.details.constructionDate;


    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    <TabButton isActive={activeTab === 'owner'} onClick={() => setActiveTab('owner')}>{t('owner_details')}</TabButton>
                    <TabButton isActive={activeTab === 'renter'} onClick={() => setActiveTab('renter')} disabled={!ownerData.isRented}>{t('renter_details')}</TabButton>
                </nav>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {activeTab === 'owner' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('full_name')}</label>
                                <input type="text" name="fullName" value={ownerData.fullName} onChange={e => handleChange(e, 'owner')} required className={inputFieldClasses} />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('join_date')}</label>
                                <input type="date" name="joinDate" value={ownerData.joinDate} onChange={e => handleChange(e, 'owner')} required className={inputFieldClasses} min={constructionDate} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('email_address')}</label>
                                <input type="email" name="email" value={ownerData.email} onChange={e => handleChange(e, 'owner')} required className={inputFieldClasses} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('phone_number')}</label>
                                <input type="tel" name="phone" value={ownerData.phone} onChange={e => handleChange(e, 'owner')} className={inputFieldClasses} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('address')}</label>
                                <input type="text" name="address" value={ownerData.address} onChange={e => handleChange(e, 'owner')} className={inputFieldClasses} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('bank_account_number')}</label>
                                <input type="text" name="bankAccountNumber" value={ownerData.bankAccountNumber} onChange={e => handleChange(e, 'owner')} className={inputFieldClasses} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('ownership_title_code')}</label>
                                <input type="text" name="ownershipTitleCode" value={ownerData.ownershipTitleCode} onChange={e => handleChange(e, 'owner')} className={inputFieldClasses} />
                                {errors.ownershipTitleCode && <p className="text-xs text-red-500 mt-1">{errors.ownershipTitleCode}</p>}
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('unit_code')}</label>
                                <input type="text" name="code" value={unitData.code || ''} onChange={e => handleChange(e, 'unit')} className={inputFieldClasses} />
                                {errors.unitCode && <p className="text-xs text-red-500 mt-1">{errors.unitCode}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('unit_type')}</label>
                                <select name="unitTypeId" value={unitData.unitTypeId} onChange={handleUnitTypeChange} required className={inputFieldClasses}>
                                    <option value="">{t('select_unit_type')}</option>
                                    {propertyUnitTypes.map(ut => <option key={ut.id} value={ut.id}>{ut.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                )}
                
                {activeTab === 'renter' && (
                    <div className="space-y-4">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('full_name')}</label>
                                <input type="text" name="fullName" value={ownerData.renterDetails.fullName} onChange={e => handleChange(e, 'renter')} className={inputFieldClasses} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('email_address')}</label>
                                <input type="email" name="email" value={ownerData.renterDetails.email} onChange={e => handleChange(e, 'renter')} className={inputFieldClasses} />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('phone_number')}</label>
                                <input type="tel" name="phone" value={ownerData.renterDetails.phone} onChange={e => handleChange(e, 'renter')} className={inputFieldClasses} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('address')}</label>
                                <input type="text" name="address" value={ownerData.renterDetails.address} onChange={e => handleChange(e, 'renter')} className={inputFieldClasses} />
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="pt-4 space-y-3">
                     <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input id="isRented" name="isRented" type="checkbox" checked={ownerData.isRented} onChange={e => handleChange(e, 'owner')} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="isRented" className="font-medium text-gray-700 dark:text-gray-300">{t('unit_is_rented')}</label>
                        </div>
                    </div>
                    {ownerData.isRented && (
                        <div className="flex items-start pl-5">
                             <div className="flex items-center h-5">
                                <input id="displayRenter" name="displayRenter" type="checkbox" checked={ownerData.displayRenter} onChange={e => handleChange(e, 'owner')} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="displayRenter" className="font-medium text-gray-700 dark:text-gray-300">{t('display_renter_in_reports')}</label>
                            </div>
                        </div>
                    )}
                </div>


                <div className="mt-6 flex justify-end space-x-3">
                    <Button variant="secondary" type="button" onClick={onClose}>{t('cancel')}</Button>
                    <Button type="submit" disabled={!!errors.unitCode || !!errors.ownershipTitleCode}>{t('save')}</Button>
                </div>
            </form>
        </Modal>
    );
};

export default OwnerModal;