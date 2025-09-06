import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useData } from '../../contexts/DataContext';
// FIX: Corrected import path for printElementById.
import { printElementById } from '../../lib/exportUtils';
import { TranslationKey } from '../../lib/translations';

// Report Components
import ReportPlaceholder from '../reports/ReportPlaceholder';
import OwnerAnnualSummary from '../reports/OwnerAnnualSummary';
import PropertyReport from '../reports/PropertyReport';
import UnitsReport from '../reports/UnitsReport';
import OwnersReport from '../reports/OwnersReport';
import CommitteeReport from '../reports/CommitteeReport';
import Button from '../ui/Button';
import Icon from '../ui/Icon';

interface SortConfig {
  column: string;
  direction: 'asc' | 'desc';
}

interface ReportPageProps {
    reportKey: string;
    year?: number | null;
    ownerId?: string | null;
}

const sortableColumnsConfig: Record<string, Record<string, { labelKey: TranslationKey; value: string }[]>> = {
    'report_units': {
        unit_types: [
            { labelKey: 'unit_type_name', value: 'name' },
            { labelKey: 'description', value: 'description' },
            { labelKey: 'surface_m2', value: 'surface' },
        ],
        units_list: [
            { labelKey: 'unit_code', value: 'unitCode' },
            { labelKey: 'ownership_title_code', value: 'ownershipTitleCode' },
            { labelKey: 'unit_type', value: 'unitTypeName' },
            { labelKey: 'owner', value: 'ownerName' },
        ],
    },
    'report_owners': {
        main: [
            { labelKey: 'full_name', value: 'fullName' },
            { labelKey: 'address', value: 'address' },
            { labelKey: 'unit_code', value: 'unitCode' },
            { labelKey: 'unit_type', value: 'unitType' },
        ]
    },
    'report_committee': {
        main: [
            { labelKey: 'full_name', value: 'fullName' },
            { labelKey: 'position', value: 'position' },
        ]
    },
    'report_owner_annual_summary': {
        regular: [
            { labelKey: 'month', value: 'month' },
            { labelKey: 'amount_paid', value: 'amountPaid' },
            { labelKey: 'status', value: 'status' },
        ],
        exceptional: [
            { labelKey: 'project', value: 'projectName' },
            { labelKey: 'expected_amount', value: 'expectedAmount' },
            { labelKey: 'paid_amount', value: 'paidAmount' },
            { labelKey: 'status', value: 'status' },
        ]
    }
};

const ReportPage: React.FC<ReportPageProps> = ({ reportKey, year, ownerId }) => {
    const { t } = useLanguage();
    const { owners, selectedProperty } = useData();

    const [sorts, setSorts] = useState<Record<string, SortConfig>>({});
    const [isDownloading, setIsDownloading] = useState(false);

    // Initialize default sorting state when report type changes
    useEffect(() => {
        const defaultConfig: Record<string, SortConfig> = {};
        const reportConfig = sortableColumnsConfig[reportKey];
        if (reportConfig) {
            Object.keys(reportConfig).forEach(tableKey => {
                defaultConfig[tableKey] = {
                    column: reportConfig[tableKey][0].value,
                    direction: 'asc',
                };
            });
        }
        setSorts(defaultConfig);
    }, [reportKey]);

    const getReportElementId = () => `${reportKey}-report-area`;

    const handlePrint = async () => {
        await printElementById(getReportElementId());
    };

    const handleDownloadPdf = async () => {
        const reportElement = document.getElementById(getReportElementId());
        if (!reportElement) return;

        // Temporarily remove margin for accurate capture
        const originalMargin = reportElement.style.margin;
        reportElement.style.margin = '0 auto';

        setIsDownloading(true);
        try {
            const html2canvas = (window as any).html2canvas?.default || (window as any).html2canvas;
            const jsPDF = (window as any).jspdf?.jsPDF;
    
            if (!html2canvas || !jsPDF) {
                throw new Error('PDF generation libraries (html2canvas, jspdf) not found on window object.');
            }
    
            const canvas = await html2canvas(reportElement, {
                scale: 2, // Higher scale for better quality
                useCORS: true,
                backgroundColor: '#ffffff', // Force white background
            });
            
            // Use JPEG for smaller file size; quality 0.9 is a good balance.
            const imgData = canvas.toDataURL('image/jpeg', 0.9);
            
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4'
            });
    
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasAspectRatio = canvas.height / canvas.width;
    
            // Calculate the width and height of the image on the PDF to fit and maintain aspect ratio
            let finalImgWidth = pdfWidth;
            let finalImgHeight = pdfWidth * canvasAspectRatio;
    
            // If the image is taller than the page, scale it down to fit the page height
            if (finalImgHeight > pdfHeight) {
                finalImgHeight = pdfHeight;
                finalImgWidth = pdfHeight / canvasAspectRatio;
            }
    
            // Center the image horizontally on the page
            const xOffset = (pdfWidth - finalImgWidth) / 2;
            
            // Add only one page, scaled to fit. This prevents the blank page issue.
            pdf.addImage(imgData, 'JPEG', xOffset, 0, finalImgWidth, finalImgHeight);
            
            pdf.save(`${reportKey}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert(`Sorry, there was an error generating the PDF. The required libraries might not have loaded correctly.`);
        } finally {
            // Restore original styles
            reportElement.style.margin = originalMargin;
            setIsDownloading(false);
        }
    };
    
    const handleSortChange = (tableKey: string, partialConfig: Partial<SortConfig>) => {
        setSorts(prev => ({
            ...prev,
            [tableKey]: {
                ...prev[tableKey],
                ...partialConfig,
            }
        }));
    };

    const renderReport = () => {
        if (!selectedProperty) {
            return <div className="p-8 text-center">Loading Property Data...</div>;
        }

        switch (reportKey) {
            case 'report_property':
                return <PropertyReport />;
            case 'report_units':
                return <UnitsReport sorts={sorts} />;
            case 'report_owners':
                return <OwnersReport sortConfig={sorts['main']} />;
            case 'report_committee':
                return <CommitteeReport sortConfig={sorts['main']} />;
            case 'report_owner_annual_summary':
                const selectedYear = year ? Number(year) : null;
                const selectedOwner = owners.find(o => o.id === ownerId);
                if (!selectedYear || !selectedOwner) {
                    return <div className="p-8 text-center">{t('select_owner_to_continue')}</div>;
                }
                return <OwnerAnnualSummary selectedYear={selectedYear} selectedOwner={selectedOwner} sorts={sorts} />;
            default:
                return <ReportPlaceholder title={t(reportKey as any)} />;
        }
    };

    const currentReportSortConfig = sortableColumnsConfig[reportKey];
    const selectClasses = "px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";

    return (
        <div>
             {currentReportSortConfig && (
                <div className="p-4 mb-4 bg-gray-50 dark:bg-gray-700 rounded-lg no-print space-y-4 border border-gray-200 dark:border-gray-600">
                    {Object.entries(currentReportSortConfig).map(([tableKey, columns]) => (
                        <div key={tableKey}>
                            <h4 className="text-sm font-semibold mb-2">{t('sort_table_by', {tableName: t(tableKey as TranslationKey)})}</h4>
                            <div className="flex flex-col sm:flex-row gap-4 items-end">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">{t('sort_by')}</label>
                                    <select
                                        value={sorts[tableKey]?.column || ''}
                                        onChange={e => handleSortChange(tableKey, { column: e.target.value })}
                                        className={`${selectClasses} w-full mt-1`}
                                    >
                                        {columns.map(col => <option key={col.value} value={col.value}>{t(col.labelKey)}</option>)}
                                    </select>
                                </div>
                                <div className="flex items-center space-x-1 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
                                    <button
                                        onClick={() => handleSortChange(tableKey, { direction: 'asc' })}
                                        className={`p-2 rounded-md ${sorts[tableKey]?.direction === 'asc' ? 'bg-white dark:bg-gray-800 shadow' : 'hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                                        title={t('ascending')}
                                    >
                                       <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                    </button>
                                    <button
                                        onClick={() => handleSortChange(tableKey, { direction: 'desc' })}
                                        className={`p-2 rounded-md ${sorts[tableKey]?.direction === 'desc' ? 'bg-white dark:bg-gray-800 shadow' : 'hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                                        title={t('descending')}
                                    >
                                       <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-end items-center mb-4 no-print gap-3">
                <Button variant="secondary" onClick={handleDownloadPdf} disabled={isDownloading}>
                    {isDownloading ? (
                        <>
                           <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                           Downloading...
                        </>
                    ) : (
                        <>
                           <Icon name="pdf" className="h-5 w-5 mr-2"/>
                           {t('download_pdf')}
                        </>
                    )}
                </Button>
                <Button onClick={handlePrint}>
                    <Icon name="print" className="h-5 w-5 mr-2"/>
                    {t('print_report')}
                </Button>
            </div>

            <div>
                {renderReport()}
            </div>
        </div>
    );
};

export default ReportPage;
