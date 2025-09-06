import React, { useState, useEffect, useRef } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { useLanguage } from '../../contexts/LanguageContext';
import { useData } from '../../contexts/DataContext';
import { ExpenseCategory, MonthlyOutcome } from '../../types';
import PropertyIcon from '../property/PropertyIcon';
// FIX: Corrected import path for printElementById.
import { printElementById } from '../../lib/exportUtils';

interface ModalInfo {
    category: ExpenseCategory;
    month: number;
    outcome: MonthlyOutcome | null;
}

interface OutcomeEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    modalInfo: ModalInfo;
    selectedYear: number;
}

const OutcomeEntryModal: React.FC<OutcomeEntryModalProps> = ({ isOpen, onClose, modalInfo, selectedYear }) => {
    const { t, language } = useLanguage();
    const { selectedProperty, updateMonthlyOutcome, cancelMonthlyOutcome } = useData();

    const { category, month, outcome } = modalInfo;
    
    const [amount, setAmount] = useState(outcome?.amount?.toString() || '');
    const [photoUrl, setPhotoUrl] = useState(outcome?.photoUrl || '');
    const [cancellationReason, setCancellationReason] = useState('');
    const photoInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setAmount(outcome?.amount?.toString() || '');
        setPhotoUrl(outcome?.photoUrl || '');
        setCancellationReason('');
    }, [outcome, isOpen]);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = (isConfirmed: boolean) => {
        if (!selectedProperty) return;
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount < 0) return;

        updateMonthlyOutcome({
            propertyId: selectedProperty.id,
            year: selectedYear,
            month,
            categoryId: category.id,
            amount: numericAmount,
            photoUrl,
            isConfirmed,
            confirmedAt: isConfirmed ? new Date().toISOString() : undefined,
            notes: isConfirmed ? outcome?.notes : undefined,
        });
        onClose();
    };

    const handleCancelEntry = () => {
        if (!outcome) return;
        if (!cancellationReason.trim()) {
            alert(t('cancellation_reason_prompt'));
            return;
        }
        cancelMonthlyOutcome(outcome, cancellationReason.trim());
        onClose();
    };
    
    const receiptId = `outcome-receipt-${outcome?.id}`;
    const handlePrint = () => {
        printElementById(receiptId);
    };

    const monthName = new Date(selectedYear, month).toLocaleString(language, { month: 'long' });
    const title = `${t('expense_details')}: ${category.name}`;
    const subtitle = `${monthName} ${selectedYear}`;
    const currency = selectedProperty?.details.currency || 'USD';
    const formatCurrency = (val: number) => new Intl.NumberFormat(language, { style: 'currency', currency }).format(val);
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString(language, {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            {!outcome?.isConfirmed ? (
                <>
                    <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2 mb-4">{subtitle}</p>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="expense-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('amount')}</label>
                            <input
                                type="number"
                                id="expense-amount"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                min="0"
                                step="0.01"
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('justification_photo')}</label>
                            <div className="mt-2 flex items-center gap-4">
                                {photoUrl ? (
                                    <img src={photoUrl} alt="Justification" className="h-16 w-16 rounded-md object-cover" />
                                ) : (
                                    <div className="h-16 w-16 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                        <Icon name="camera" className="h-8 w-8 text-gray-400" />
                                    </div>
                                )}
                                <Button type="button" variant="secondary" onClick={() => photoInputRef.current?.click()}>
                                   {photoUrl ? t('change_photo') : t('upload_photo')}
                                </Button>
                                <input type="file" ref={photoInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t dark:border-gray-700 flex justify-end gap-3">
                            <Button variant="secondary" onClick={onClose}>{t('cancel')}</Button>
                            <Button onClick={() => handleSave(false)}>{t('save')}</Button>
                            <Button onClick={() => handleSave(true)} disabled={!amount || parseFloat(amount) <= 0}>{t('confirm_expense')}</Button>
                        </div>
                    </div>
                </>
            ) : (
                <div>
                     <div id={receiptId} className="printable-receipt space-y-6">
                        <div className="flex justify-between items-start pb-4 border-b border-gray-300 dark:border-gray-600">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white dark-text-fix">{selectedProperty?.details.associationName || selectedProperty?.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 dark-text-fix">{t('expense_details')}</p>
                            </div>
                           <PropertyIcon details={selectedProperty!.details} className="h-16 w-16 text-gray-700 dark:text-gray-300 dark-text-fix" />
                        </div>

                         <div className="grid grid-cols-2 gap-4 text-sm">
                             <div>
                                <p className="font-semibold text-gray-600 dark:text-gray-300 dark-text-fix">{t('date_of_payment')}</p>
                                <p className="text-gray-800 dark:text-gray-100 dark-text-fix">{formatDate(outcome.confirmedAt || new Date().toISOString())}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-gray-600 dark:text-gray-300 dark-text-fix">{t('expense_category')}</p>
                                <p className="text-gray-800 dark:text-gray-100 dark-text-fix">{category.name}</p>
                            </div>
                         </div>
                         <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg space-y-2">
                             <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600 dark:text-gray-300">{t('amount')}</span>
                                <span className="font-medium text-lg text-gray-800 dark:text-gray-100">{formatCurrency(outcome.amount)}</span>
                            </div>
                            {outcome.photoUrl && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600 dark:text-gray-300">{t('justification_photo')}</span>
                                    <a href={outcome.photoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{t('view_photo')}</a>
                                </div>
                            )}
                        </div>
                    </div>
                    
                     <div className="mt-6 space-y-4 no-print">
                         <div>
                            <label htmlFor="cancellation-reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('cancellation_reason')}</label>
                            <textarea
                                id="cancellation-reason"
                                value={cancellationReason}
                                onChange={e => setCancellationReason(e.target.value)}
                                rows={2}
                                placeholder={t('cancellation_reason_prompt')}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                            />
                        </div>
                        <div className="pt-4 border-t dark:border-gray-700 flex justify-end gap-3">
                            <Button variant="secondary" onClick={onClose}>{t('close')}</Button>
                            <Button type="button" onClick={handlePrint}>{t('print')}</Button>
                            <Button variant="danger" onClick={handleCancelEntry} disabled={!cancellationReason.trim()}>{t('cancel_expense_entry')}</Button>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default OutcomeEntryModal;
