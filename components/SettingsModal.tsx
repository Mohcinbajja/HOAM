
import React, { useEffect, useState, useRef } from 'react';
import Modal from './ui/Modal';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../types';
import TabButton from './ui/TabButton';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import Button from './ui/Button';
import Icon from './ui/Icon';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { t, language, setLanguage } = useLanguage();
    const { backupData, restoreData, showSuccessMessage } = useData();
    const { username, updateCredentials } = useAuth();

    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [credentialError, setCredentialError] = useState('');

    useEffect(() => {
        const root = window.document.documentElement;
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (theme === 'dark' || (theme === 'system' && systemPrefersDark)) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        if (isOpen) {
            setNewUsername(username);
            setNewPassword('');
            setConfirmPassword('');
            setCredentialError('');
        }
    }, [isOpen, username]);

    const handleRestoreClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!window.confirm(t('restore_confirm_message'))) {
            if(fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        try {
            const text = await file.text();
            await restoreData(text);
            // The page will reload on success, handled in restoreData
        } catch (error) {
            alert(t('restore_error_invalid_file'));
        }
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    
    const handleCredentialsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setCredentialError('');

        if (newPassword !== confirmPassword) {
            setCredentialError(t('passwords_do_not_match'));
            return;
        }

        if (!newUsername.trim() || !newPassword.trim()) {
            return;
        }

        updateCredentials(newUsername.trim(), newPassword.trim());
        showSuccessMessage(t('credentials_updated_success'));
        onClose();
    };


    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('settings')}>
            <div className="space-y-8">
                <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Appearance</h3>
                    <div className="mt-4 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Language
                            </label>
                            <div className="mt-2 flex space-x-2 bg-gray-100 dark:bg-gray-900/50 p-1 rounded-lg">
                            <TabButton
                                    variant="secondary"
                                    isActive={language === Language.EN}
                                    onClick={() => setLanguage(Language.EN)}
                                >
                                    English
                                </TabButton>
                                <TabButton
                                    variant="secondary"
                                    isActive={language === Language.FR}
                                    onClick={() => setLanguage(Language.FR)}
                                >
                                    Français
                                </TabButton>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Theme
                            </label>
                            <div className="mt-2 flex space-x-2 bg-gray-100 dark:bg-gray-900/50 p-1 rounded-lg">
                            <TabButton
                                    variant="secondary"
                                    isActive={theme === 'light'}
                                    onClick={() => setTheme('light')}
                                >
                                    Light
                                </TabButton>
                                <TabButton
                                    variant="secondary"
                                    isActive={theme === 'dark'}
                                    onClick={() => setTheme('dark')}
                                >
                                    Dark
                                </TabButton>
                                <TabButton
                                    variant="secondary"
                                    isActive={theme === 'system'}
                                    onClick={() => setTheme('system')}
                                >
                                    System
                                </TabButton>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('account_security')}</h3>
                    <form onSubmit={handleCredentialsSubmit} className="mt-4 space-y-4">
                        <div>
                            <label htmlFor="new-username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('new_username')}
                            </label>
                            <input
                                type="text"
                                id="new-username"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('new_password')}
                            </label>
                            <input
                                type="password"
                                id="new-password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('confirm_password')}
                            </label>
                            <input
                                type="password"
                                id="confirm-password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                        {credentialError && <p className="text-sm text-red-500">{credentialError}</p>}
                        <div className="flex justify-end">
                            <Button type="submit">{t('save_credentials')}</Button>
                        </div>
                    </form>
                </div>
                
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('data_management')}</h3>
                    <div className="mt-4 flex flex-col sm:flex-row gap-4">
                        <Button onClick={backupData} className="w-full sm:w-auto">
                            <Icon name="backup" className="h-5 w-5 mr-2" />
                            {t('backup_data')}
                        </Button>
                        <Button onClick={handleRestoreClick} variant="secondary" className="w-full sm:w-auto">
                            <Icon name="restore" className="h-5 w-5 mr-2" />
                            {t('restore_data')}
                        </Button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept=".json"
                            className="hidden"
                        />
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default SettingsModal;
