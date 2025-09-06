import React, { useState, useEffect, useRef } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { useLanguage } from '../../contexts/LanguageContext';
import { useData } from '../../contexts/DataContext';
import { ExceptionalOutcome } from '../../types';

interface OutcomeModalProps {
    isOpen: boolean;
    onClose: () => void;
    outcome: ExceptionalOutcome | null;
    projectId: string;
}

const OutcomeModal: React.FC<OutcomeModalProps> = ({ isOpen, onClose, outcome, projectId }) => {
    const { t } = useLanguage();
    const { addExceptionalOutcome, confirmExceptionalOutcome, cancelExceptionalOutcome } = useData();

    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState<number | string>('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [photoUrl, setPhotoUrl] = useState('');
    const [cancellationReason, setCancellationReason] = useState('');
    const photoInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setDescription(outcome?.description || '');
            setAmount(outcome?.amount.toString() || '');
            setDate(outcome?.date || new Date().toISOString().split('T')[0]);
            setPhotoUrl(outcome?.photoUrl || '');
            setCancellationReason('');
        }
    }, [isOpen, outcome]);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => setPhotoUrl(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        const numericAmount = parseFloat(amount.toString());
        if (!description.trim() || isNaN(numericAmount) || numericAmount <= 0) return;
        
        if (!outcome) { // Creating new outcome
            addExceptionalOutcome({ projectId, description, amount: numericAmount, date, photoUrl });
        } else {
            // Update logic can be added here if needed
        }
        onClose();
    };

    const handleConfirm = () => {
        if (outcome) {
            confirmExceptionalOutcome(outcome.id);
            onClose();
        } else { // Handle case where user adds and confirms in one go
            const numericAmount = parseFloat(amount.toString());
            if (!description.trim() || isNaN(numericAmount) || numericAmount <= 0) return;
            // This would require addAndConfirm logic in context, for now we separate actions
            handleSave(); // Saves as pending, user must re-open to confirm. A better UX could combine these.
        }
    };

    const handleCancel = () => {
        if (!outcome || !cancellationReason.trim()) return;
        cancelExceptionalOutcome(outcome.id, cancellationReason.trim());
        onClose();
    };

    const title = outcome ? t('expense_details') : t('add_expense');

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">{t('expense_description')}</label>
                    <input type="text" value={description} onChange={e => setDescription(e.target.value)} disabled={!!outcome} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm disabled:bg-gray-100 dark:disabled:bg-gray-800" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">{t('amount')}</label>
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} disabled={!!outcome} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm disabled:bg-gray-100 dark:disabled:bg-gray-800" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">{t('expense_date')}</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} disabled={!!outcome} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm disabled:bg-gray-100 dark:disabled:bg-gray-800" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium">{t('justification_photo')}</label>
                    <div className="mt-2 flex items-center gap-4">
                        {photoUrl && <img src={photoUrl} alt="Justification" className="h-16 w-16 rounded-md object-cover" />}
                        {!outcome && (
                            <Button type="button" variant="secondary" onClick={() => photoInputRef.current?.click()}>{t('upload_photo')}</Button>
                        )}
                        <input type="file" ref={photoInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                    </div>
                </div>
                {outcome?.isConfirmed && (
                     <div>
                        <label className="block text-sm font-medium">{t('cancellation_reason')}</label>
                        <textarea value={cancellationReason} onChange={e => setCancellationReason(e.target.value)} rows={2} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />
                    </div>
                )}
            </div>
             <div className="mt-6 pt-4 border-t dark:border-gray-700 flex justify-end gap-3">
                <Button variant="secondary" onClick={onClose}>{t('cancel')}</Button>
                {!outcome && <Button onClick={handleSave}>{t('save')}</Button>}
                {outcome && !outcome.isConfirmed && <Button onClick={handleConfirm}>{t('confirm_expense')}</Button>}
                {outcome && outcome.isConfirmed && <Button variant="danger" onClick={handleCancel} disabled={!cancellationReason.trim()}>{t('cancel_expense_entry')}</Button>}
             </div>
        </Modal>
    );
};

export default OutcomeModal;
