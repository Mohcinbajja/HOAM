import React, { useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Icon from '../ui/Icon';
import ReportFooter from './ReportFooter';
import ReportHeader from './ReportHeader';

interface SortConfig {
  column: string;
  direction: 'asc' | 'desc';
}

interface CommitteeReportProps {
    sortConfig: SortConfig;
}

type CommitteeRowData = {
    photoUrl?: string;
    fullName: string;
    position: string;
    phone: string;
    email: string;
};

const CommitteeReport: React.FC<CommitteeReportProps> = ({ sortConfig }) => {
    const { t } = useLanguage();
    const { selectedProperty, committeeMembers, owners } = useData();
    
    const sortedData = useMemo<CommitteeRowData[]>(() => {
        if (!selectedProperty) return [];
        
        const ownersMap = new Map(owners.map(o => [o.id, o]));

        const data = committeeMembers
            .filter(cm => cm.propertyId === selectedProperty.id)
            .map(member => {
                const owner = member.ownerId ? ownersMap.get(member.ownerId) : null;
                return {
                    photoUrl: member.photoUrl,
                    fullName: member.fullName,
                    position: member.position,
                    phone: owner?.phone || 'N/A',
                    email: owner?.email || 'N/A',
                };
            });
        
        if (sortConfig && sortConfig.column) {
            return [...data].sort((a, b) => {
                const valA = a[sortConfig.column as keyof CommitteeRowData];
                const valB = b[sortConfig.column as keyof CommitteeRowData];
                const comparison = String(valA).localeCompare(String(valB));
                return sortConfig.direction === 'desc' ? -comparison : comparison;
            });
        }
            
        return data.sort((a,b) => a.fullName.localeCompare(b.fullName));
    }, [selectedProperty, committeeMembers, owners, sortConfig]);
    
    if (!selectedProperty) return null;

    return (
        <div id="report_committee-report-area" className="report-page report-landscape">
            <div className="report-header-group">
                <ReportHeader />
            </div>
            <div className="report-body-group">
                <main className="space-y-8">
                     <div className="text-center mt-8 mb-12">
                        <h1 className="text-3xl font-bold uppercase tracking-wider text-gray-800 dark-text-fix">{t('report_committee')}</h1>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                            <thead className="bg-gray-100 dark:bg-gray-700">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 dark-text-fix uppercase tracking-wider">{t('photo')}</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 dark-text-fix uppercase tracking-wider">{t('full_name')}</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 dark-text-fix uppercase tracking-wider">{t('position')}</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 dark-text-fix uppercase tracking-wider">{t('phone_number')}</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 dark-text-fix uppercase tracking-wider">{t('email_address')}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                                {sortedData.map((row, index) => (
                                    <tr key={index}>
                                        <td className="px-4 py-2">
                                            {row.photoUrl ? (
                                                <img src={row.photoUrl} alt={row.fullName} className="h-10 w-10 rounded-full object-cover" />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                                                    <Icon name="owners" className="h-5 w-5 text-gray-400" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm dark-text-fix">{row.fullName}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm dark-text-fix">{row.position}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm dark-text-fix">{row.phone}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm dark-text-fix">{row.email}</td>
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
export default CommitteeReport;