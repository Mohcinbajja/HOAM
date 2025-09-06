import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { ExceptionalProject } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface ProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedYear: number;
    projectToEdit?: ExceptionalProject;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, selectedYear, projectToEdit }) => {
    const { t } = useLanguage();
    const { addExceptionalProject } = useData();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        expectedIncome: 0,
        expectedOutcome: 0,
    });

    useEffect(() => {
        if (isOpen) {
            if (projectToEdit) {
                // setFormData(projectToEdit) // Edit logic can be added later
            } else {
                setFormData({
                    name: '',
                    description: '',
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: '',
                    expectedIncome: 0,
                    expectedOutcome: 0,
                });
            }
        }
    }, [isOpen, projectToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addExceptionalProject({ ...formData, year: selectedYear });
        onClose();
    };
    
    const title = projectToEdit ? t('edit_exceptional_budget') : t('create_exceptional_budget');
    const inputFieldClasses = "mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">{t('project_title')}</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className={inputFieldClasses} />
                </div>
                <div>
                    <label className="block text-sm font-medium">{t('description')}</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className={inputFieldClasses} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">{t('start_date')}</label>
                        <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required className={inputFieldClasses} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">{t('end_date')}</label>
                        <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} min={formData.startDate} className={inputFieldClasses} />
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">{t('expected_income')}</label>
                        <input type="number" name="expectedIncome" value={formData.expectedIncome} onChange={handleChange} min="0" step="0.01" required className={inputFieldClasses} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">{t('expected_outcome')}</label>
                        <input type="number" name="expectedOutcome" value={formData.expectedOutcome} onChange={handleChange} min="0" step="0.01" required className={inputFieldClasses} />
                    </div>
                </div>
                 <div className="mt-6 flex justify-end space-x-3">
                    <Button variant="secondary" type="button" onClick={onClose}>{t('cancel')}</Button>
                    <Button type="submit">{t('save')}</Button>
                </div>
            </form>
        </Modal>
    );
};

export default ProjectModal;
