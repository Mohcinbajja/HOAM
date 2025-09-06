import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { countries, getCountryByCode } from '../../lib/countries';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { LogoDisplay } from '../ui/PredefinedLogos';
import LogoSelectionModal from '../property/LogoSelectionModal';
import { PropertyDetails as PropertyDetailsType } from '../../types';
import Map from '../ui/Map';
import Card from '../ui/Card';

const InputGroup: React.FC<{ label: string; htmlFor: string; children: React.ReactNode; className?: string }> = ({ label, htmlFor, children, className = '' }) => (
    <div className={className}>
        <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
        </label>
        <div className="mt-1">
            {children}
        </div>
    </div>
);

const PropertyDetails: React.FC = () => {
    const { 
        selectedProperty, 
        editProperty, 
        updatePropertyDetails,
        setHasUnsavedChanges,
        registerActions,
        unregisterActions,
        showSuccessMessage,
    } = useData();
    const { t } = useLanguage();
    
    const [name, setName] = useState(selectedProperty?.name || '');
    const [details, setDetails] = useState<PropertyDetailsType>(selectedProperty!.details);
    const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Map view state
    const [mapCenter, setMapCenter] = useState<[number, number]>([20, 0]);
    const [mapZoom, setMapZoom] = useState<number>(2);

    // City autocomplete state
    const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
    const [showCitySuggestions, setShowCitySuggestions] = useState(false);

    const originalState = useRef({ name: selectedProperty?.name || '', details: selectedProperty!.details });

    useEffect(() => {
        if (selectedProperty) {
            const currentDetails = { name: selectedProperty.name, details: selectedProperty.details };
            setName(currentDetails.name);
            setDetails(currentDetails.details);
            originalState.current = JSON.parse(JSON.stringify(currentDetails)); // Deep copy for comparison
             setHasUnsavedChanges(false);
        }
    }, [selectedProperty, setHasUnsavedChanges]);
    
    // Set initial map view when property changes
    useEffect(() => {
        if (selectedProperty) {
            const initialDetails = selectedProperty.details;
            const markerPos: [number, number] | null = initialDetails.latitude != null && initialDetails.longitude != null ? [initialDetails.latitude, initialDetails.longitude] : null;
            const countryData = getCountryByCode(initialDetails.country);
            const cityData = countryData?.cities?.find(c => c.name.toLowerCase() === initialDetails.city.toLowerCase());

            const center: [number, number] = markerPos 
                ? markerPos 
                : cityData ? [cityData.lat, cityData.lon]
                : countryData ? [countryData.lat, countryData.lon]
                : [20, 0];
            
            const zoom = markerPos ? 13 : (cityData ? 10 : (countryData ? 5 : 2));

            setMapCenter(center);
            setMapZoom(zoom);
        }
    }, [selectedProperty]);

    useEffect(() => {
        const isDirty = name !== originalState.current.name || JSON.stringify(details) !== JSON.stringify(originalState.current.details);
        setHasUnsavedChanges(isDirty);
    }, [name, details, setHasUnsavedChanges]);
    
    const handleSave = useCallback(async () => {
        if (!selectedProperty) return;
        if (name.trim() !== selectedProperty.name) {
            editProperty(selectedProperty.id, name.trim());
        }
        updatePropertyDetails(selectedProperty.id, details);
        
        const newState = { name, details };
        originalState.current = JSON.parse(JSON.stringify(newState)); // Update original state
        setHasUnsavedChanges(false);
        showSuccessMessage(t('changes_saved_success'));
    }, [details, editProperty, name, selectedProperty, showSuccessMessage, t, updatePropertyDetails, setHasUnsavedChanges]);

    const handleDiscard = useCallback(() => {
        setName(originalState.current.name);
        setDetails(originalState.current.details);
        setHasUnsavedChanges(false);
    }, [setHasUnsavedChanges]);

    useEffect(() => {
        registerActions(handleSave, handleDiscard);
        return () => {
            unregisterActions();
            setHasUnsavedChanges(false);
        };
    }, [registerActions, unregisterActions, handleSave, handleDiscard, setHasUnsavedChanges]);


    if (!selectedProperty) {
        return null;
    }

    const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
    
        let newValue: string | number | null = value;
        if (name === 'latitude' || name === 'longitude') {
            newValue = value === '' ? null : parseFloat(value);
        } else if (name === 'budgetFutureYears') {
            const parsedValue = parseInt(value, 10);
            newValue = isNaN(parsedValue) ? 1 : Math.max(1, Math.min(20, parsedValue));
        }
    
        setDetails(prev => ({ ...prev, [name]: newValue as any }));

        if (name === 'city') {
            const countryData = getCountryByCode(details.country);
            if (countryData?.cities && value) {
                const suggestions = countryData.cities
                    .map(c => c.name)
                    .filter(cityName =>
                        cityName.toLowerCase().includes(value.toLowerCase())
                    )
                    .slice(0, 10); // Limit to 10 suggestions
                setCitySuggestions(suggestions);
                setShowCitySuggestions(true); // Show suggestions when typing
            } else {
                setCitySuggestions([]);
                setShowCitySuggestions(false); // Hide if input is empty
            }
        }
    };

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const countryCode = e.target.value;
        const countryData = getCountryByCode(countryCode);
        setDetails(prev => ({
            ...prev,
            country: countryCode,
            city: '', // Clear city when country changes
            currency: countryData ? countryData.currency.code : '',
            latitude: null, // Also clear precise location
            longitude: null,
        }));
        setCitySuggestions([]);
        setShowCitySuggestions(false);
        if (countryData) {
            setMapCenter([countryData.lat, countryData.lon]);
            setMapZoom(5);
        }
    };

    const handleCitySelect = (cityName: string) => {
        setDetails(prev => ({ ...prev, city: cityName }));
        setCitySuggestions([]);
        setShowCitySuggestions(false);
        
        const countryData = getCountryByCode(details.country);
        const cityData = countryData?.cities?.find(c => c.name.toLowerCase() === cityName.toLowerCase());
        if (cityData) {
            setMapCenter([cityData.lat, cityData.lon]);
            setMapZoom(10);
        }
    };
    
    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setDetails(prev => ({
                    ...prev,
                    customLogo: reader.result as string,
                    logoUrl: '', // Clear predefined logo
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSelectLogo = (logoKey: string) => {
        setDetails(prev => ({...prev, logoUrl: logoKey, customLogo: ''}));
        setIsLogoModalOpen(false);
    }

    const handleMapClick = (latlng: { lat: number; lng: number }) => {
        setDetails(prev => ({
            ...prev,
            latitude: latlng.lat,
            longitude: latlng.lng,
        }));
        setMapCenter([latlng.lat, latlng.lng]);
        setMapZoom(prevZoom => Math.max(prevZoom, 13));
    };

    const handleLocate = () => {
        if (details.latitude != null && details.longitude != null && !isNaN(details.latitude) && !isNaN(details.longitude)) {
            const newCenter: [number, number] = [details.latitude, details.longitude];
            setMapCenter(newCenter);
            setMapZoom(16); // Zoom in close
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSave();
    };
    
    const today = new Date().toISOString().split('T')[0];

    const markerPosition: [number, number] | null =
        details.latitude != null && details.longitude != null && !isNaN(details.latitude) && !isNaN(details.longitude)
            ? [details.latitude, details.longitude]
            : null;

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-8">
                <Card title={t('name_and_location')}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label={t('property_name')} htmlFor="property-name" className="md:col-span-2">
                             <input type="text" id="property-name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </InputGroup>
                        <InputGroup label={t('address')} htmlFor="address" className="md:col-span-2">
                            <input type="text" id="address" name="address" value={details.address} onChange={handleDetailsChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </InputGroup>
                        <InputGroup label={t('country')} htmlFor="country">
                            <select id="country" name="country" value={details.country} onChange={handleCountryChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                <option value="">{t('select_country')}</option>
                                {countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                            </select>
                        </InputGroup>
                        <InputGroup label={t('city')} htmlFor="city">
                            <div className="relative">
                                <input 
                                    type="text" 
                                    id="city" 
                                    name="city" 
                                    value={details.city} 
                                    onChange={handleDetailsChange}
                                    onFocus={() => setShowCitySuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
                                    autoComplete="off"
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                                {showCitySuggestions && citySuggestions.length > 0 && (
                                    <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                                        {citySuggestions.map((suggestion, index) => (
                                            <li
                                                key={index}
                                                className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                                onMouseDown={() => handleCitySelect(suggestion)}
                                            >
                                                {suggestion}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </InputGroup>
                        <InputGroup label={t('zip_code')} htmlFor="zip-code" className="md:col-span-2">
                            <input type="text" id="zip-code" name="zipCode" value={details.zipCode} onChange={handleDetailsChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </InputGroup>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('map_location')}</label>
                            <div className="mt-1 h-64 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
                                <Map 
                                    center={mapCenter} 
                                    zoom={mapZoom} 
                                    markerPosition={markerPosition}
                                    onMapClick={handleMapClick}
                                />
                            </div>
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-5 gap-2 items-end">
                                <div className="sm:col-span-2">
                                    <label htmlFor="latitude" className="block text-xs font-medium text-gray-600 dark:text-gray-300">{t('latitude')}</label>
                                    <input 
                                        type="number" 
                                        id="latitude" 
                                        name="latitude" 
                                        value={details.latitude ?? ''} 
                                        onChange={handleDetailsChange}
                                        step="any"
                                        className="mt-1 block w-full text-sm px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="e.g. 40.7128"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label htmlFor="longitude" className="block text-xs font-medium text-gray-600 dark:text-gray-300">{t('longitude')}</label>
                                    <input 
                                        type="number" 
                                        id="longitude" 
                                        name="longitude" 
                                        value={details.longitude ?? ''} 
                                        onChange={handleDetailsChange}
                                        step="any"
                                        className="mt-1 block w-full text-sm px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="e.g. -74.0060"
                                    />
                                </div>
                                <div className="sm:col-span-1">
                                    <Button 
                                        type="button" 
                                        variant="secondary" 
                                        onClick={handleLocate} 
                                        className="w-full"
                                        title={t('locate_on_map')}
                                    >
                                        <Icon name="locate" className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{t('map_click_prompt')}</p>
                        </div>
                    </div>
                </Card>

                <Card title={t('administrative_info')}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label={t('construction_date')} htmlFor="construction-date">
                            <input type="date" id="construction-date" name="constructionDate" value={details.constructionDate} onChange={handleDetailsChange} max={today} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </InputGroup>
                        <InputGroup label={t('ownership_title')} htmlFor="ownership-title" >
                            <input type="text" id="ownership-title" name="ownershipTitle" value={details.ownershipTitle} onChange={handleDetailsChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </InputGroup>
                        <InputGroup label={t('association_name')} htmlFor="association-name">
                            <input type="text" id="association-name" name="associationName" value={details.associationName} onChange={handleDetailsChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </InputGroup>
                         <InputGroup label={t('currency')} htmlFor="currency">
                             <select id="currency" name="currency" value={details.currency} onChange={handleDetailsChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                 <option value="">{t('select_currency')}</option>
                                 {countries.map(c => <option key={c.currency.code} value={c.currency.code}>{c.currency.name} ({c.currency.code})</option>)}
                             </select>
                        </InputGroup>
                        <InputGroup label={t('budget_planning_horizon')} htmlFor="budget-future-years">
                            <input type="number" id="budget-future-years" name="budgetFutureYears" value={details.budgetFutureYears || 3} onChange={handleDetailsChange} min="1" max="20" required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </InputGroup>
                    </div>
                </Card>
                
                <Card title={t('branding')}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('logo')}</label>
                            <div className="mt-2 flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                                {details.customLogo ? (
                                    <img src={details.customLogo} alt="Custom Logo" className="h-16 w-16 object-contain rounded-md bg-gray-100 dark:bg-gray-700"/>
                                ) : (
                                    <LogoDisplay logoKey={details.logoUrl} className="h-16 w-16 text-blue-600 dark:text-blue-400" />
                                )}
                                <div className="space-y-2">
                                    <Button type="button" variant="secondary" onClick={() => setIsLogoModalOpen(true)}>{t('choose_logo')}</Button>
                                    <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>{t('upload_logo')}</Button>
                                    <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                           <InputGroup label={t('url')} htmlFor="url">
                                <input type="url" id="url" name="url" value={details.url} onChange={handleDetailsChange} placeholder="https://example.com" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                            </InputGroup>
                             <InputGroup label={t('email')} htmlFor="email">
                                <input type="email" id="email" name="email" value={details.email} onChange={handleDetailsChange} placeholder="contact@example.com" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                            </InputGroup>
                             <InputGroup label={t('phone')} htmlFor="phone">
                                <input type="tel" id="phone" name="phone" value={details.phone} onChange={handleDetailsChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                            </InputGroup>
                        </div>
                    </div>
                </Card>

                <div className="flex justify-end pt-4">
                    <Button type="submit">{t('save_changes')}</Button>
                </div>
            </form>
            <LogoSelectionModal isOpen={isLogoModalOpen} onClose={() => setIsLogoModalOpen(false)} onSelectLogo={handleSelectLogo} />
        </>
    );
};

export default PropertyDetails;