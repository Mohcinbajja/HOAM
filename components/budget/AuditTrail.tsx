import React, { useMemo, useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Owner, PaymentHistoryEntry } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import ReceiptModal from './ReceiptModal';
import { TranslationKey } from '../../lib/translations';

interface AuditTrailProps {
    selectedYear: number;
}

const AuditTrail: React.FC<AuditTrailProps> = ({ selectedYear }) => {
    const { t, language } = useLanguage();
    const { selectedProperty, paymentHistory, owners } = useData();
    const [selectedReceipt, setSelectedReceipt] = useState<PaymentHistoryEntry | null>(null);
    const [filterOwner, setFilterOwner] = useState<string>('all');
    const [filterMonth, setFilterMonth] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const ownersMap = useMemo(() => {
        return owners.reduce((acc, owner) => {
            acc[owner.id] = owner;
            return acc;
        }, {} as Record<string, Owner>);
    }, [owners]);
    
    const propertyOwners = useMemo(() => {
        if (!selectedProperty) return [];
        return owners
            .filter(o => o.propertyId === selectedProperty.id && o.isActive)
            .sort((a,b) => a.fullName.localeCompare(b.fullName));
    }, [owners, selectedProperty]);

    const getMonthName = (monthIndex: number) => new Date(selectedYear, monthIndex).toLocaleString(language, { month: 'long' });

    const filteredHistory = useMemo(() => {
        if (!selectedProperty) return [];
        return paymentHistory
            .filter(entry => {
                if (entry.propertyId !== selectedProperty.id || entry.year !== selectedYear) {
                    return false;
                }
                if (filterOwner !== 'all' && entry.ownerId !== filterOwner) {
                    return false;
                }
                if (filterMonth !== 'all' && entry.month !== parseInt(filterMonth)) {
                    return false;
                }
                if (searchTerm) {
                    const lowerSearch = searchTerm.toLowerCase();
                    const ownerName = (ownersMap[entry.ownerId]?.fullName || '').toLowerCase();
                    const amount = entry.amountPaid.toString();
                    const monthName = getMonthName(entry.month).toLowerCase();
                    const paymentTypeKey = entry.notes === 'full_payment' ? 'full_payment' : 'partial_payment';
                    const paymentType = t(paymentTypeKey as TranslationKey);
                    const description = `${paymentType} for ${monthName} ${entry.year} by ${ownerName}`.toLowerCase();
                    
                    if (
                        !ownerName.includes(lowerSearch) &&
                        !amount.includes(lowerSearch) &&
                        !description.includes(lowerSearch)
                    ) {
                        return false;
                    }
                }
                return true;
            })
            .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
    }, [paymentHistory, selectedProperty, selectedYear, filterOwner, filterMonth, searchTerm, ownersMap, getMonthName, t]);

    const isFilterActive = filterOwner !== 'all' || filterMonth !== 'all' || searchTerm !== '';

    const handleClearFilters = () => {
        setFilterOwner('all');
        setFilterMonth('all');
        setSearchTerm('');
    };

    const monthOptions = Array.from({ length: 12 }, (_, i) => ({
        value: i,
        label: getMonthName(i),
    }));

    const currency = selectedProperty?.details.currency || 'USD';
    const formatCurrency = (amount: number) => new Intl.NumberFormat(language, { style: 'currency', currency }).format(amount);
    const formatDate = (dateString: string) => new Date(dateString).toLocaleString(language, {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
        <div className="mt-8">
            <Card title={t('audit_trail')}>
                <div className="p-4 mb-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h4 className="text-md font-semibold mb-3">{t('filter_transactions')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <div>
                            <label htmlFor="filter-owner" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('owner')}</label>
                            <select
                                id="filter-owner"
                                value={filterOwner}
                                onChange={e => setFilterOwner(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            >
                                <option value="all">{t('all_owners')}</option>
                                {propertyOwners.map(o => <option key={o.id} value={o.id}>{o.fullName}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="filter-month" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('monthly')}</label>
                            <select
                                id="filter-month"
                                value={filterMonth}
                                onChange={e => setFilterMonth(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            >
                                <option value="all">{t('all_months')}</option>
                                {monthOptions.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </select>
                        </div>
                        <div className="lg:col-span-2">
                             <label htmlFor="search-term" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('search_transactions')}</label>
                            <div className="mt-1 flex gap-2">
                                <input
                                    type="text"
                                    id="search-term"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    placeholder={t('search_transactions')}
                                    className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                                <Button variant="secondary" onClick={handleClearFilters} disabled={!isFilterActive}>
                                    {t('clear_filters')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {filteredHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('description')}</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('amount')}</th>
                                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('receipt')}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredHistory.map(entry => {
                                    const ownerName = ownersMap[entry.ownerId]?.fullName || entry.ownerId;
                                    const monthName = getMonthName(entry.month);
                                    
                                    const paymentTypeKey = entry.notes === 'full_payment' ? 'full_payment' : 'partial_payment';
                                    const paymentType = t(paymentTypeKey as TranslationKey);
                                    const description = `${paymentType} for ${monthName} ${entry.year} by ${ownerName}`;
                                    
                                    return (
                                        <tr key={entry.transactionId}>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(entry.transactionDate)}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">{description}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                                                <div className={`font-semibold ${entry.amountPaid >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                    {formatCurrency(entry.amountPaid)}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {t('total')}: {formatCurrency(entry.newAmount)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-center">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => setSelectedReceipt(entry)}
                                                    title={t('view_receipt')}
                                                >
                                                    <Icon name="reports" className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                        {isFilterActive ? t('no_transactions_match') : t('no_payments_for_year')}
                    </p>
                )}
            </Card>
            {selectedReceipt && (
                <ReceiptModal
                    isOpen={!!selectedReceipt}
                    onClose={() => setSelectedReceipt(null)}
                    entry={selectedReceipt}
                    owner={ownersMap[selectedReceipt.ownerId] || null}
                />
            )}
        </div>
    );
};

export default AuditTrail;