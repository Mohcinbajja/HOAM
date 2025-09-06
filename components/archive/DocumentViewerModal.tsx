import React from 'react';
import Modal from '../ui/Modal';
import { useLanguage } from '../../contexts/LanguageContext';

interface DocumentViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    name: string;
    fileUrl: string;
}

const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ isOpen, onClose, name, fileUrl }) => {
    const { t } = useLanguage();
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={name} size="3xl">
            <div className="max-h-[80vh] overflow-auto">
                <img src={fileUrl} alt={name} className="max-w-full h-auto mx-auto"/>
            </div>
        </Modal>
    );
};

export default DocumentViewerModal;
