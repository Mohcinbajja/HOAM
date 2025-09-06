import React, { useState, useEffect, useMemo, useRef } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useLanguage } from '../../contexts/LanguageContext';
import { useData } from '../../contexts/DataContext';
import { Owner, MonthlyPayment, UnitType, AmountType, PaymentStatus } from '../../types';

interface PaymentModalInfo {
    owner: Owner;
    month: number;
    year: number;
    baseFeeForYear: number;
    payment: MonthlyPayment | null;
    monthCategory: 'past' | 'current' | 'future';
    unitType: UnitType | null;
}

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    modalInfo: PaymentModalInfo;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, modalInfo }) => {
    const { t, language } = useLanguage();
    const { selectedProperty, recordPayment, setPaymentStatus, getUnitTypeFeePolicy } = useData();
    
    const { owner, month, year, baseFeeForYear, payment, monthCategory, unitType } = modalInfo;

    const [paymentType, setPaymentType] = useState<'full' | 'partial' | null>(null);
    const [amount, setAmount] = useState<number | string>('');
    const amountInputRef = useRef<HTMLInputElement>(null);

    const currency = selectedProperty?.details.currency || 'USD';
    const monthName = new Date(year, month).toLocaleString(language, { month: 'long' });

    const { adjustedAmountDue, adjustment } = useMemo(() => {
        let adj = 0;
        let adjustedDue = baseFeeForYear;
        if (unitType && selectedProperty) {
            const policy = getUnitTypeFeePolicy(selectedProperty.id, year, unitType.id);
            if (policy) {
                if (monthCategory === 'past' && policy.penalty.amount > 0) {
                    adj = policy.penalty.type === AmountType.FIXED ? policy.penalty.amount : baseFeeForYear * (policy.penalty.amount / 100);
                } else if (monthCategory === 'future' && policy.discount.amount > 0) {
                    adj = -1 * (policy.discount.type === AmountType.FIXED ? policy.discount.amount : baseFeeForYear * (policy.discount.amount / 100));
                }
            }
        }
        adjustedDue += adj;
        return { adjustedAmountDue: adjustedDue, adjustment: adj };
    }, [baseFeeForYear, monthCategory, unitType, selectedProperty, year, getUnitTypeFeePolicy]);

    const remainingBalance = adjustedAmountDue - (payment?.amountPaid || 0);

    useEffect(() => {
        if (isOpen) {
            setAmount('');
            setPaymentType(null);
        }
    }, [isOpen]);
    
    useEffect(() => {
        if (paymentType === 'partial' && amountInputRef.current) {
            amountInputRef.current.focus();
        }
    }, [paymentType]);

    const handleRecordPayment = (paymentAmount: number) => {
        if (!selectedProperty || paymentAmount <= 0) return;

        recordPayment({
            propertyId: selectedProperty.id,
            ownerId: owner.id,
            year,
            month,
            amountDue: baseFeeForYear,
            amountPaid: paymentAmount,
            paymentDate: new Date().toISOString(),
        }, adjustedAmountDue);
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let paymentAmount = 0;
        if (paymentType === 'full') {
            paymentAmount = remainingBalance;
        } else {
            const numericAmount = parseFloat(amount.toString());
            if (!isNaN(numericAmount) && numericAmount > 0) {
                paymentAmount = Math.min(numericAmount, remainingBalance);
            }
        }
        handleRecordPayment(paymentAmount);
    };

    const handlePauseToggle = () => {
        if (!selectedProperty) return;
        const paymentId = `${selectedProperty.id}-${owner.id}-${year}-${month}`;
        const newStatus = payment?.status === PaymentStatus.PAUSED ? PaymentStatus.UNPAID : PaymentStatus.PAUSED;
        setPaymentStatus(paymentId, newStatus, {
            propertyId: selectedProperty.id,
            ownerId: owner.id,
            year,
            month,
            amountDue: baseFeeForYear,
        });
        onClose();
    };

    const title = `${t('payment_details')}: ${owner.fullName}`;
    const subtitle = `${t('payment_for')} ${monthName} ${year}`;
    const isPaused = payment?.status === PaymentStatus.PAUSED;
    const isPaid = payment?.status === PaymentStatus.PAID;
    const numericAmount = parseFloat(amount.toString());
    const canSubmit = paymentType === 'full' || (paymentType === 'partial' && !isNaN(numericAmount) && numericAmount > 0);

    const formatCurrency = (val: number) => new Intl.NumberFormat(language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

    const paymentTypeButtonClasses = "w-full text-center px-4 py-3 text-sm font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500 transition-colors";
    const activePaymentTypeClasses = "bg-blue-600 text-white border-blue-600 shadow";
    const inactivePaymentTypeClasses = "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600";


    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2 mb-4">{subtitle}</p>
            
            {isPaused && (
                <div className="p-4 mb-4 text-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <p className="font-semibold">{t('payment_paused')}</p>
                    <Button onClick={handlePauseToggle} className="mt-2">{t('resume_collection')}</Button>
                </div>
            )}

            {!isPaused && !isPaid && (
                 <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-300">{t('base_fee')}</span>
                            <span className="font-medium">{formatCurrency(baseFeeForYear)}</span>
                        </div>
                        {adjustment !== 0 && (
                             <div className={`flex justify-between items-center text-sm ${adjustment > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                <span className="">{adjustment > 0 ? t('penalty_applied') : t('discount_applied')}</span>
                                <span className="font-medium">{formatCurrency(adjustment)}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center text-sm font-bold pt-1 border-t border-gray-200 dark:border-gray-600">
                            <span className="">{t('adjusted_due')}</span>
                            <span className="">{formatCurrency(adjustedAmountDue)}</span>
                        </div>
                         <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-300">{t('amount_paid')}</span>
                            <span className="font-medium">{formatCurrency(payment?.amountPaid || 0)}</span>
                        </div>
                         <div className="flex justify-between items-center text-sm font-bold">
                            <span className="">{t('remaining_balance')}</span>
                            <span className="">{formatCurrency(remainingBalance)}</span>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('payment_type')}</label>
                        <div className="mt-2 grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setPaymentType('full')}
                                className={`${paymentTypeButtonClasses} ${paymentType === 'full' ? activePaymentTypeClasses : inactivePaymentTypeClasses}`}
                            >
                                {t('full_payment')}
                            </button>
                             <button
                                type="button"
                                onClick={() => setPaymentType('partial')}
                                className={`${paymentTypeButtonClasses} ${paymentType === 'partial' ? activePaymentTypeClasses : inactivePaymentTypeClasses}`}
                            >
                                {t('partial_payment')}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="payment_amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('payment_amount')}</label>
                        <input
                            ref={amountInputRef}
                            type="number"
                            id="payment_amount"
                            value={paymentType === 'full' ? remainingBalance : amount}
                            onChange={(e) => setAmount(e.target.value)}
                            min="0"
                            max={remainingBalance}
                            step="0.01"
                            required
                            disabled={!paymentType || paymentType === 'full'}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 dark:disabled:bg-gray-600"
                        />
                    </div>
                    
                    <div className="mt-6 pt-4 border-t dark:border-gray-700 flex flex-col sm:flex-row-reverse gap-3">
                        <Button type="submit" disabled={!canSubmit}>{t('record_payment')}</Button>
                        <Button type="button" variant="secondary" onClick={handlePauseToggle}>{t('pause_collection')}</Button>
                    </div>
                </form>
            )}

            {isPaid && (
                 <div className="p-4 text-center bg-green-50 dark:bg-green-900/30 rounded-lg">
                    <p className="font-semibold text-green-700 dark:text-green-200">{t('paid')}</p>
                    <p>{formatCurrency(payment.amountPaid)}</p>
                </div>
            )}
        </Modal>
    );
};

export default PaymentModal;