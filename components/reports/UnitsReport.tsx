import React, { useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import ReportFooter from './ReportFooter';
import ReportHeader from './ReportHeader';

interface SortConfig {
  column: string;
  direction: 'asc' | 'desc';
}

interface UnitsReportProps {
    sorts: Record<string, SortConfig>;
}

type UnitRowData = {
    unitCode: string;
    ownershipTitleCode: string;
    unitTypeName: string;
    ownerName: string;
};

const dynamicSort = (data: any[], config: SortConfig | undefined) => {
    if (!config || !config.column) return data;
    
    return [...data].sort((a, b) => {
        const valA = a[config.column as keyof typeof a];
        const valB = b[config.column as keyof typeof b];
        
        let comparison = 0;
        if (typeof valA === 'number' && typeof valB === 'number') {
            comparison = valA - valB;
        } else {
            comparison = String(valA).localeCompare(String(valB));
        }
        
        return config.direction === 'desc' ? comparison * -1 : comparison;
    });
};

const UnitsReport: React.FC<UnitsReportProps> = ({ sorts }) => {
    const { t } = useLanguage();
    const { selectedProperty, units, unitTypes, owners } = useData();

    const sortedUnitTypes = useMemo(() => {
        if (!selectedProperty) return [];
        const propertyUnitTypes = unitTypes.filter(ut => ut.propertyId === selectedProperty.id);
        return dynamicSort(propertyUnitTypes, sorts?.unit_types);
    }, [selectedProperty, unitTypes, sorts]);

    const sortedTableData = useMemo<UnitRowData[]>(() => {
        if (!selectedProperty) return [];
        
        const ownersMap = new Map(owners.map(o => [o.id, o]));
        const unitTypesMap = new Map(unitTypes.map(ut => [ut.id, ut]));

        const mappedData = units
            .filter(u => u.propertyId === selectedProperty.id)
            .map(unit => {
                const owner = ownersMap.get(unit.ownerId);
                const unitType = unitTypesMap.get(unit.unitTypeId);
                return {
                    unitCode: unit.code || 'N/A',
                    ownershipTitleCode: owner?.ownershipTitleCode || 'N/A',
                    unitTypeName: unitType?.name || 'N/A',
                    ownerName: owner?.fullName || 'N/A'
                };
            });
            
        return dynamicSort(mappedData, sorts?.units_list);
    }, [selectedProperty, units, owners, unitTypes, sorts]);

    if (!selectedProperty) {
        return <p>No property selected.</p>;
    }

    return (
        <div id="report_units-report-area" className="report-page">
            <div className="report-header-group">
                <ReportHeader />
            </div>
            <div className="report-body-group">
                <main className="space-y-8">
                    <div className="text-center mt-8 mb-12">
                        <h1 className="text-3xl font-bold uppercase tracking-wider text-gray-800 dark-text-fix">{t('report_units')}</h1>
                    </div>
                    <div className="break-inside-avoid">
                        <h3 className="text-xl font-semibold mb-4 text-gray-700 dark-text-fix">{t('part_one_unit_types')}</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 dark-text-fix uppercase tracking-wider">{t('unit_type_name')}</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 dark-text-fix uppercase tracking-wider">{t('description')}</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 dark-text-fix uppercase tracking-wider">{t('surface_m2')}</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                                    {sortedUnitTypes.map(ut => (
                                        <tr key={ut.id}>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium dark-text-fix">{ut.name}</td>
                                            <td className="px-4 py-2 text-sm dark-text-fix">{ut.description}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-right dark-text-fix">{ut.surface} m²</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                     <div className="break-inside-avoid">
                        <h3 className="text-xl font-semibold mb-4 text-gray-700 dark-text-fix">{t('part_two_units_list')}</h3>
                        <div className="overflow-x-auto">
                           <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 dark-text-fix uppercase tracking-wider">{t('unit_code')}</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 dark-text-fix uppercase tracking-wider">{t('ownership_title_code')}</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 dark-text-fix uppercase tracking-wider">{t('unit_type')}</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 dark-text-fix uppercase tracking-wider">{t('owner')}</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                                    {sortedTableData.map((row, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm dark-text-fix">{row.unitCode}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm dark-text-fix">{row.ownershipTitleCode}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm dark-text-fix">{row.unitTypeName}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm dark-text-fix">{row.ownerName}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
            <div className="report-footer-group">
                <ReportFooter />
            </div>
        </div>
    );
};

export default UnitsReport;