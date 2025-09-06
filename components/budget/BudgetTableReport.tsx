
import React from 'react';
import ReportHeader from '../reports/ReportHeader';
import ReportFooter from '../reports/ReportFooter';

interface BudgetTableReportProps {
    id: string;
    title: string;
    headers: string[];
    rows: (string | number)[][];
    footer: (string | number)[][];
}

const BudgetTableReport: React.FC<BudgetTableReportProps> = ({ id, title, headers, rows, footer }) => {
    return (
        <div style={{ position: 'absolute', left: '-9999px', top: 'auto', pointerEvents: 'none', opacity: 0 }}>
            <div id={id} className="report-page report-landscape bg-white text-black">
                <div className="report-header-group">
                    <ReportHeader />
                </div>
                <div className="report-body-group">
                    <main>
                        <div className="text-center mt-8 mb-12">
                            <h1 className="text-3xl font-bold uppercase tracking-wider text-gray-800 dark-text-fix">{title}</h1>
                        </div>
                        <table className="min-w-full text-xs" style={{ borderCollapse: 'collapse' }}>
                            <thead className="bg-gray-100">
                                <tr>
                                    {headers.map((h, i) => (
                                        <th key={i} className={`p-1 dark-text-fix border border-gray-300 ${i === 0 ? 'text-left' : 'text-center'}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, i) => (
                                    <tr key={i} className="border-b border-gray-200">
                                        {row.map((cell, j) => (
                                            <td key={j} className={`p-1 dark-text-fix border border-gray-300 ${j === 0 ? 'text-left font-semibold' : 'text-center'}`}>{cell}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-100 font-bold">
                                {footer.map((footerRow, i) => (
                                     <tr key={i}>
                                        {footerRow.map((f, j) => (
                                            <td key={j} className={`p-1 dark-text-fix border border-gray-300 ${j === 0 ? 'text-left' : 'text-center'}`}>{f}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tfoot>
                        </table>
                    </main>
                </div>
                <div className="report-footer-group">
                    <ReportFooter />
                </div>
            </div>
        </div>
    );
};

export default BudgetTableReport;
