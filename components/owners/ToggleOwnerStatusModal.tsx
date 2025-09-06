import React from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Owner } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface ToggleOwnerStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    owner: Owner | null;
}

const ToggleOwnerStatusModal: React.FC<ToggleOwnerStatusModalProps> = ({ isOpen, onClose, owner }) => {
    const { toggleOwnerStatus } = useData();
    const { t } = useLanguage();

    if (!owner) return null;

    const handleConfirm = () => {
        toggleOwnerStatus(owner.id);
        onClose();
    };

    const isActivating = !owner.isActive;
    const title = isActivating ? t('activate_owner') : t('deactivate_owner');
    const message = isActivating ? t('activate_owner_confirm') : t('deactivate_owner_confirm');
    const buttonVariant = isActivating ? 'primary' : 'danger';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
                <Button variant="secondary" onClick={onClose}>{t('cancel')}</Button>
                <Button variant={buttonVariant} onClick={handleConfirm}>
                    {title}
                </Button>
            </div>
        </Modal>
    );
};

export default ToggleOwnerStatusModal;
