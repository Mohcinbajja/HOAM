
import React, { useState } from 'react';
import { Property } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import PropertyModal from './PropertyModal';
import DeletePropertyModal from './DeletePropertyModal';
import Icon from '../ui/Icon';
import PropertyIcon from './PropertyIcon';

interface PropertyGridItemProps {
    property: Property;
    isSelected: boolean;
    onSelect: () => void;
}

const PropertyGridItem: React.FC<PropertyGridItemProps> = ({ property, isSelected, onSelect }) => {
    const { t } = useLanguage();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditModalOpen(true);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDeleteModalOpen(true);
    };

    return (
        <>
            <div
                onClick={onSelect}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`relative p-4 rounded-lg cursor-pointer transition-all duration-200 aspect-square flex flex-col items-center justify-center text-center ${
                    isSelected
                        ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500'
                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
            >
                <PropertyIcon details={property.details} className={`h-16 w-16 mb-2 ${isSelected ? 'text-blue-600 dark:text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}/>
                <h3 className="font-semibold text-lg break-all">{property.name}</h3>
                
                {(isHovered || isSelected) && (
                    <div className="absolute top-2 right-2 flex space-x-1 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-1 rounded-full">
                        <button onClick={handleEdit} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-500 dark:text-gray-400" title={t('edit')}>
                            <Icon name="edit" className="h-5 w-5"/>
                        </button>
                        <button onClick={handleDelete} className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900 text-red-500 dark:text-red-400" title={t('delete')}>
                            <Icon name="delete" className="h-5 w-5"/>
                        </button>
                    </div>
                )}
            </div>
            <PropertyModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} propertyToEdit={property} />
            <DeletePropertyModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} property={property} />
        </>
    );
};

export default PropertyGridItem;
