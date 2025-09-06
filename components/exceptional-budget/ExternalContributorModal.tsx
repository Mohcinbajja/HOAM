import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useLanguage } from '../../contexts/LanguageContext';
import { useData } from '../../contexts/DataContext';
import { ExternalContributor } from '../../types';

interface ExternalContributorModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    contributorToEdit?: ExternalContributor;
}

const ExternalContributorModal: React.FC<ExternalContributorModalProps> = ({ isOpen, onClose, projectId, contributorToEdit }) => {
    const { t } = useLanguage();
    const { addExternalContributor, editExternalContributor } = useData();
    const [formData, setFormData] = useState({
        fullName: '', address: '', phone: '', email: '', expectedAmount: 0
    });
    
    useEffect(() => {
        if(isOpen) {
            if (contributorToEdit) {
                // Edit logic here
            } else {
                setFormData({ fullName: '', address: '', phone: '', email: '', expectedAmount: 0 });
            }
        }
    }, [isOpen, contributorToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addExternalContributor({ ...formData, projectId });
        onClose();
    };

    const title = contributorToEdit ? t('edit_contributor') : t('add_contributor');
    const inputFieldClasses = "mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">{t('full_name')}</label>
                        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className={inputFieldClasses} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">{t('email_address')}</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputFieldClasses} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">{t('phone_number')}</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputFieldClasses} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">{t('address')}</label>
                        <input type="text" name="address" value={formData.address} onChange={handleChange} className={inputFieldClasses} />
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium">{t('expected_amount')}</label>
                    <input type="number" name="expectedAmount" value={formData.expectedAmount} onChange={handleChange} min="0" required className={inputFieldClasses} />
                </div>
                 <div className="mt-6 flex justify-end space-x-3">
                    <Button variant="secondary" type="button" onClick={onClose}>{t('cancel')}</Button>
                    <Button type="submit">{t('save')}</Button>
                </div>
            </form>
        </Modal>
    );
};

export default ExternalContributorModal;
