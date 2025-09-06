import React, { useState, useMemo } from 'react';
import { ExceptionalProject, ContributionStatus, ExceptionalPaymentHistoryEntry } from '../../types';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import ContributionPaymentModal from './ContributionPaymentModal';
import ExternalContributorModal from './ExternalContributorModal';
import ReceiptModal from './ReceiptModal';
import OwnerContributionChart from './OwnerContributionChart';
import { TranslationKey } from '../../lib/translations';

interface IncomeTabProps {
    project: ExceptionalProject;
}

const IncomeTab: React.FC<IncomeTabProps> = ({ project }) => {
    const { t, language } = useLanguage();
    const { owners, exceptionalContributions, externalContributors, exceptionalPaymentHistory, selectedProperty, editExceptionalContribution, editExternalContributor } = useData();
    
    const [paymentModalInfo, setPaymentModalInfo] = useState<{ contributor: any, type: 'owner' | 'external' } | null>(null);
    const [contributorModalOpen, setContributorModalOpen] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState<ExceptionalPaymentHistoryEntry | null>(null);
    const [filterContributor, setFilterContributor] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');


    const currency = selectedProperty?.details.currency || 'USD';
    const formatCurrency = (amount: number) => new Intl.NumberFormat(language, { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount);
    
    const ownerContributions = useMemo(() => {
        const ownersMap = new Map(owners.map(o => [o.id, o]));
        return exceptionalContributions
            .filter(c => c.projectId === project.id)
            .map(c => ({ ...c, owner: ownersMap.get(c.ownerId) }))
            .filter(c => c.owner)
            .sort((a,b) => a.owner!.fullName.localeCompare(b.owner!.fullName));
    }, [project.id, exceptionalContributions, owners]);
    
    const projectExternalContributors = useMemo(() => {
        return externalContributors.filter(c => c.projectId === project.id)
            .sort((a,b) => a.fullName.localeCompare(b.fullName));
    }, [project.id, externalContributors]);

    const allContributorsForFilter = useMemo(() => {
        const ownerContribs = ownerContributions.map(c => ({ id: c.ownerId, name: c.owner!.fullName }));
        const externalContribs = projectExternalContributors.map(c => ({ id: c.id, name: c.fullName }));
        return [...ownerContribs, ...externalContribs].sort((a,b) => a.name.localeCompare(b.name));
    }, [ownerContributions, projectExternalContributors]);

    const contributorsMap = useMemo(() => {
        const map = new Map();
        owners.forEach(o => map.set(o.id, o.fullName));
        externalContributors.forEach(c => map.set(c.id, c.fullName));
        return map;
    }, [owners, externalContributors]);

    const auditTrail = useMemo(() => {
        return exceptionalPaymentHistory
            .filter(h => {
                if (h.projectId !== project.id) return false;
                if (filterContributor !== 'all' && h.contributorId !== filterContributor) return false;

                if (searchTerm) {
                    const lowerSearch = searchTerm.toLowerCase();
                    const contributorName = (contributorsMap.get(h.contributorId) || '').toLowerCase();
                    const amount = h.amountPaid.toString();
                    const description = t('payment_received_audit', { contributor: contributorName, project: project.name }).toLowerCase();

                    if (!contributorName.includes(lowerSearch) && !amount.includes(lowerSearch) && !description.includes(lowerSearch)) {
                        return false;
                    }
                }
                return true;
            })
            .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
    }, [project.id, project.name, exceptionalPaymentHistory, contributorsMap, t, filterContributor, searchTerm]);

    const isFilterActive = filterContributor !== 'all' || searchTerm !== '';
    const handleClearFilters = () => {
        setFilterContributor('all');
        setSearchTerm('');
    };

    const formatDate = (dateString: string) => new Date(dateString).toLocaleString(language, {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const getStatusBadge = (status: ContributionStatus) => {
        switch(status) {
            case ContributionStatus.FULLY_PAID: return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">{t('fully_paid')}</span>;
            case ContributionStatus.PARTIALLY_PAID: return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">{t('partially_paid_ext')}</span>;
            case ContributionStatus.NOT_PAID: return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">{t('not_paid')}</span>;
        }
    }

    return (
        <div className="space-y-8">
            <Card title={t('owner_contributions')}>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('owner')}</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('expected_amount')}</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('paid_amount')}</th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('status')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {ownerContributions.map(c => (
                                <tr key={c.id}>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">{c.owner!.fullName}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                                        <input
                                            type="number"
                                            key={`${c.id}-expected`}
                                            defaultValue={c.expectedAmount.toFixed(2)}
                                            onBlur={(e) => {
                                                const newValue = parseFloat(e.target.value);
                                                if (!isNaN(newValue) && newValue !== c.expectedAmount) {
                                                    editExceptionalContribution(c.id, { expectedAmount: newValue });
                                                } else {
                                                    e.target.value = c.expectedAmount.toFixed(2);
                                                }
                                            }}
                                            step="0.01"
                                            min="0"
                                            className="w-28 text-right bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-1"
                                        />
                                    </td>
                                    <td 
                                        className={`px-4 py-2 whitespace-nowrap text-sm text-right ${c.status !== ContributionStatus.FULLY_PAID ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30' : ''}`}
                                        onClick={() => c.status !== ContributionStatus.FULLY_PAID && setPaymentModalInfo({ contributor: c, type: 'owner' })}
                                        title={c.status !== ContributionStatus.FULLY_PAID ? t('record_payment') : ''}
                                    >
                                         <input
                                            type="text"
                                            value={formatCurrency(c.paidAmount)}
                                            readOnly
                                            className={`w-28 text-right bg-transparent dark:bg-transparent border-none focus:ring-0 p-1 ${c.status !== ContributionStatus.FULLY_PAID ? 'cursor-pointer' : ''}`}
                                        />
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-center">{getStatusBadge(c.status)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Card title={t('external_contributors')}>
                <div className="flex justify-end mb-4">
                    <Button onClick={() => setContributorModalOpen(true)}>
                        <Icon name="plus" className="h-5 w-5 mr-2" /> {t('add_contributor')}
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('full_name')}</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('expected_amount')}</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('paid_amount')}</th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('status')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {projectExternalContributors.map(c => (
                                <tr key={c.id}>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">{c.fullName}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                                         <input
                                            type="number"
                                            key={`${c.id}-expected`}
                                            defaultValue={c.expectedAmount.toFixed(2)}
                                            onBlur={(e) => {
                                                const newValue = parseFloat(e.target.value);
                                                if (!isNaN(newValue) && newValue !== c.expectedAmount) {
                                                    editExternalContributor(c.id, { expectedAmount: newValue });
                                                } else {
                                                    e.target.value = c.expectedAmount.toFixed(2);
                                                }
                                            }}
                                            step="0.01"
                                            min="0"
                                            className="w-28 text-right bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-1"
                                        />
                                    </td>
                                    <td 
                                        className={`px-4 py-2 whitespace-nowrap text-sm text-right ${c.status !== ContributionStatus.FULLY_PAID ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30' : ''}`}
                                        onClick={() => c.status !== ContributionStatus.FULLY_PAID && setPaymentModalInfo({ contributor: c, type: 'external' })}
                                        title={c.status !== ContributionStatus.FULLY_PAID ? t('record_payment') : ''}
                                    >
                                        <input
                                            type="text"
                                            value={formatCurrency(c.paidAmount)}
                                            readOnly
                                            className={`w-28 text-right bg-transparent dark:bg-transparent border-none focus:ring-0 p-1 ${c.status !== ContributionStatus.FULLY_PAID ? 'cursor-pointer' : ''}`}
                                        />
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-center">{getStatusBadge(c.status)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Card title={t('audit_trail')}>
                <div className="p-4 mb-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h4 className="text-md font-semibold mb-3">{t('filter_transactions')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                        <div className="lg:col-span-1">
                            <label htmlFor="filter-contributor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contributor</label>
                             <select
                                id="filter-contributor"
                                value={filterContributor}
                                onChange={e => setFilterContributor(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            >
                                <option value="all">{t('all_contributors')}</option>
                                {allContributorsForFilter.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="lg:col-span-2">
                            <label htmlFor="search-term-exp" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('search_by_contributor')}</label>
                            <div className="mt-1 flex gap-2">
                                <input
                                    type="text"
                                    id="search-term-exp"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    placeholder={t('search_by_contributor')}
                                    className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                                <Button variant="secondary" onClick={handleClearFilters} disabled={!isFilterActive}>
                                    {t('clear_filters')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
                {auditTrail.length > 0 ? (
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
                                {auditTrail.map(entry => {
                                    const contributorName = contributorsMap.get(entry.contributorId) || 'Unknown';
                                    const description = t('payment_received_audit', { contributor: contributorName, project: project.name });
                                    return (
                                        <tr key={entry.transactionId}>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(entry.transactionDate)}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{description}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-green-600 dark:text-green-400">
                                                {formatCurrency(entry.amountPaid)}
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
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                        {isFilterActive ? t('no_transactions_match') : t('no_transactions_for_year')}
                    </p>
                )}
            </Card>

            <OwnerContributionChart project={project} />
            
            {paymentModalInfo && (
                <ContributionPaymentModal
                    isOpen={!!paymentModalInfo}
                    onClose={() => setPaymentModalInfo(null)}
                    contributor={paymentModalInfo.contributor}
                    contributorType={paymentModalInfo.type}
                    project={project}
                />
            )}
            
            <ExternalContributorModal
                isOpen={contributorModalOpen}
                onClose={() => setContributorModalOpen(false)}
                projectId={project.id}
            />
            
            {selectedReceipt && (
                <ReceiptModal
                    isOpen={!!selectedReceipt}
                    onClose={() => setSelectedReceipt(null)}
                    entry={selectedReceipt}
                    project={project}
                />
            )}
        </div>
    );
};

export default IncomeTab;
