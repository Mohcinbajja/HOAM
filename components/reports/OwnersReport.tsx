import React, { useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import ReportFooter from './ReportFooter';
import ReportHeader from './ReportHeader';

interface SortConfig {
  column: string;
  direction: 'asc' | 'desc';
}

interface OwnersReportProps {
    sortConfig: SortConfig;
}

type OwnerRowData = {
    fullName: string;
    address: string;
    phone: string;
    email: string;
    unitType: string;
    unitCode: string;
    ownershipTitle: string;
};

const OwnersReport: React.FC<OwnersReportProps> = ({ sortConfig }) => {
    const { t } = useLanguage();
    const { selectedProperty, owners, units, unitTypes } = useData();

    const sortedData = useMemo<OwnerRowData[]>(() => {
        if (!selectedProperty) return [];
        
        const ownersMap = new Map(owners.map(o => [o.id, o]));
        const unitTypesMap = new Map(unitTypes.map(ut => [ut.id, ut]));

        const data = units
            .filter(u => u.propertyId === selectedProperty.id)
            .map(unit => {
                const owner = ownersMap.get(unit.ownerId);
                const unitType = unitTypesMap.get(unit.unitTypeId);
                return {
                    fullName: owner?.fullName || 'N/A',
                    address: owner?.address || '',
                    phone: owner?.phone || '',
                    email: owner?.email || '',
                    unitType: unitType?.name || 'N/A',
                    unitCode: unit.code || 'N/A',
                    ownershipTitle: owner?.ownershipTitleCode || 'N/A'
                };
            });
            
        if (sortConfig && sortConfig.column) {
            return [...data].sort((a, b) => {
                const valA = a[sortConfig.column as keyof OwnerRowData];
                const valB = b[sortConfig.column as keyof OwnerRowData];
                const comparison = String(valA).localeCompare(String(valB));
                return sortConfig.direction === 'desc' ? -comparison : comparison;
            });
        }
        
        return data.sort((a,b) => a.fullName.localeCompare(b.fullName));

    }, [selectedProperty, units, owners, unitTypes, sortConfig]);
    
    if (!selectedProperty) return null;

    return (
        <div id="report_owners-report-area" className="report-page report-landscape">
            <div className="report-header-group">
                <ReportHeader />
            </div>
            <div className="report-body-group">
                <main className="space-y-8">
                     <div className="text-center mt-8 mb-12">
                        <h1 className="text-3xl font-bold uppercase tracking-wider text-gray-800 dark-text-fix">{t('report_owners')}</h1>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                            <thead className="bg-gray-100 dark:bg-gray-700">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 dark-text-fix uppercase tracking-wider">{t('full_name')}</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 dark-text-fix uppercase tracking-wider">{t('address')}</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 dark-text-fix uppercase tracking-wider">{t('phone_number')}</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 dark-text-fix uppercase tracking-wider">{t('email_address')}</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 dark-text-fix uppercase tracking-wider">{t('unit_type')}</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 dark-text-fix uppercase tracking-wider">{t('unit_code')}</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 dark-text-fix uppercase tracking-wider">{t('ownership_title_code')}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                                {sortedData.map((row, index) => (
                                    <tr key={index}>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm dark-text-fix">{row.fullName}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm dark-text-fix">{row.address}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm dark-text-fix">{row.phone}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm dark-text-fix">{row.email}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm dark-text-fix">{row.unitType}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm dark-text-fix">{row.unitCode}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm dark-text-fix">{row.ownershipTitle}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
            <div className="report-footer-group">
                <ReportFooter />
            </div>
        </div>
    );
};
export default OwnersReport;