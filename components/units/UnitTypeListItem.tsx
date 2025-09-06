import React, { useState } from 'react';
import { UnitType } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useData } from '../../contexts/DataContext';
import Icon from '../ui/Icon';
import UnitTypeModal from './UnitTypeModal';
import DeleteUnitTypeModal from './DeleteUnitTypeModal';

interface UnitTypeListItemProps {
    unitType: UnitType;
}

const UnitTypeListItem: React.FC<UnitTypeListItemProps> = ({ unitType }) => {
    const { t, language } = useLanguage();
    const { selectedProperty } = useData();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    const currency = selectedProperty?.details.currency || 'USD';

    return (
        <>
            <div className="grid grid-cols-12 gap-4 items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div className="col-span-3 font-semibold text-gray-800 dark:text-white truncate">{unitType.name}</div>
                <div className="col-span-5 text-sm text-gray-600 dark:text-gray-300 truncate" title={unitType.description}>{unitType.description}</div>
                <div className="col-span-2 text-sm text-gray-600 dark:text-gray-300">{unitType.surface} m²</div>
                <div className="col-span-2 flex justify-end space-x-1">
                    <button onClick={() => setIsEditModalOpen(true)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400" title={t('edit')}>
                        <Icon name="edit" className="h-5 w-5" />
                    </button>
                    <button onClick={() => setIsDeleteModalOpen(true)} className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900 text-red-500 dark:text-red-400" title={t('delete')}>
                        <Icon name="delete" className="h-5 w-5" />
                    </button>
                </div>
            </div>
            <UnitTypeModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} unitTypeToEdit={unitType} />
            <DeleteUnitTypeModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} unitType={unitType} />
        </>
    );
};

export default UnitTypeListItem;