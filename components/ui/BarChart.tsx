import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import Card from './Card';

interface BarChartProps {
    title: string;
    data: { label: string; value: number }[];
}

const BarChart: React.FC<BarChartProps> = ({ title, data }) => {
    const { language } = useLanguage();

    const maxValue = React.useMemo(() => {
        if (data.length === 0) return 1;
        const max = Math.max(...data.map(d => d.value));
        return max === 0 ? 1 : max;
    }, [data]);
    
    const formatCurrency = (amount: number) => new Intl.NumberFormat(language, { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

    return (
        <Card title={title}>
            <div className="w-full h-64 flex items-end justify-around space-x-4 pt-4 border-b border-gray-200 dark:border-gray-700">
                {data.map(({ label, value }) => {
                    const barHeight = `${(value / maxValue) * 100}%`;

                    return (
                        <div key={label} className="flex-1 flex flex-col items-center h-full group">
                            <div
                                className="w-full bg-blue-500 rounded-t-md hover:bg-blue-600 transition-colors"
                                style={{ height: barHeight, minHeight: '2px' }}
                                title={`${label}: ${formatCurrency(value)}`}
                            >
                                <div className="absolute -mt-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded py-1 px-2 pointer-events-none whitespace-nowrap">
                                    {formatCurrency(value)}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
             <div className="w-full flex justify-around space-x-4 mt-2">
                {data.map(({ label }) => (
                     <div key={label} className="flex-1 text-center text-sm text-gray-600 dark:text-gray-400 font-medium">
                        {label}
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default BarChart;