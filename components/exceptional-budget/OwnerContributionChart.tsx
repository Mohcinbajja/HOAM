import React, { useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { ExceptionalProject } from '../../types';
import Card from '../ui/Card';

interface OwnerContributionChartProps {
    project: ExceptionalProject;
}

const OwnerContributionChart: React.FC<OwnerContributionChartProps> = ({ project }) => {
    const { t } = useLanguage();
    const { owners, exceptionalContributions } = useData();

    const chartData = useMemo(() => {
        const ownersMap = new Map(owners.map(o => [o.id, o]));
        return exceptionalContributions
            .filter(c => c.projectId === project.id && c.expectedAmount > 0)
            .map(c => {
                const owner = ownersMap.get(c.ownerId);
                const percentage = (c.paidAmount / c.expectedAmount) * 100;
                return {
                    name: owner?.fullName || 'Unknown',
                    percentage: Math.min(percentage, 100), // Cap at 100%
                };
            })
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [project.id, exceptionalContributions, owners]);

    if (chartData.length === 0) {
        return null;
    }

    const getBarColor = (percentage: number) => {
        if (percentage <= 0) {
            return 'bg-red-500';
        }
        return 'bg-green-500';
    };

    return (
        <Card title={t('owner_contribution_status')}>
            <div className="space-y-3 pr-4" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {chartData.map(({ name, percentage }) => (
                    <div key={name} className="flex items-center group">
                        <div className="w-1/3 text-sm font-medium text-gray-700 dark:text-gray-300 truncate pr-2" title={name}>
                            {name}
                        </div>
                        <div className="w-2/3">
                            <div className="flex items-center">
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-5 relative overflow-hidden">
                                    <div
                                        className={`${getBarColor(percentage)} h-5 rounded-full transition-all duration-500 ease-out`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <span className="ml-3 text-sm font-semibold text-gray-800 dark:text-gray-100 whitespace-nowrap w-16 text-right">
                                    {percentage.toFixed(0)}%
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default OwnerContributionChart;
