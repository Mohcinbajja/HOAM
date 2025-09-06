import React, { useState, useMemo, useCallback } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { ArchivedDocument, ExceptionalPaymentHistoryEntry, PaymentHistoryEntry } from '../../types';
import Icon from '../ui/Icon';
import Button from '../ui/Button';
import Card from '../ui/Card';
import UploadDocumentModal from '../archive/UploadDocumentModal';
import DocumentViewerModal from '../archive/DocumentViewerModal';
import DeleteDocumentModal from '../archive/DeleteDocumentModal';
import ReceiptModal from '../budget/ReceiptModal';
import ExceptionalReceiptModal from '../exceptional-budget/ReceiptModal';

interface UnifiedDocument {
    id: string;
    name: string;
    date: string;
    year: number;
    source: string;
    sourceType: 'manual' | 'regular_outcome' | 'exceptional_outcome' | 'payment_receipt' | 'contribution_receipt';
    action: () => void;
    canDelete: boolean;
    originalDoc?: any;
}

const Archive: React.FC = () => {
    const { t, language } = useLanguage();
    const { 
        selectedProperty, 
        archivedDocuments, 
        monthlyOutcomes, 
        exceptionalOutcomes, 
        paymentHistory, 
        exceptionalPaymentHistory,
        expenseCategories,
        exceptionalProjects,
        owners,
    } = useData();
    
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ column: 'name' | 'date' | 'source', direction: 'asc' | 'desc' }>({ column: 'date', direction: 'desc' });
    
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [viewingDoc, setViewingDoc] = useState<{name: string, url: string} | null>(null);
    const [deletingDoc, setDeletingDoc] = useState<ArchivedDocument | null>(null);
    const [viewingReceipt, setViewingReceipt] = useState<any | null>(null);

    const yearOptions = useMemo(() => {
        if (!selectedProperty) return [];
        const years = new Set<number>();
        // FIX: exceptionalOutcomes and exceptionalPaymentHistory do not have propertyId.
        // We need to check if their project belongs to the selected property.
        const projectsForProperty = new Set(exceptionalProjects.filter(p => p.propertyId === selectedProperty.id).map(p => p.id));
        archivedDocuments.forEach(d => d.propertyId === selectedProperty.id && years.add(d.year));
        monthlyOutcomes.forEach(d => d.propertyId === selectedProperty.id && years.add(d.year));
        exceptionalOutcomes.forEach(d => projectsForProperty.has(d.projectId) && years.add(new Date(d.date).getFullYear()));
        paymentHistory.forEach(d => d.propertyId === selectedProperty.id && years.add(d.year));
        exceptionalPaymentHistory.forEach(d => projectsForProperty.has(d.projectId) && years.add(new Date(d.transactionDate).getFullYear()));
        if(years.size === 0) years.add(new Date().getFullYear());
        return Array.from(years).sort((a, b) => b - a);
    }, [selectedProperty, archivedDocuments, monthlyOutcomes, exceptionalOutcomes, paymentHistory, exceptionalPaymentHistory, exceptionalProjects]);

    const handleDownload = (doc: ArchivedDocument) => {
        const link = document.createElement('a');
        link.href = doc.fileUrl;
        link.download = doc.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const aggregatedDocuments = useMemo<UnifiedDocument[]>(() => {
        if (!selectedProperty) return [];

        const expenseCategoriesMap = new Map(expenseCategories.map(c => [c.id, c.name]));
        const ownersMap = new Map(owners.map(o => [o.id, o]));
        const projectsMap = new Map(exceptionalProjects.map(p => [p.id, p]));
        
        // FIX: exceptionalOutcomes does not have propertyId.
        // We need to check if its project belongs to the selected property.
        const projectsForPropertyIds = new Set(exceptionalProjects.filter(p => p.propertyId === selectedProperty.id).map(p => p.id));
        
        const manual: UnifiedDocument[] = archivedDocuments
            .filter(d => d.propertyId === selectedProperty.id)
            .map(d => ({
                id: d.id, name: d.name, date: d.uploadDate, year: d.year, source: t('manual_upload'), sourceType: 'manual',
                action: d.fileType.startsWith('image/') ? () => setViewingDoc({name: d.name, url: d.fileUrl}) : () => handleDownload(d),
                canDelete: true, originalDoc: d
            }));

        const regularOutcomes: UnifiedDocument[] = monthlyOutcomes
            .filter(o => o.propertyId === selectedProperty.id && o.photoUrl && o.isConfirmed)
            .map(o => ({
                id: o.id,
                name: t('justification_photo') + ` - ${expenseCategoriesMap.get(o.categoryId) || ''}`,
                date: o.confirmedAt!,
                year: o.year,
                source: t('regular_outcome'),
                sourceType: 'regular_outcome',
                action: () => setViewingDoc({name: o.id, url: o.photoUrl!}),
                canDelete: false
            }));

        const exceptionalOutcomesDocs: UnifiedDocument[] = exceptionalOutcomes
            .filter(o => projectsForPropertyIds.has(o.projectId) && o.photoUrl && o.isConfirmed)
            .map(o => ({
                id: o.id,
                name: t('justification_photo') + ` - ${o.description}`,
                date: o.confirmedAt!,
                year: new Date(o.date).getFullYear(),
                source: t('exceptional_outcome'),
                sourceType: 'exceptional_outcome',
                action: () => setViewingDoc({name: o.id, url: o.photoUrl!}),
                canDelete: false
            }));
            
        const paymentReceipts: UnifiedDocument[] = paymentHistory
            .filter(p => p.propertyId === selectedProperty.id)
            .map(p => ({
                id: p.transactionId,
                name: `${t('payment_receipt')} - ${ownersMap.get(p.ownerId)?.fullName || ''}`,
                date: p.transactionDate,
                year: p.year,
                source: t('payment_receipt'),
                sourceType: 'payment_receipt',
                action: () => setViewingReceipt({ type: 'regular', entry: p, owner: ownersMap.get(p.ownerId) }),
                canDelete: false
            }));

        const contributionReceipts: UnifiedDocument[] = exceptionalPaymentHistory
            .filter(h => projectsForPropertyIds.has(h.projectId))
            .map(h => ({
                id: h.transactionId,
                name: `${t('contribution_receipt')} - ${ownersMap.get(h.contributorId)?.fullName || 'External'}`,
                date: h.transactionDate,
                year: new Date(h.transactionDate).getFullYear(),
                source: t('contribution_receipt'),
                sourceType: 'contribution_receipt',
                action: () => setViewingReceipt({ type: 'exceptional', entry: h, project: projectsMap.get(h.projectId) }),
                canDelete: false
            }));

        return [...manual, ...regularOutcomes, ...exceptionalOutcomesDocs, ...paymentReceipts, ...contributionReceipts];

    }, [selectedProperty, archivedDocuments, monthlyOutcomes, exceptionalOutcomes, paymentHistory, exceptionalPaymentHistory, expenseCategories, owners, exceptionalProjects, t]);

    const filteredAndSortedDocs = useMemo(() => {
        return aggregatedDocuments
            .filter(doc => {
                if (doc.year !== selectedYear) return false;
                if (!searchTerm) return true;
                const lowerSearch = searchTerm.toLowerCase();
                return doc.name.toLowerCase().includes(lowerSearch) || doc.source.toLowerCase().includes(lowerSearch);
            })
            .sort((a, b) => {
                const valA = a[sortConfig.column];
                const valB = b[sortConfig.column];
                let comparison = 0;
                if (sortConfig.column === 'date') {
                    comparison = new Date(b.date).getTime() - new Date(a.date).getTime();
                } else {
                    comparison = String(valA).localeCompare(String(valB));
                }
                return sortConfig.direction === 'desc' ? comparison : -comparison;
            });
    }, [aggregatedDocuments, selectedYear, searchTerm, sortConfig]);

    const handleSort = (column: 'name' | 'date' | 'source') => {
        setSortConfig(prev => ({
            column,
            direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    return (
        <>
            <Card title={t('module_archive')}>
                <div className="flex flex-col md:flex-row gap-4 mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex-1">
                        <label htmlFor="archive-year-select" className="text-sm font-medium">{t('select_year')}</label>
                        <select id="archive-year-select" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="w-full mt-1 px-2 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm">
                            {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                     <div className="flex-1">
                        <label htmlFor="archive-search" className="text-sm font-medium">{t('search_documents')}</label>
                        <input id="archive-search" type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={t('search_documents')} className="w-full mt-1 px-2 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"/>
                    </div>
                    <div className="self-end">
                         <Button onClick={() => setIsUploadModalOpen(true)}>
                            <Icon name="upload" className="h-5 w-5 mr-2" />
                            {t('upload_document')}
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                {[{l: 'document_name', v: 'name'}, {l: 'upload_date', v: 'date'}, {l: 'source', v: 'source'}].map(h => (
                                    <th key={h.v} onClick={() => handleSort(h.v as any)} className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase cursor-pointer">
                                        {t(h.l as any)} {sortConfig.column === h.v && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                                    </th>
                                ))}
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredAndSortedDocs.length > 0 ? filteredAndSortedDocs.map(doc => (
                                <tr key={doc.id}>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{doc.name}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(doc.date).toLocaleDateString(language)}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{doc.source}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm space-x-2">
                                        <Button size="sm" variant="secondary" onClick={doc.action}>{t('view_document')}</Button>
                                        {doc.canDelete && <Button size="sm" variant="danger" onClick={() => setDeletingDoc(doc.originalDoc)}>{t('delete')}</Button>}
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={4} className="text-center py-8 text-gray-500">{t('no_documents_for_year')}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <UploadDocumentModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} defaultYear={selectedYear} />
            {viewingDoc && <DocumentViewerModal isOpen={!!viewingDoc} onClose={() => setViewingDoc(null)} name={viewingDoc.name} fileUrl={viewingDoc.url} />}
            {deletingDoc && <DeleteDocumentModal isOpen={!!deletingDoc} onClose={() => setDeletingDoc(null)} document={deletingDoc} />}
            {viewingReceipt?.type === 'regular' && <ReceiptModal isOpen={true} onClose={() => setViewingReceipt(null)} entry={viewingReceipt.entry} owner={viewingReceipt.owner} />}
            {viewingReceipt?.type === 'exceptional' && <ExceptionalReceiptModal isOpen={true} onClose={() => setViewingReceipt(null)} entry={viewingReceipt.entry} project={viewingReceipt.project} />}
        </>
    );
};

export default Archive;
