import React from 'react';
import { Owner } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useData } from '../../contexts/DataContext';
import Icon from '../ui/Icon';

interface OwnerCardProps {
    owner: Owner;
    onEdit: () => void;
    onToggleStatus: () => void;
}

const OwnerCard: React.FC<OwnerCardProps> = ({ owner, onEdit, onToggleStatus }) => {
    const { t, language } = useLanguage();
    const { getUnitsByOwner } = useData();
    const units = getUnitsByOwner(owner.id);
    const unit = units[0]; // Assuming one unit per owner for now

    const displayName = owner.displayRenter ? owner.renterDetails.fullName : owner.fullName;
    const displayEmail = owner.displayRenter ? owner.renterDetails.email : owner.email;

    return (
        <div className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-sm transition-all hover:shadow-md flex flex-col justify-between border-l-4 ${owner.isActive ? 'border-blue-500' : 'border-gray-400'}`}>
            <div>
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="font-bold text-lg text-gray-800 dark:text-white break-all">{displayName}</h4>
                        {owner.isRented && <p className="text-xs text-gray-500 dark:text-gray-400">{t(owner.displayRenter ? 'renter_details' : 'owner_details')}</p>}
                    </div>
                    <div className="flex space-x-1 flex-shrink-0 ml-2">
                        <button onClick={onEdit} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400">
                            <Icon name="edit" className="h-5 w-5" />
                        </button>
                        <button onClick={onToggleStatus} className={`p-1 rounded-full ${owner.isActive ? 'hover:bg-yellow-100 dark:hover:bg-yellow-900 text-yellow-500 dark:text-yellow-400' : 'hover:bg-green-100 dark:hover:bg-green-900 text-green-500 dark:text-green-400'}`}>
                           {owner.isActive ? <Icon name="delete" className="h-5 w-5" /> : <Icon name="restore" className="h-5 w-5" /> }
                        </button>
                    </div>
                </div>
                <div className="mt-2 space-y-2 text-sm text-gray-700 dark:text-gray-200">
                    <div className="flex items-center">
                        <Icon name="email" className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                        <a href={`mailto:${displayEmail}`} className="truncate hover:underline">{displayEmail}</a>
                    </div>
                    {unit && (
                        <div className="flex items-center">
                            <Icon name="property" className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{unit.code}</span>
                        </div>
                    )}
                    <div className="flex items-center">
                        <Icon name="calendar_days" className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{t('join_date')}: {new Date(owner.joinDate).toLocaleDateString(language)}</span>
                    </div>
                </div>
            </div>
             <div className="mt-4 pt-2 text-xs font-semibold uppercase">
                {owner.isActive 
                    ? <span className="text-green-600 dark:text-green-400">{t('active')}</span>
                    : <span className="text-red-600 dark:text-red-400">{t('inactive')}</span>
                }
            </div>
        </div>
    );
};

export default OwnerCard;
