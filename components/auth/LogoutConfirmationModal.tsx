import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

interface LogoutConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LogoutConfirmationModal: React.FC<LogoutConfirmationModalProps> = ({ isOpen, onClose }) => {
    const { t } = useLanguage();
    const { logout } = useAuth();
    const { backupData } = useData();

    const handleBackupAndLogout = () => {
        backupData();
        logout();
        onClose();
    };
    
    const handleLogoutAnyway = () => {
        logout();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('logout_confirmation_title')}>
             <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                    <Icon name="alert_triangle" className="h-8 w-8 text-yellow-500" />
                </div>
                <div className="flex-grow">
                    <p className="text-gray-600 dark:text-gray-400 pt-1">{t('logout_confirmation_message')}</p>
                </div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row-reverse sm:space-x-3 sm:space-x-reverse space-y-2 sm:space-y-0">
                <Button onClick={handleBackupAndLogout} className="w-full sm:w-auto">
                    <Icon name="backup" className="h-5 w-5 mr-2" />
                    {t('backup_and_logout')}
                </Button>
                <Button variant="secondary" onClick={handleLogoutAnyway} className="w-full sm:w-auto">
                    {t('logout_anyway')}
                </Button>
                <Button variant="secondary" onClick={onClose} className="w-full sm:w-auto">
                    {t('stay_on_page')}
                </Button>
            </div>
        </Modal>
    );
};

export default LogoutConfirmationModal;
