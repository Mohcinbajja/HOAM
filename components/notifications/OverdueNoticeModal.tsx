
import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useLanguage } from '../../contexts/LanguageContext';
import { useData } from '../../contexts/DataContext';
import { Owner } from '../../types';
import ReportHeader from '../reports/ReportHeader';
import ReportFooter from '../reports/ReportFooter';
import { printElementById } from '../../lib/exportUtils';
import Icon from '../ui/Icon';

interface OverdueNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targets: Owner[];
}

interface OverdueDetails {
    owner: Owner;
    totalDue: number;
    monthList: string;
}

const OverdueNoticeModal: React.FC<OverdueNoticeModalProps> = ({ isOpen, onClose, targets }) => {
    const { t, language } = useLanguage();
    const { getOverdueDetailsForOwner, selectedProperty, showSuccessMessage } = useData();
    const [overdueData, setOverdueData] = useState<OverdueDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    const currency = selectedProperty?.details.currency || 'USD';
    const formatCurrency = (amount: number) => new Intl.NumberFormat(language, { style: 'currency', currency }).format(amount);

    useEffect(() => {
        if (isOpen && targets.length > 0 && selectedProperty) {
            setIsLoading(true);
            const generatedData: OverdueDetails[] = [];
            
            targets.forEach(target => {
                const details = getOverdueDetailsForOwner(target.id);
                if (details.totalDue > 0) {
                    const monthList = details.months
                        .map(m => t('overdue_month_line_item', {
                            month: new Date(m.year, m.month).toLocaleString(language, { month: 'long' }),
                            year: m.year,
                            amount: formatCurrency(m.amount)
                        }))
                        .join('\n');
                    
                    generatedData.push({ owner: target, totalDue: details.totalDue, monthList });
                }
            });
            setOverdueData(generatedData);
            setIsLoading(false);
        }
    }, [isOpen, targets, selectedProperty, getOverdueDetailsForOwner, t, language, formatCurrency]);

    const handlePrintAll = async () => {
        setIsProcessing(true);
        await printElementById('overdue-notices-container');
        showSuccessMessage(t('notification_sent_success'));
        setIsProcessing(false);
        onClose();
    };

    const handleDownloadAllPdf = async () => {
        setIsProcessing(true);
        try {
            const { jsPDF } = (window as any).jspdf;
            const html2canvas = (window as any).html2canvas;
            if (!jsPDF || !html2canvas) throw new Error("PDF libraries not loaded");

            const pdf = new jsPDF('p', 'mm', 'a4');
            const noticeElements = document.querySelectorAll('.overdue-notice-page');

            for (let i = 0; i < noticeElements.length; i++) {
                const element = noticeElements[i] as HTMLElement;
                const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
                const imgData = canvas.toDataURL('image/jpeg', 0.9);
                
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

                if (i > 0) pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            }
            pdf.save('overdue-notices.pdf');
            showSuccessMessage(t('notification_sent_success'));
        } catch (error) {
            console.error("Error generating PDF:", error);
        } finally {
            setIsProcessing(false);
            onClose();
        }
    };


    const title = t('overdue_notification_preview', { count: overdueData.length });

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="5xl">
            {isLoading ? (
                <div className="text-center p-8">Loading...</div>
            ) : overdueData.length > 0 ? (
                <div className="bg-gray-200 dark:bg-gray-900 -m-6 p-4">
                    <div id="overdue-notices-container" className="max-h-[70vh] overflow-y-auto space-y-4">
                        {overdueData.map(({ owner, totalDue, monthList }, index) => (
                            <div key={owner.id} className="report-page overdue-notice-page">
                                <div className="report-header-group"><ReportHeader /></div>
                                <div className="report-body-group">
                                    <main className="pt-8">
                                        <h1 className="text-2xl font-bold text-center mb-6 dark-text-fix">{t('overdue_email_subject')}</h1>
                                        <p className="dark-text-fix mb-4">{new Date().toLocaleDateString(language, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        <p className="dark-text-fix mb-4">{owner.fullName}<br/>{owner.address}</p>
                                        <p className="whitespace-pre-wrap dark-text-fix">
                                            {t('overdue_email_body', {
                                                ownerName: owner.fullName,
                                                property: selectedProperty!.name,
                                                totalDue: formatCurrency(totalDue),
                                                monthList,
                                                associationName: selectedProperty!.details.associationName || selectedProperty!.name
                                            })}
                                        </p>
                                    </main>
                                </div>
                                <div className="report-footer-group"><ReportFooter /></div>
                            </div>
                        ))}
                    </div>
                     <div className="mt-6 flex justify-end space-x-3 no-print">
                         <Button variant="secondary" onClick={onClose}>{t('cancel')}</Button>
                         <Button onClick={handleDownloadAllPdf} disabled={isProcessing}>
                            <Icon name="pdf" className="h-5 w-5 mr-2" />
                            {isProcessing ? 'Processing...' : t('download_pdf')}
                         </Button>
                        <Button onClick={handlePrintAll} disabled={isProcessing}>
                            <Icon name="print" className="h-5 w-5 mr-2" />
                            {isProcessing ? 'Processing...' : t('send_notifications', { count: overdueData.length })}
                        </Button>
                    </div>
                </div>
            ) : (
                <p className="text-center p-8 text-gray-600 dark:text-gray-300">{t('no_overdue_payments_to_notify')}</p>
            )}
        </Modal>
    );
};

export default OverdueNoticeModal;
