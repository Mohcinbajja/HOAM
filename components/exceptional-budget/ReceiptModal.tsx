
import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { useLanguage } from '../../contexts/LanguageContext';
import { useData } from '../../contexts/DataContext';
import { ExceptionalPaymentHistoryEntry, ExceptionalProject } from '../../types';
import { printElementById } from '../../lib/exportUtils';
import ReportHeader from '../reports/ReportHeader';
import ReportFooter from '../reports/ReportFooter';

interface ReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    entry: ExceptionalPaymentHistoryEntry;
    project: ExceptionalProject;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, entry, project }) => {
    const { t, language } = useLanguage();
    const { selectedProperty, owners, externalContributors } = useData();
    const [isDownloading, setIsDownloading] = useState(false);

    const contributor = React.useMemo(() => {
        if (entry.contributorType === 'owner') {
            return owners.find(o => o.id === entry.contributorId);
        }
        return externalContributors.find(c => c.id === entry.contributorId);
    }, [entry, owners, externalContributors]);


    if (!selectedProperty || !contributor) return null;

    const currency = selectedProperty.details.currency;
    const formatCurrency = (amount: number) => new Intl.NumberFormat(language, { style: 'currency', currency }).format(amount);
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString(language, {
        year: 'numeric', month: 'long', day: 'numeric'
    });
    
    const receiptId = `ex-receipt-${entry.transactionId}`;
    const handlePrint = async () => {
        await printElementById(receiptId);
    };

    const handleDownloadPdf = async () => {
        const reportElement = document.getElementById(receiptId);
        if (!reportElement) return;

        setIsDownloading(true);
        try {
            const html2canvas = (window as any).html2canvas;
            const { jsPDF } = (window as any).jspdf;
            if (!html2canvas || !jsPDF) throw new Error('PDF generation libraries not loaded.');

            const canvas = await html2canvas(reportElement, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/jpeg', 0.9);
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${t('contribution_receipt')}-${contributor.fullName}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert(`Sorry, there was an error generating the PDF.`);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('contribution_receipt')} size="4xl">
            <div className="bg-gray-100 dark:bg-gray-900 -m-6 p-4">
                <div id={receiptId} className="report-page">
                     <div className="report-header-group">
                        <ReportHeader />
                    </div>
                     <div className="report-body-group">
                        <main className="space-y-6">
                            <div className="text-center mt-8 mb-12">
                                <h1 className="text-3xl font-bold uppercase tracking-wider text-gray-800 dark-text-fix">{t('contribution_receipt')}</h1>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="font-semibold text-gray-600 dark-text-fix">{t('receipt_no')}</p>
                                    <p className="text-gray-800 dark-text-fix">{entry.transactionId}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-600 dark-text-fix">{t('date_of_payment')}</p>
                                    <p className="text-gray-800 dark-text-fix">{formatDate(entry.transactionDate)}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-600 dark-text-fix">{t('received_from')}</p>
                                    <p className="text-gray-800 dark-text-fix">{contributor.fullName}</p>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark-text-fix uppercase tracking-wider">{t('payment_for_item')}</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark-text-fix uppercase tracking-wider">{t('amount')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        <tr>
                                            <td className="px-4 py-3 text-sm text-gray-700 dark-text-fix">
                                                {`${t('contribution_from')} "${project.name}"`}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right text-gray-700 dark-text-fix">
                                                {formatCurrency(entry.amountPaid)}
                                            </td>
                                        </tr>
                                    </tbody>
                                    <tfoot className="bg-gray-100">
                                        <tr>
                                            <td className="px-4 py-2 text-right text-sm font-bold text-gray-800 dark-text-fix">{t('total_paid')}</td>
                                            <td className="px-4 py-2 text-right text-sm font-bold text-gray-800 dark-text-fix">{formatCurrency(entry.amountPaid)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </main>
                    </div>
                     <div className="report-footer-group">
                        <ReportFooter />
                    </div>
                </div>
                 <div className="mt-6 flex justify-end space-x-3 no-print">
                    <Button variant="secondary" onClick={onClose}>{t('close')}</Button>
                     <Button onClick={handleDownloadPdf} disabled={isDownloading}>
                         <Icon name="pdf" className="h-5 w-5 mr-2" />
                         {isDownloading ? 'Downloading...' : t('download_pdf')}
                    </Button>
                    <Button onClick={handlePrint} type="button">
                        <Icon name="print" className="h-5 w-5 mr-2" />
                        {t('print')}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ReceiptModal;
