import React, { useState, useRef } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useLanguage } from '../../contexts/LanguageContext';
import { useData } from '../../contexts/DataContext';

interface UploadDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultYear: number;
}

const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({ isOpen, onClose, defaultYear }) => {
    const { t } = useLanguage();
    const { addArchivedDocument } = useData();
    const [name, setName] = useState('');
    const [year, setYear] = useState(defaultYear);
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            if (!name) {
                setName(e.target.files[0].name);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !file) return;

        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            const fileUrl = loadEvent.target?.result as string;
            addArchivedDocument({
                name: name.trim(),
                year,
                fileUrl,
                fileType: file.type,
                source: t('manual_upload'),
            });
            onClose();
        };
        reader.readAsDataURL(file);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('upload_document')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="doc-name" className="block text-sm font-medium">{t('document_name')}</label>
                    <input type="text" id="doc-name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 w-full px-2 py-1.5 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                </div>
                <div>
                    <label htmlFor="doc-year" className="block text-sm font-medium">{t('document_year')}</label>
                    <input type="number" id="doc-year" value={year} onChange={e => setYear(Number(e.target.value))} required className="mt-1 w-full px-2 py-1.5 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium">File</label>
                    <div className="mt-1 flex items-center">
                        <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>{t('upload_photo')}</Button>
                        <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">{file?.name || "No file selected."}</span>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" required/>
                    </div>
                </div>
                <div className="flex justify-end pt-4 space-x-2">
                    <Button type="button" variant="secondary" onClick={onClose}>{t('cancel')}</Button>
                    <Button type="submit">{t('save')}</Button>
                </div>
            </form>
        </Modal>
    );
};

export default UploadDocumentModal;