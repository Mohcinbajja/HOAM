
import React, { useState } from 'react';
import { Property } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import PropertyModal from './PropertyModal';
import DeletePropertyModal from './DeletePropertyModal';
import Icon from '../ui/Icon';
import PropertyIcon from './PropertyIcon';

interface PropertyCardProps {
    property: Property;
    isSelected: boolean;
    onSelect: () => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, isSelected, onSelect }) => {
    const { t } = useLanguage();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
                className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                    isSelected
                        ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500'
                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
            >
                <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full flex items-center justify-center ${isSelected ? 'bg-blue-200 dark:bg-blue-800' : 'bg-gray-200 dark:bg-gray-600'}`}>
                          <PropertyIcon details={property.details} className={`h-6 w-6 ${isSelected ? 'text-blue-600 dark:text-blue-200' : 'text-gray-600 dark:text-gray-300'}`}/>
                        </div>
                        <h3 className="font-semibold text-lg">{property.name}</h3>
                    </div>
                    <div className="flex space-x-1">
                        <button onClick={handleEdit} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-500 dark:text-gray-400">
                            <Icon name="edit" className="h-5 w-5"/>
                        </button>
                        <button onClick={handleDelete} className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900 text-red-500 dark:text-red-400">
                            <Icon name="delete" className="h-5 w-5"/>
                        </button>
                    </div>
                </div>
            </div>
            <PropertyModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} propertyToEdit={property} />
            <DeletePropertyModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} property={property} />
        </>
    );
};

export default PropertyCard;
