
import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Property } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface DeletePropertyModalProps {
    isOpen: boolean;
    onClose: () => void;
    property: Property;
}

const DeletePropertyModal: React.FC<DeletePropertyModalProps> = ({ isOpen, onClose, property }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { deleteProperty } = useData();
    const { t } = useLanguage();

    const handleDelete = () => {
        if (password === 'admin') {
            deleteProperty(property.id);
            onClose();
            setPassword('');
            setError('');
        } else {
            setError(t('login_error'));
        }
    };
    
    const handleClose = () => {
        setPassword('');
        setError('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={t('delete_property_title')}>
            <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('delete_confirm_message')}</p>
                <div className="mt-4">
                    <label htmlFor="confirm-password" className="sr-only">{t('password')}</label>
                    <input
                        type="password"
                        id="confirm-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t('password')}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    />
                </div>
                {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
            </div>
            <div className="mt-6 flex justify-end space-x-3">
                <Button variant="secondary" onClick={handleClose}>{t('cancel')}</Button>
                <Button variant="danger" onClick={handleDelete}>{t('confirm_delete')}</Button>
            </div>
        </Modal>
    );
};

export default DeletePropertyModal;
