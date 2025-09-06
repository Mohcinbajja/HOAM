import React from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import PropertyIcon from '../property/PropertyIcon';
import { getCountryByCode } from '../../lib/countries';

const ReportHeader: React.FC = () => {
    const { t, language } = useLanguage();
    const { selectedProperty } = useData();

    if (!selectedProperty) {
        return null;
    }

    const { details } = selectedProperty;
    const countryName = getCountryByCode(details.country)?.name || details.country;
    const locationParts = [details.zipCode, details.city].filter(Boolean).join(' ');
    const locationString = [locationParts, countryName].filter(Boolean).join(', ');

    const formattedDate = new Date().toLocaleDateString(language, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <header className="pb-4 border-b border-gray-300">
            <table style={{ width: '100%' }}>
                <tbody>
                    <tr>
                        <td style={{ verticalAlign: 'top' }}>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 dark-text-fix">{details.associationName || selectedProperty.name}</h2>
                                {details.address && <p className="text-sm text-gray-600 dark-text-fix">{details.address}</p>}
                                {locationString && <p className="text-sm text-gray-600 dark-text-fix">{locationString}</p>}
                                <div className="text-xs text-gray-500 dark-text-fix mt-2 space-y-0.5">
                                    {details.phone && <p><span className="font-semibold">{t('phone')}:</span> {details.phone}</p>}
                                    {details.email && <p><span className="font-semibold">{t('email')}:</span> {details.email}</p>}
                                    {details.url && <p><span className="font-semibold">{t('url')}:</span> {details.url}</p>}
                                </div>
                            </div>
                        </td>
                        <td style={{ width: '6rem', verticalAlign: 'top', textAlign: 'right' }}>
                            <div className="w-24 h-24 inline-block">
                                <PropertyIcon details={details} className="w-full h-full text-gray-700 dark-text-fix" />
                            </div>
                        </td>
                    </tr>
                    {/* New row for City and Date */}
                    <tr>
                        <td style={{ paddingTop: '0.5rem' }}>
                            <span className="text-sm font-semibold dark-text-fix">{details.city || ''}</span>
                        </td>
                        <td style={{ paddingTop: '0.5rem', textAlign: 'right' }}>
                             <span className="text-sm font-semibold dark-text-fix">{formattedDate}</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </header>
    );
};

export default ReportHeader;