import React from 'react';
import Modal from '../ui/Modal';
import ReportPage from '../../pages/ReportPage';
import { useLanguage } from '../../contexts/LanguageContext';
import { TranslationKey } from '../../lib/translations';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    reportKey: string;
    year?: number | null;
    ownerId?: string | null;
    view?: string;
    month?: number;
    itemId?: string;
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, reportKey, year, ownerId, view, month, itemId }) => {
    const { t } = useLanguage();
    const title = t(reportKey as TranslationKey);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="4xl">
            <div className="bg-gray-100 dark:bg-gray-900 -m-6 p-4">
                 <ReportPage 
                    reportKey={reportKey} 
                    year={year} 
                    ownerId={ownerId}
                    view={view}
                    month={month}
                    itemId={itemId}
                />
            </div>
        </Modal>
    );
};

export default ReportModal;