import React from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { CommitteeMember } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface DeleteCommitteeMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    member: CommitteeMember | null;
}

const DeleteCommitteeMemberModal: React.FC<DeleteCommitteeMemberModalProps> = ({ isOpen, onClose, member }) => {
    const { deleteCommitteeMember } = useData();
    const { t } = useLanguage();

    if (!member) return null;

    const handleDelete = () => {
        deleteCommitteeMember(member.id);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('delete_committee_member')}>
            <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('delete_committee_member_confirm')}</p>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
                <Button variant="secondary" onClick={onClose}>{t('cancel')}</Button>
                <Button variant="danger" onClick={handleDelete}>
                    {t('confirm_delete')}
                </Button>
            </div>
        </Modal>
    );
};

export default DeleteCommitteeMemberModal;
