import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import CommitteeMemberCard from '../committee/CommitteeMemberCard';
import CommitteeModal from '../committee/CommitteeModal';
import { CommitteeMember } from '../../types';
import DeleteCommitteeMemberModal from '../committee/DeleteCommitteeMemberModal';
import ViewSwitcher from '../ui/ViewSwitcher';
import CommitteeMemberListItem from '../committee/CommitteeMemberListItem';

const Committee: React.FC = () => {
    const { t } = useLanguage();
    const { 
        selectedProperty, 
        committeeMembers, 
        updatePropertyDetails,
        setHasUnsavedChanges,
        registerActions,
        unregisterActions,
        showSuccessMessage,
    } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [memberToEdit, setMemberToEdit] = useState<CommitteeMember | null>(null);
    const [memberToDelete, setMemberToDelete] = useState<CommitteeMember | null>(null);
    const [totalMembers, setTotalMembers] = useState(selectedProperty?.details.totalMembers || 0);
    const [view, setView] = useState<'grid' | 'list'>('grid');

    const signatureInputRef = useRef<HTMLInputElement>(null);
    const stampInputRef = useRef<HTMLInputElement>(null);
    const originalTotalMembers = useRef(selectedProperty?.details.totalMembers || 0);

    useEffect(() => {
        if (selectedProperty) {
            const currentTotal = selectedProperty.details.totalMembers || 0;
            setTotalMembers(currentTotal);
            originalTotalMembers.current = currentTotal;
            setHasUnsavedChanges(false);
        }
    }, [selectedProperty, setHasUnsavedChanges]);

    useEffect(() => {
        setHasUnsavedChanges(totalMembers !== originalTotalMembers.current);
    }, [totalMembers, setHasUnsavedChanges]);

    const handleSave = useCallback(async () => {
        if (totalMembers !== originalTotalMembers.current && selectedProperty) {
            updatePropertyDetails(selectedProperty.id, { totalMembers });
            originalTotalMembers.current = totalMembers;
            showSuccessMessage(t('total_members_updated'));
            setHasUnsavedChanges(false);
        }
    }, [totalMembers, selectedProperty, updatePropertyDetails, showSuccessMessage, t, setHasUnsavedChanges]);

    const handleDiscard = useCallback(() => {
        setTotalMembers(originalTotalMembers.current);
        setHasUnsavedChanges(false);
    }, [setHasUnsavedChanges]);

    useEffect(() => {
        registerActions(handleSave, handleDiscard);
        return () => {
            unregisterActions();
        };
    }, [registerActions, unregisterActions, handleSave, handleDiscard]);

    if (!selectedProperty) return null;

    const propertyCommitteeMembers = useMemo(() => {
        return committeeMembers.filter(cm => cm.propertyId === selectedProperty.id);
    }, [committeeMembers, selectedProperty.id]);
    
    const propertyCommitteeMembersCount = propertyCommitteeMembers.length;
    const totalMembersDefined = selectedProperty.details.totalMembers || 0;

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'signature' | 'stamp') => {
        const file = event.target.files?.[0];
        if (!file || !file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            if (type === 'signature') {
                updatePropertyDetails(selectedProperty.id, { presidentSignature: base64String });
            } else {
                updatePropertyDetails(selectedProperty.id, { associationStamp: base64String });
            }
        };
        reader.readAsDataURL(file);
    };
    
    const handleAddMember = async () => {
        if (totalMembers !== originalTotalMembers.current) {
            await handleSave();
        }
        setMemberToEdit(null);
        setIsModalOpen(true);
    };

    const handleEditMember = (member: CommitteeMember) => {
        setMemberToEdit(member);
        setIsModalOpen(true);
    };

    const handleDeleteMember = (member: CommitteeMember) => {
        setMemberToDelete(member);
    };

    const signature = selectedProperty.details.presidentSignature;
    const stamp = selectedProperty.details.associationStamp;

    return (
        <div className="space-y-8">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">{t('module_committee')}</h3>
                    <div className="flex flex-wrap items-center justify-start sm:justify-end gap-x-4 gap-y-2 w-full sm:w-auto">
                         <ViewSwitcher currentView={view} onViewChange={setView} />
                         <div className="flex items-center">
                            <label htmlFor="total-members" className="mr-2 text-sm font-medium text-gray-900 dark:text-gray-300 whitespace-nowrap">{t('total_members')}</label>
                            <input
                                type="number"
                                id="total-members"
                                value={totalMembers}
                                onChange={e => setTotalMembers(parseInt(e.target.value, 10) || 0)}
                                min="0"
                                className="w-24 px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                        <Button onClick={handleAddMember} disabled={totalMembers <= 0 || propertyCommitteeMembersCount >= totalMembers}>
                            <Icon name="plus" className="h-5 w-5 mr-2" />
                            {t('add_committee_member')}
                        </Button>
                    </div>
                </div>

                {totalMembersDefined > 0 && propertyCommitteeMembersCount < totalMembersDefined && (
                    <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            {/* FIX: Use 't' function with replacements instead of string.replace(). */}
                            {t('committee_count_warning', { current: propertyCommitteeMembersCount, total: totalMembersDefined })}
                        </p>
                    </div>
                 )}

                 {totalMembersDefined > 0 ? (
                    propertyCommitteeMembers.length > 0 ? (
                        view === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {propertyCommitteeMembers.map(member => (
                                    <CommitteeMemberCard 
                                        key={member.id} 
                                        member={member}
                                        onEdit={() => handleEditMember(member)}
                                        onDelete={() => handleDeleteMember(member)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div>
                                <div className="hidden md:grid grid-cols-12 gap-4 items-center px-3 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    <div className="col-span-6">{t('full_name')}</div>
                                    <div className="col-span-4">{t('position')}</div>
                                    <div className="col-span-2 text-right">{t('actions')}</div>
                                </div>
                                <div className="space-y-2 mt-2">
                                    {propertyCommitteeMembers.map(member => (
                                        <CommitteeMemberListItem 
                                            key={member.id} 
                                            member={member}
                                            onEdit={() => handleEditMember(member)}
                                            onDelete={() => handleDeleteMember(member)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                            <Icon name="committee" className="mx-auto h-12 w-12 text-gray-400" />
                            <h4 className="mt-4 text-xl font-medium text-gray-700 dark:text-gray-300">{t('no_committee_members_title')}</h4>
                            <p className="mt-2 text-gray-500 dark:text-gray-400">{t('no_committee_members_desc')}</p>
                        </div>
                    )
                ) : (
                     <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                        <Icon name="committee" className="mx-auto h-12 w-12 text-gray-400" />
                        <h4 className="mt-4 text-xl font-medium text-gray-700 dark:text-gray-300">{t('set_total_members_prompt_title')}</h4>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">{t('set_total_members_prompt_desc')}</p>
                    </div>
                )}
            </div>

            <Card title={t('management_signatures')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('president_signature')}</label>
                        <div className="mt-2 flex items-center justify-center h-32 p-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                            {signature ? (
                                <img src={signature} alt="President's Signature" className="max-h-full max-w-full object-contain" />
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('no_signature_uploaded')}</p>
                            )}
                        </div>
                        <Button variant="secondary" className="mt-3 w-full" onClick={() => signatureInputRef.current?.click()}>
                            <Icon name="upload" className="w-5 h-5 mr-2" />
                            {t('upload_signature')}
                        </Button>
                        <input type="file" accept="image/*" ref={signatureInputRef} onChange={(e) => handleFileUpload(e, 'signature')} className="hidden" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('association_stamp')}</label>
                         <div className="mt-2 flex items-center justify-center h-32 p-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                            {stamp ? (
                                <img src={stamp} alt="Association Stamp" className="max-h-full max-w-full object-contain" />
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('no_stamp_uploaded')}</p>
                            )}
                        </div>
                        <Button variant="secondary" className="mt-3 w-full" onClick={() => stampInputRef.current?.click()}>
                            <Icon name="upload" className="w-5 h-5 mr-2" />
                            {t('upload_stamp')}
                        </Button>
                        <input type="file" accept="image/*" ref={stampInputRef} onChange={(e) => handleFileUpload(e, 'stamp')} className="hidden" />
                    </div>
                </div>
            </Card>
            
            <CommitteeModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                memberToEdit={memberToEdit}
            />
            <DeleteCommitteeMemberModal
                isOpen={!!memberToDelete}
                onClose={() => setMemberToDelete(null)}
                member={memberToDelete}
            />
        </div>
    );
};

export default Committee;
