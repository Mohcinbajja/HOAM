import React from 'react';
import Header from '../components/layout/Header';
import VerticalSidebar from '../components/layout/VerticalSidebar';
import PropertyList from '../components/property/PropertyList';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Module } from '../types';

import Summary from '../components/modules/Summary';
import PropertyDetails from '../components/modules/PropertyDetails';
import Units from '../components/modules/Units';
import Owners from '../components/modules/Owners';
import Committee from '../components/modules/Committee';
import RegularBudget from '../components/modules/RegularBudget';
import ExceptionalBudget from '../components/modules/ExceptionalBudget';
import Reports from '../components/modules/Reports';
import Documents from '../components/modules/Documents';
import Archive from '../components/modules/Archive';
import UnsavedChangesModal from '../components/ui/UnsavedChangesModal';
import SuccessToast from '../components/ui/SuccessToast';

const HomePage: React.FC = () => {
    const { selectedProperty, activeModule, successMessage } = useData();
    const { t } = useLanguage();

    const renderModule = () => {
        if (!selectedProperty) return null;

        switch(activeModule) {
            case Module.Summary: return <Summary />;
            case Module.Property: return <PropertyDetails />;
            case Module.Units: return <Units />;
            case Module.Owners: return <Owners />;
            case Module.Committee: return <Committee />;
            case Module.RegularBudget: return <RegularBudget />;
            case Module.ExceptionalBudget: return <ExceptionalBudget />;
            case Module.Reports: return <Reports />;
            case Module.Documents: return <Documents />;
            case Module.Archive: return <Archive />;
            default: return <Summary />;
        }
    }

    return (
        <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Header />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                {selectedProperty ? (
                    <div className="flex flex-col lg:flex-row gap-8">
                        <VerticalSidebar />
                        <div className="flex-1">
                            {renderModule()}
                        </div>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto">
                         <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                            <PropertyList />
                        </div>
                    </div>
                )}
            </main>
            <UnsavedChangesModal />
            <SuccessToast message={successMessage} />
        </div>
    );
};

export default HomePage;