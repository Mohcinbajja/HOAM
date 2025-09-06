import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useData } from '../../contexts/DataContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import ReportHeader from '../reports/ReportHeader';
import ReportFooter from '../reports/ReportFooter';

const Documents: React.FC = () => {
    const { t } = useLanguage();
    const { addArchivedDocument, showSuccessMessage } = useData();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleGeneratePreview = () => {
        if (title.trim() && content.trim()) {
            setIsPreviewing(true);
        }
    };

    const handleClear = () => {
        setTitle('');
        setContent('');
        setIsPreviewing(false);
    };

    const handleSaveToArchive = async () => {
        const previewElement = document.getElementById('document-preview-area');
        if (!previewElement) return;

        setIsSaving(true);
        try {
            const html2canvas = (window as any).html2canvas;
            if (!html2canvas) {
                console.error("html2canvas is not loaded");
                return;
            }

            const canvas = await html2canvas(previewElement, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
            });
            const dataUrl = canvas.toDataURL('image/png');

            addArchivedDocument({
                name: title,
                year: new Date().getFullYear(),
                fileUrl: dataUrl,
                fileType: 'image/png',
                source: t('generated_document'),
            });

            showSuccessMessage(t('document_saved_success'));
            handleClear();

        } catch (error) {
            console.error("Error saving document:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="grid grid-cols-1 gap-8 items-start">
            <Card title={t('create_document')}>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="doc-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('document_title')}
                        </label>
                        <input
                            type="text"
                            id="doc-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="doc-content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('document_content')}
                        </label>
                        <textarea
                            id="doc-content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={15}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono"
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={handleGeneratePreview} disabled={!title.trim() || !content.trim()}>
                            {t('generate_preview')}
                        </Button>
                    </div>
                </div>
            </Card>

            <Card title={t('document_preview')}>
                {isPreviewing ? (
                    <div className="space-y-4">
                        <div id="document-preview-area" className="report-page bg-white">
                            <div className="report-header-group">
                                <ReportHeader />
                            </div>
                            <div className="report-body-group pt-8 pb-8 flex-grow flex flex-col items-center">
                                <h1 className="text-2xl font-bold mb-6 text-center dark-text-fix">{title}</h1>
                                <p className="text-base whitespace-pre-wrap dark-text-fix self-stretch">{content}</p>
                            </div>
                            <div className="report-footer-group">
                                <ReportFooter />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3">
                             <Button variant="secondary" onClick={handleClear}>
                                {t('clear_form')}
                            </Button>
                            <Button onClick={handleSaveToArchive} disabled={isSaving}>
                                {isSaving ? 'Saving...' : t('save_to_archive')}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                        <Icon name="documents" className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-gray-500 dark:text-gray-400">{t('preview_will_appear_here')}</p>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Documents;