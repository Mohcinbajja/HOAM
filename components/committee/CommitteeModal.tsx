import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { CommitteeMember, Owner } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import TabButton from '../ui/TabButton';
import Icon from '../ui/Icon';
import { TranslationKey } from '../../lib/translations';

interface CommitteeModalProps {
    isOpen: boolean;
    onClose: () => void;
    memberToEdit: CommitteeMember | null;
}

type Tab = 'owners' | 'manual';

const predefinedPositions: string[] = ['president', 'vice_president', 'secretary', 'treasurer', 'board_member'];

const CommitteeModal: React.FC<CommitteeModalProps> = ({ isOpen, onClose, memberToEdit }) => {
    const { t } = useLanguage();
    const { selectedProperty, owners, committeeMembers, addCommitteeMember, editCommitteeMember } = useData();

    const [activeTab, setActiveTab] = useState<Tab>('owners');
    const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(null);
    const [fullName, setFullName] = useState('');
    const [position, setPosition] = useState('');
    const [customPosition, setCustomPosition] = useState('');
    const [photoUrl, setPhotoUrl] = useState<string | undefined>('');
    const photoInputRef = useRef<HTMLInputElement>(null);

    const availableOwners = useMemo(() => {
        if (!selectedProperty) return [];
        const propertyOwners = owners.filter(o => o.propertyId === selectedProperty.id);
        const committeeOwnerIds = committeeMembers
            .filter(cm => cm.propertyId === selectedProperty.id && cm.ownerId)
            .map(cm => cm.ownerId);
        
        // If editing, the current member's ownerId should be available
        const editingOwnerId = memberToEdit?.ownerId;

        return propertyOwners.filter(o => !committeeOwnerIds.includes(o.id) || o.id === editingOwnerId);
    }, [owners, committeeMembers, selectedProperty, memberToEdit]);

    const isPresidentTaken = useMemo(() => {
        if (!selectedProperty) return false;
        const presidentPosition = t('president');
        return committeeMembers.some(
            member => member.propertyId === selectedProperty.id &&
                      member.position === presidentPosition &&
                      member.id !== memberToEdit?.id
        );
    }, [committeeMembers, selectedProperty, t, memberToEdit]);

    useEffect(() => {
        if (isOpen) {
            if (memberToEdit) {
                setActiveTab(memberToEdit.ownerId ? 'owners' : 'manual');
                setSelectedOwnerId(memberToEdit.ownerId);
                setFullName(memberToEdit.fullName);
                setPhotoUrl(memberToEdit.photoUrl);

                // Get the translated list of predefined positions to compare against
                const translatedPredefinedPositions = predefinedPositions.map(p => t(p as any));
                const isActuallyPredefined = translatedPredefinedPositions.includes(memberToEdit.position);

                if (isActuallyPredefined) {
                    // If it's a standard position, set it directly
                    setPosition(memberToEdit.position);
                    setCustomPosition('');
                } else {
                    // Otherwise, it must be a custom position
                    setPosition('Other'); // This is the 'value' of the "Other" option
                    setCustomPosition(memberToEdit.position);
                }
            } else {
                // Reset form for adding a new member
                setActiveTab('owners');
                setSelectedOwnerId(null);
                setFullName('');
                setPosition('');
                setCustomPosition('');
                setPhotoUrl('');
            }
        }
    }, [isOpen, memberToEdit, t]);

    const handleOwnerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const ownerId = e.target.value;
        const owner = owners.find(o => o.id === ownerId);
        setSelectedOwnerId(ownerId);
        setFullName(owner ? owner.fullName : '');
    };
    
    const handlePositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setPosition(value);
        if (value !== 'Other') {
            setCustomPosition('');
        }
    };
    
    const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProperty || !fullName || (!position || (position === 'Other' && !customPosition))) return;

        const finalPosition = position === 'Other' ? customPosition.trim() : position;
        const memberData = {
            propertyId: selectedProperty.id,
            ownerId: activeTab === 'owners' ? selectedOwnerId : null,
            fullName,
            position: finalPosition,
            photoUrl,
        };

        if (memberToEdit) {
            editCommitteeMember(memberToEdit.id, memberData);
        } else {
            addCommitteeMember(memberData);
        }
        onClose();
    };

    const title = memberToEdit ? t('edit_committee_member') : t('add_committee_member');
    const inputClasses = "mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col items-center space-y-3 pt-2">
                    {photoUrl ? (
                        <img src={photoUrl} alt="Member photo" className="h-24 w-24 rounded-full object-cover" />
                    ) : (
                        <div className="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                            <Icon name="owners" className="h-12 w-12 text-gray-400" />
                        </div>
                    )}
                    <div>
                        <Button type="button" variant="secondary" onClick={() => photoInputRef.current?.click()}>
                           <Icon name="upload" className="w-5 h-5 mr-2" /> {t('upload_member_photo')}
                        </Button>
                        <input type="file" accept="image/*" ref={photoInputRef} onChange={handlePhotoUpload} className="hidden" />
                    </div>
                </div>

                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                        <TabButton isActive={activeTab === 'owners'} onClick={() => setActiveTab('owners')}>{t('choose_from_owners_list')}</TabButton>
                        <TabButton isActive={activeTab === 'manual'} onClick={() => setActiveTab('manual')}>{t('add_manually')}</TabButton>
                    </nav>
                </div>
                <div className="pt-2 space-y-4">
                    {activeTab === 'owners' ? (
                        <div>
                            <label htmlFor="owner-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('select_owner')}</label>
                            <select id="owner-select" value={selectedOwnerId || ''} onChange={handleOwnerSelect} required className={inputClasses}>
                                <option value="" disabled>{t('select_owner')}</option>
                                {availableOwners.map(o => <option key={o.id} value={o.id}>{o.fullName}</option>)}
                            </select>
                        </div>
                    ) : (
                        <div>
                            <label htmlFor="full-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('full_name')}</label>
                            <input type="text" id="full-name" value={fullName} onChange={(e) => setFullName(e.target.value)} required className={inputClasses} />
                        </div>
                    )}
                    
                    <div>
                        <label htmlFor="position" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('position')}</label>
                        <select id="position" value={position} onChange={handlePositionChange} required className={inputClasses}>
                            <option value="" disabled>{t('select_position')}</option>
                            {predefinedPositions.map(pKey => {
                                const translatedPosition = t(pKey as TranslationKey);
                                const isDisabled = pKey === 'president' && isPresidentTaken;
                                return (
                                    <option key={pKey} value={translatedPosition} disabled={isDisabled}>
                                        {translatedPosition} {isDisabled ? `(${t('position_taken')})` : ''}
                                    </option>
                                );
                            })}
                            <option value="Other">{t('other')}</option>
                        </select>
                    </div>

                    {position === 'Other' && (
                        <div>
                            <label htmlFor="custom-position" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('custom_position')}</label>
                            <input type="text" id="custom-position" value={customPosition} onChange={e => setCustomPosition(e.target.value)} required className={inputClasses} />
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <Button variant="secondary" type="button" onClick={onClose}>{t('cancel')}</Button>
                    <Button type="submit">{t('save')}</Button>
                </div>
            </form>
        </Modal>
    );
};

export default CommitteeModal;