import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useLanguage } from '../../contexts/LanguageContext';
import { useData } from '../../contexts/DataContext';
import { ExceptionalProject } from '../../types';

interface ContributionPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    contributor: any;
    contributorType: 'owner' | 'external';
    project: ExceptionalProject;
}

const ContributionPaymentModal: React.FC<ContributionPaymentModalProps> = ({ isOpen, onClose, contributor, contributorType, project }) => {
    const { t, language } = useLanguage();
    const { selectedProperty, recordExceptionalPayment } = useData();
    const [amount, setAmount] = useState<number | string>('');

    const currency = selectedProperty?.details.currency || 'USD';
    const contributorName = contributorType === 'owner' ? contributor.owner.fullName : contributor.fullName;
    const title = `${t('record_contribution')}: ${contributorName}`;

    const remainingBalance = useMemo(() => {
        return contributor.expectedAmount - contributor.paidAmount;
    }, [contributor]);

    useEffect(() => {
        if(isOpen) setAmount('');
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseFloat(amount.toString());
        if (!isNaN(numericAmount) && numericAmount > 0) {
            const contributorId = contributorType === 'owner' ? contributor.ownerId : contributor.id;
            recordExceptionalPayment(project.id, contributorId, contributorType, Math.min(numericAmount, remainingBalance));
            onClose();
        }
    };

    const formatCurrency = (val: number) => new Intl.NumberFormat(language, { style: 'currency', currency }).format(val);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
             <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2 mb-4">{t('payment_for_project')} "{project.name}"</p>
             <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-2">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-300">{t('expected_amount')}</span>
                        <span className="font-medium">{formatCurrency(contributor.expectedAmount)}</span>
                    </div>
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-300">{t('paid_amount')}</span>
                        <span className="font-medium">{formatCurrency(contributor.paidAmount)}</span>
                    </div>
                     <div className="flex justify-between items-center text-sm font-bold pt-1 border-t border-gray-200 dark:border-gray-600">
                        <span className="">{t('remaining_balance')}</span>
                        <span className="">{formatCurrency(remainingBalance)}</span>
                    </div>
                </div>

                <div>
                    <label htmlFor="payment_amount_exp" className="block text-sm font-medium">{t('payment_amount')}</label>
                    <input
                        type="number"
                        id="payment_amount_exp"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="0"
                        max={remainingBalance}
                        step="0.01"
                        required
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
                 <div className="mt-6 pt-4 border-t dark:border-gray-700 flex justify-end gap-3">
                    <Button type="button" variant="secondary" onClick={onClose}>{t('cancel')}</Button>
                    <Button type="submit">{t('record_payment')}</Button>
                </div>
             </form>
        </Modal>
    );
};

export default ContributionPaymentModal;