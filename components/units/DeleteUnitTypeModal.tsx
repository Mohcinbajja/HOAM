import React from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { UnitType } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface DeleteUnitTypeModalProps {
    isOpen: boolean;
    onClose: () => void;
    unitType: UnitType;
}

const DeleteUnitTypeModal: React.FC<DeleteUnitTypeModalProps> = ({ isOpen, onClose, unitType }) => {
    const { deleteUnitType, isUnitTypeInUse } = useData();
    const { t } = useLanguage();

    const inUse = isUnitTypeInUse(unitType.id);

    const handleDelete = () => {
        if (!inUse) {
            deleteUnitType(unitType.id);
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('delete_unit_type')}>
            <div className="mt-4">
                {inUse ? (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">{t('unit_type_in_use_error')}</p>
                    </div>
                ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('delete_unit_type_confirm')}</p>
                )}
            </div>
            <div className="mt-6 flex justify-end space-x-3">
                <Button variant="secondary" onClick={onClose}>{t('cancel')}</Button>
                <Button variant="danger" onClick={handleDelete} disabled={inUse}>
                    {t('confirm_delete')}
                </Button>
            </div>
        </Modal>
    );
};

export default DeleteUnitTypeModal;
