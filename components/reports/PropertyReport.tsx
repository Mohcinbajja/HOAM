
import React from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getCountryByCode } from '../../lib/countries';
import ReportFooter from './ReportFooter';
import ReportHeader from './ReportHeader';

const ReportField: React.FC<{ label: string; value: React.ReactNode; className?: string }> = ({ label, value, className = '' }) => {
    // Also handle empty strings
    if (value === null || value === undefined || value === '') return null;
    return (
        <div className={`py-2 break-inside-avoid ${className}`}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider dark-text-fix">{label}</p>
            <p className="text-base text-gray-800 dark-text-fix break-words">{value}</p>
        </div>
    );
};

const PropertyReport: React.FC = () => {
    const { t, language } = useLanguage();
    const { selectedProperty } = useData();

    if (!selectedProperty) {
        return <p>No property selected.</p>;
    }

    const { name, details } = selectedProperty;
    const countryName = getCountryByCode(details.country)?.name || details.country;

    const mapAvailable = details.latitude != null && details.longitude != null;
    // FIX: Switched to a more reliable static map service with a built-in marker to prevent broken image issues.
    // Zoom level changed from 15 to 11 to show more context and place names.
    const staticMapUrl = mapAvailable
        ? `https://static-maps.yandex.ru/1.x/?ll=${details.longitude},${details.latitude}&z=11&l=map&size=600,300&pt=${details.longitude},${details.latitude},pm2rdl`
        : null;

    return (
        <div id="report_property-report-area" className="report-page">
            <div className="report-header-group">
                <ReportHeader />
            </div>
            <div className="report-body-group">
                <main>
                    <div className="text-center mt-8 mb-12">
                        <h1 className="text-3xl font-bold uppercase tracking-wider text-gray-800 dark-text-fix">{t('report_property')}</h1>
                    </div>
                    <div className="space-y-6">
                        {/* Fields in a two-column grid */}
                        <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                            {/* Name and Location */}
                            <ReportField label={t('property_name')} value={name} className="col-span-2" />
                            <ReportField label={t('address')} value={details.address} className="col-span-2" />
                            <ReportField label={t('country')} value={countryName} />
                            <ReportField label={t('city')} value={details.city} />
                            <ReportField label={t('zip_code')} value={details.zipCode} />
                        </div>

                        {/* Map Location */}
                        {mapAvailable && staticMapUrl && (
                            <div className="pt-6 break-inside-avoid">
                                <h3 className="text-xl font-semibold mb-4 text-gray-700 dark-text-fix">{t('map_location')}</h3>
                                <div className="border border-gray-300 rounded-lg overflow-hidden">
                                    <img src={staticMapUrl} alt={t('map_location')} style={{ width: '100%', display: 'block' }} />
                                </div>
                                <div className="grid grid-cols-2 gap-x-12 mt-4">
                                    <ReportField label={t('latitude')} value={details.latitude} />
                                    <ReportField label={t('longitude')} value={details.longitude} />
                                </div>
                            </div>
                        )}

                        {/* Fields continued */}
                         <div className="grid grid-cols-2 gap-x-12 gap-y-4 pt-6">
                            {/* Administrative Info */}
                            <ReportField label={t('construction_date')} value={new Date(details.constructionDate).toLocaleDateString(language)} />
                            <ReportField label={t('currency')} value={details.currency} />
                            <ReportField label={t('ownership_title')} value={details.ownershipTitle} />
                            <ReportField label={t('association_name')} value={details.associationName} />

                             {/* Branding */}
                            <ReportField label={t('url')} value={details.url} />
                            <ReportField label={t('email')} value={details.email} />
                            <ReportField label={t('phone')} value={details.phone} />
                            
                            {/* Totals */}
                            <ReportField label={t('total_units')} value={details.totalUnits} />
                            <ReportField label={t('total_members')} value={details.totalMembers} />
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

export default PropertyReport;
