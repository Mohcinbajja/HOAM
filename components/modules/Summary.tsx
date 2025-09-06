import React, { useMemo, useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Icon from '../ui/Icon';
import { MonthlyPayment, Owner, PaymentStatus, Module, AmountType } from '../../types';
import Button from '../ui/Button';
import OverdueNoticeModal from '../notifications/OverdueNoticeModal';

const StatCard: React.FC<{ icon: string; label: string; value: string; color: string }> = ({ icon, label, value, color }) => {
    return (
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex items-center space-x-4">
            <div className={`p-3 rounded-full ${color}`}>
                <Icon name={icon} className="h-6 w-6 text-white" />
            </div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
        </div>
    );
};


const Summary: React.FC = () => {
    const { selectedProperty, owners, monthlyPayments, units, unitTypes, setActiveModule, getUnitsByOwner, getUnitTypeFeePolicy } = useData();
    const { t } = useLanguage();
    const [notificationTargets, setNotificationTargets] = useState<Owner[] | null>(null);
    
    if (!selectedProperty) return null;

    const propertyOwners = useMemo(() => owners.filter(o => o.propertyId === selectedProperty.id), [owners, selectedProperty.id]);
    const propertyUnits = useMemo(() => units.filter(u => u.propertyId === selectedProperty.id), [units, selectedProperty.id]);
    
    const pastDueOwners = useMemo(() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        const getMonthCategory = (year: number, month: number): 'past' | 'current' | 'future' => {
            if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth())) return 'past';
            if (year === now.getFullYear() && month === now.getMonth()) return 'current';
            return 'future';
        };

        const getAdjustedMonthlyFee = (baseFee: number, policy: any, monthCategory: 'past' | 'current' | 'future'): number => {
            if (!policy) return baseFee;
            if (monthCategory === 'past' && policy.penalty.amount > 0) {
                return baseFee + (policy.penalty.type === AmountType.FIXED ? policy.penalty.amount : baseFee * (policy.penalty.amount / 100));
            }
            if (monthCategory === 'future' && policy.discount.amount > 0) {
                return baseFee - (policy.discount.type === AmountType.FIXED ? policy.discount.amount : baseFee * (policy.discount.amount / 100));
            }
            return baseFee;
        };
        
        const propertyPayments = monthlyPayments.filter(p => p.propertyId === selectedProperty.id);

        return propertyOwners.filter(owner => {
            if (!owner.isActive) return false;

            const ownerUnits = getUnitsByOwner(owner.id);
            if (ownerUnits.length === 0) return false;
            const ownerUnitType = unitTypes.find(ut => ut.id === ownerUnits[0].unitTypeId);
            if (!ownerUnitType) return false;
            
            const joinDate = new Date(owner.joinDate);

            // Check payments for all past months since owner joined
            for (let year = joinDate.getFullYear(); year <= currentYear; year++) {
                const startMonth = (year === joinDate.getFullYear()) ? joinDate.getMonth() : 0;
                const endMonth = (year === currentYear) ? currentMonth - 1 : 11;

                for (let month = startMonth; month <= endMonth; month++) {
                    const payment = propertyPayments.find(p => p.ownerId === owner.id && p.year === year && p.month === month);
                    if (payment?.status === PaymentStatus.PAUSED) continue;

                    const policy = getUnitTypeFeePolicy(selectedProperty.id, year, ownerUnitType.id);
                    const baseFee = policy?.baseFee || 0;
                    const monthCategory = getMonthCategory(year, month);
                    const adjustedDue = getAdjustedMonthlyFee(baseFee, policy, monthCategory);
                    const amountPaid = payment?.amountPaid || 0;

                    if (amountPaid < adjustedDue) {
                        return true; // Found an overdue payment, include owner and stop checking
                    }
                }
            }
            return false;
        });

    }, [monthlyPayments, selectedProperty.id, propertyOwners, unitTypes, getUnitsByOwner, getUnitTypeFeePolicy]);

    const handleNavigateToBudget = () => {
        setActiveModule(Module.RegularBudget);
    };

    return (
        <>
        <div className="space-y-8">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
                <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                    {t('module_summary')} for <span className="text-blue-600 dark:text-blue-400">{selectedProperty.name}</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    <StatCard icon="units" label={t('module_units')} value={propertyUnits.length.toString()} color="bg-blue-500" />
                    <StatCard icon="owners" label={t('module_owners')} value={propertyOwners.length.toString()} color="bg-green-500" />
                    <StatCard icon="balance" label={t('balance')} value="$0.00" color="bg-yellow-500" />
                </div>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{t('past_due_payments')}</h3>
                    {pastDueOwners.length > 0 && (
                        <Button onClick={() => setNotificationTargets(pastDueOwners)} size="sm">
                            <Icon name="email" className="h-4 w-4 mr-2"/>
                            {t('notify_all_overdue')}
                        </Button>
                    )}
                </div>
                {pastDueOwners.length > 0 ? (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {pastDueOwners.map(owner => (
                            <li key={owner.id} className="py-2 flex justify-between items-center gap-4">
                                <span className="text-gray-800 dark:text-gray-200 font-medium">{owner.fullName}</span>
                                <div className="flex items-center gap-2">
                                    <Button onClick={() => setNotificationTargets([owner])} variant="secondary" size="sm">
                                        {t('notify_overdue')}
                                    </Button>
                                    <button
                                        onClick={handleNavigateToBudget}
                                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center p-2 rounded-md"
                                        title={t('go_to_budget')}
                                    >
                                        <Icon name="back" className="w-4 h-4 transform rotate-180" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">{t('no_past_due_payments')}</p>
                )}
            </div>
        </div>
        {notificationTargets && (
            <OverdueNoticeModal 
                // FIX: Added the required 'isOpen' prop to control modal visibility.
                isOpen={!!notificationTargets}
                targets={notificationTargets} 
                onClose={() => setNotificationTargets(null)} 
            />
        )}
        </>
    );
};

export default Summary;
