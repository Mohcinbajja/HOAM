import React from 'react';
import Modal from '../ui/Modal';
import { useLanguage } from '../../contexts/LanguageContext';
import { predefinedLogos, LogoDisplay } from '../ui/PredefinedLogos';

interface LogoSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectLogo: (logoKey: string) => void;
}

const LogoSelectionModal: React.FC<LogoSelectionModalProps> = ({ isOpen, onClose, onSelectLogo }) => {
    const { t } = useLanguage();

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('choose_logo_title')}>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 p-4">
                {Object.keys(predefinedLogos).map(key => (
                    <button
                        key={key}
                        onClick={() => onSelectLogo(key)}
                        className="p-2 border-2 border-transparent rounded-lg hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all aspect-square flex items-center justify-center bg-gray-50 dark:bg-gray-700"
                        aria-label={`Select logo ${key}`}
                    >
                        <LogoDisplay logoKey={key} className="h-16 w-16 text-gray-700 dark:text-gray-300" />
                    </button>
                ))}
            </div>
        </Modal>
    );
};

export default LogoSelectionModal;