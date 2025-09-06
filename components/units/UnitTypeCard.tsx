import React, { useState } from 'react';
import { UnitType } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useData } from '../../contexts/DataContext';
import Icon from '../ui/Icon';
import UnitTypeModal from './UnitTypeModal';
import DeleteUnitTypeModal from './DeleteUnitTypeModal';

interface UnitTypeCardProps {
    unitType: UnitType;
}

const UnitTypeCard: React.FC<UnitTypeCardProps> = ({ unitType }) => {
    const { t, language } = useLanguage();
    const { selectedProperty } = useData();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    const currency = selectedProperty?.details.currency || 'USD';

    return (
        <>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-sm transition-all hover:shadow-md flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start">
                        <h4 className="font-bold text-lg text-gray-800 dark:text-white break-all">{unitType.name}</h4>
                        <div className="flex space-x-1 flex-shrink-0 ml-2">
                            <button onClick={() => setIsEditModalOpen(true)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400">
                                <Icon name="edit" className="h-5 w-5" />
                            </button>
                            <button onClick={() => setIsDeleteModalOpen(true)} className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900 text-red-500 dark:text-red-400">
                                <Icon name="delete" className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 h-10 overflow-hidden">{unitType.description}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 space-y-2 text-sm text-gray-700 dark:text-gray-200">
                    <div className="flex items-center">
                        <Icon name="area" className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-500 dark:text-gray-400 mr-1">{t('surface_m2')}:</span>
                        <strong>{unitType.surface} m²</strong>
                    </div>
                </div>
            </div>
            <UnitTypeModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} unitTypeToEdit={unitType} />
            <DeleteUnitTypeModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} unitType={unitType} />
        </>
    );
};

export default UnitTypeCard;