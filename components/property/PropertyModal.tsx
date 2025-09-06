
import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Property } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface PropertyModalProps {
    isOpen: boolean;
    onClose: () => void;
    propertyToEdit?: Property;
}

const PropertyModal: React.FC<PropertyModalProps> = ({ isOpen, onClose, propertyToEdit }) => {
    const [name, setName] = useState('');
    const { addProperty, editProperty } = useData();
    const { t } = useLanguage();

    useEffect(() => {
        if (propertyToEdit) {
            setName(propertyToEdit.name);
        } else {
            setName('');
        }
    }, [propertyToEdit, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            if (propertyToEdit) {
                editProperty(propertyToEdit.id, name.trim());
            } else {
                addProperty(name.trim());
            }
            onClose();
        }
    };

    const title = propertyToEdit ? t('edit_property_title') : t('create_property_title');

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <form onSubmit={handleSubmit}>
                <div className="mt-4">
                    <label htmlFor="property-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('property_name')}
                    </label>
                    <input
                        type="text"
                        id="property-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                    />
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <Button variant="secondary" onClick={onClose}>{t('cancel')}</Button>
                    <Button type="submit">{t('save')}</Button>
                </div>
            </form>
        </Modal>
    );
};

export default PropertyModal;
