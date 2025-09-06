import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import SettingsModal from '../SettingsModal';
import Icon from '../ui/Icon';
import LogoutConfirmationModal from '../auth/LogoutConfirmationModal';

const Header: React.FC = () => {
    const { t } = useLanguage();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    return (
        <>
            <header className="bg-white dark:bg-gray-800 shadow-md no-print">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2">
                            <Icon name="logo" className="h-8 w-8 text-blue-600"/>
                            <span className="text-xl font-bold text-gray-800 dark:text-white">{t('login_title')}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setIsSettingsOpen(true)}
                                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                                aria-label={t('settings')}
                            >
                                <Icon name="settings" className="h-6 w-6"/>
                            </button>
                            <button
                                onClick={() => setIsLogoutModalOpen(true)}
                                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                                aria-label={t('logout')}
                            >
                                <Icon name="logout" className="h-6 w-6"/>
                            </button>
                        </div>
                    </div>
                </div>
            </header>
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
            <LogoutConfirmationModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} />
        </>
    );
};

export default Header;