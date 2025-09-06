import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { UnitType } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface UnitTypeModalProps {
    isOpen: boolean;
    onClose: () => void;
    unitTypeToEdit?: UnitType;
}

type FormData = Omit<UnitType, 'id' | 'propertyId'>;

const UnitTypeModal: React.FC<UnitTypeModalProps> = ({ isOpen, onClose, unitTypeToEdit }) => {
    const { addUnitType, editUnitType, selectedProperty } = useData();
    const { t } = useLanguage();
    const [formData, setFormData] = useState<FormData>({
        name: '', description: '', surface: 0,
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (unitTypeToEdit) {
            const { id, propertyId, ...editableData } = unitTypeToEdit;
            setFormData(editableData);
        } else {
            setFormData({
                name: '', description: '', surface: 0,
            });
        }
        setError('');
    }, [unitTypeToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const newFormData = { ...formData, [name]: type === 'number' ? parseFloat(value) || 0 : value };
        setFormData(newFormData);
        
        if (name === 'surface' && (parseFloat(value) || 0) > 0) {
            setError('');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProperty) return;

        if (formData.surface <= 0) {
            setError(t('surface_must_be_positive'));
            return;
        }

        if (unitTypeToEdit) {
            editUnitType(unitTypeToEdit.id, formData);
        } else {
            addUnitType({ ...formData, propertyId: selectedProperty.id });
        }
        onClose();
    };

    const title = unitTypeToEdit ? t('edit_unit_type') : t('create_unit_type');

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="unit-type-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('unit_type_name')}</label>
                    <input type="text" id="unit-type-name" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('description')}</label>
                    <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="surface" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('surface_m2')}</label>
                    <input type="number" id="surface" name="surface" value={formData.surface} onChange={handleChange} min="0" step="0.01" required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <Button variant="secondary" type="button" onClick={onClose}>{t('cancel')}</Button>
                    <Button type="submit">{t('save')}</Button>
                </div>
            </form>
        </Modal>
    );
};

export default UnitTypeModal;
