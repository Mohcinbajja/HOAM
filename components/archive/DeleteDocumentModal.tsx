import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useLanguage } from '../../contexts/LanguageContext';
import { useData } from '../../contexts/DataContext';
import { ArchivedDocument } from '../../types';

interface DeleteDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    document: ArchivedDocument;
}

const DeleteDocumentModal: React.FC<DeleteDocumentModalProps> = ({ isOpen, onClose, document }) => {
    const { t } = useLanguage();
    const { deleteArchivedDocument } = useData();

    const handleDelete = () => {
        deleteArchivedDocument(document.id);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('delete_document_title')}>
            <p className="my-4">{t('delete_document_confirm')}</p>
            <div className="flex justify-end space-x-2">
                <Button variant="secondary" onClick={onClose}>{t('cancel')}</Button>
                <Button variant="danger" onClick={handleDelete}>{t('delete')}</Button>
            </div>
        </Modal>
    );
};

export default DeleteDocumentModal;
