import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { UnitType, Fee, AmountType } from '../../types';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Icon from '../ui/Icon';

const AmountTypeToggle: React.FC<{ value: AmountType, onChange: (value: AmountType) => void }> = ({ value, onChange }) => {
    const { t } = useLanguage();
    const isPercentage = value === AmountType.PERCENTAGE;
    return (
        <div className="flex items-center rounded-lg bg-gray-200 dark:bg-gray-600 p-1">
            <button type="button" onClick={() => onChange(AmountType.PERCENTAGE)} className={`px-3 py-1 text-sm font-medium rounded-md w-1/2 transition-colors ${isPercentage ? 'bg-white dark:bg-gray-800 shadow text-gray-800 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                {t('percentage')}
            </button>
            <button type="button" onClick={() => onChange(AmountType.FIXED)} className={`px-3 py-1 text-sm font-medium rounded-md w-1/2 transition-colors ${!isPercentage ? 'bg-white dark:bg-gray-800 shadow text-gray-800 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                {t('fixed')}
            </button>
        </div>
    );
};

interface FeePolicyUIData {
    unitTypeId: string;
    baseFee: string;
    penalty: { amount: string; type: AmountType };
    discount: { amount: string; type: AmountType };
}

interface FeePoliciesProps {
    selectedYear: number;
}

const FeePolicies: React.FC<FeePoliciesProps> = ({ selectedYear }) => {
    const { t } = useLanguage();
    const { 
        selectedProperty, 
        unitTypes, 
        getUnitTypeFeePolicy, 
        updateUnitTypeFeePolicies,
        setHasUnsavedChanges,
        registerActions,
        unregisterActions,
        showSuccessMessage
    } = useData();

    const [policies, setPolicies] = useState<FeePolicyUIData[]>([]);
    const [initialPolicies, setInitialPolicies] = useState<FeePolicyUIData[]>([]);

    const propertyUnitTypes = useMemo(() => 
        unitTypes.filter(ut => ut.propertyId === selectedProperty?.id), 
        [unitTypes, selectedProperty]
    );

    const initializeState = useCallback(() => {
        if (!selectedProperty) return;
        const initialData = propertyUnitTypes.map(ut => {
            const existingPolicy = getUnitTypeFeePolicy(selectedProperty.id, selectedYear, ut.id);
            return {
                unitTypeId: ut.id,
                baseFee: existingPolicy?.baseFee.toString() || '0',
                penalty: {
                    amount: existingPolicy?.penalty?.amount.toString() || '0',
                    type: existingPolicy?.penalty?.type || AmountType.PERCENTAGE
                },
                discount: {
                    amount: existingPolicy?.discount?.amount.toString() || '0',
                    type: existingPolicy?.discount?.type || AmountType.PERCENTAGE
                },
            };
        });
        setPolicies(initialData);
        setInitialPolicies(JSON.parse(JSON.stringify(initialData)));
        setHasUnsavedChanges(false);
    }, [selectedProperty, propertyUnitTypes, getUnitTypeFeePolicy, selectedYear, setHasUnsavedChanges]);

    useEffect(() => {
        initializeState();
    }, [initializeState]);

    useEffect(() => {
        setHasUnsavedChanges(JSON.stringify(policies) !== JSON.stringify(initialPolicies));
    }, [policies, initialPolicies, setHasUnsavedChanges]);

    const handleSave = useCallback(async () => {
        if (!selectedProperty) return;
        const policiesToSave = policies.map(p => ({
            unitTypeId: p.unitTypeId,
            baseFee: parseFloat(p.baseFee) || 0,
            penalty: { amount: parseFloat(p.penalty.amount) || 0, type: p.penalty.type },
            discount: { amount: parseFloat(p.discount.amount) || 0, type: p.discount.type }
        }));

        updateUnitTypeFeePolicies(selectedProperty.id, selectedYear, policiesToSave);
        setInitialPolicies(JSON.parse(JSON.stringify(policies)));
        setHasUnsavedChanges(false);
        showSuccessMessage(t('policies_saved_success'));
    }, [selectedProperty, selectedYear, policies, updateUnitTypeFeePolicies, setHasUnsavedChanges, showSuccessMessage, t]);

    const handleDiscard = useCallback(() => {
        setPolicies(JSON.parse(JSON.stringify(initialPolicies)));
        setHasUnsavedChanges(false);
    }, [initialPolicies, setHasUnsavedChanges]);

    useEffect(() => {
        registerActions(handleSave, handleDiscard);
        return () => unregisterActions();
    }, [registerActions, unregisterActions, handleSave, handleDiscard]);

    const handlePolicyChange = (unitTypeId: string, field: 'baseFee' | 'penalty' | 'discount', value: string | AmountType, subField?: 'amount' | 'type') => {
        if ( (field === 'baseFee' || subField === 'amount') && !(value === '' || /^\d*\.?\d*$/.test(value as string))) {
            return; // Invalid input for amount fields
        }

        setPolicies(prevPolicies =>
            prevPolicies.map(p => {
                if (p.unitTypeId !== unitTypeId) return p;
                
                if (field === 'baseFee') {
                    return { ...p, baseFee: value as string };
                }
                
                return {
                    ...p,
                    [field]: {
                        ...p[field],
                        [subField!]: value,
                    },
                };
            })
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSave();
    };

    if (propertyUnitTypes.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">{t('no_unit_types_for_policies')}</p>
            </div>
        );
    }
    
    return (
        <Card title={t('fee_policies_for_year', { year: selectedYear })}>
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {propertyUnitTypes.map(unitType => {
                        const policy = policies.find(p => p.unitTypeId === unitType.id);
                        if (!policy) return null;

                        return (
                            <div key={unitType.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                <h4 className="font-semibold text-lg text-gray-800 dark:text-white mb-4">{unitType.name}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('base_fee')}</label>
                                        <input type="text" inputMode="decimal" value={policy.baseFee} onChange={e => handlePolicyChange(unitType.id, 'baseFee', e.target.value)} className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder={t('amount')} />
                                    </div>
                                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('penalty')}</label>
                                        <div className="space-y-2">
                                            <div className="relative">
                                                <input type="text" inputMode="decimal" value={policy.penalty.amount} onChange={e => handlePolicyChange(unitType.id, 'penalty', e.target.value, 'amount')} className={`block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${policy.penalty.type === AmountType.PERCENTAGE ? 'pr-7' : ''}`} placeholder={t('amount')} />
                                                {policy.penalty.type === AmountType.PERCENTAGE && (
                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                        <span className="text-gray-500 dark:text-gray-400 sm:text-sm">%</span>
                                                    </div>
                                                )}
                                            </div>
                                            <AmountTypeToggle value={policy.penalty.type} onChange={v => handlePolicyChange(unitType.id, 'penalty', v, 'type')} />
                                        </div>
                                    </div>
                                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('discount')}</label>
                                        <div className="space-y-2">
                                            <div className="relative">
                                                <input type="text" inputMode="decimal" value={policy.discount.amount} onChange={e => handlePolicyChange(unitType.id, 'discount', e.target.value, 'amount')} className={`block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${policy.discount.type === AmountType.PERCENTAGE ? 'pr-7' : ''}`} placeholder={t('amount')} />
                                                {policy.discount.type === AmountType.PERCENTAGE && (
                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                        <span className="text-gray-500 dark:text-gray-400 sm:text-sm">%</span>
                                                    </div>
                                                )}
                                            </div>
                                            <AmountTypeToggle value={policy.discount.type} onChange={v => handlePolicyChange(unitType.id, 'discount', v, 'type')} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                 <div className="mt-6 flex justify-end">
                    <Button type="submit">{t('save_fee_policies')}</Button>
                </div>
            </form>
        </Card>
    );
};

export default FeePolicies;