import React from 'react';
import { Owner } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useData } from '../../contexts/DataContext';
import Icon from '../ui/Icon';

interface OwnerListItemProps {
    owner: Owner;
    onEdit: () => void;
    onToggleStatus: () => void;
}

const OwnerListItem: React.FC<OwnerListItemProps> = ({ owner, onEdit, onToggleStatus }) => {
    const { t, language } = useLanguage();
    const { getUnitsByOwner } = useData();
    const units = getUnitsByOwner(owner.id);
    const unit = units[0]; // Assuming one unit per owner

    const displayName = owner.displayRenter && owner.renterDetails.fullName ? owner.renterDetails.fullName : owner.fullName;
    const displayEmail = owner.displayRenter && owner.renterDetails.email ? owner.renterDetails.email : owner.email;

    return (
        <div className="grid grid-cols-12 gap-4 items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="col-span-3 font-semibold text-gray-800 dark:text-white truncate">
                {displayName}
                {owner.isRented && <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({t(owner.displayRenter ? 'renter_details' : 'owner_details')})</span>}
            </div>
            <div className="col-span-2 text-sm text-gray-600 dark:text-gray-300 truncate">
                <a href={`mailto:${displayEmail}`} className="hover:underline">{displayEmail}</a>
            </div>
            <div className="col-span-2 text-sm text-gray-600 dark:text-gray-300 truncate">{unit?.code || 'N/A'}</div>
            <div className="col-span-2 text-sm text-gray-600 dark:text-gray-300 truncate">{new Date(owner.joinDate).toLocaleDateString(language)}</div>
            <div className="col-span-1">
                {owner.isActive 
                    ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">{t('active')}</span>
                    : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">{t('inactive')}</span>
                }
            </div>
            <div className="col-span-2 flex justify-end space-x-1">
                <button onClick={onEdit} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400" title={t('edit')}>
                    <Icon name="edit" className="h-5 w-5" />
                </button>
                <button onClick={onToggleStatus} className={`p-1 rounded-full ${owner.isActive ? 'hover:bg-yellow-100 dark:hover:bg-yellow-900 text-yellow-500 dark:text-yellow-400' : 'hover:bg-green-100 dark:hover:bg-green-900 text-green-500 dark:text-green-400'}`} title={owner.isActive ? t('deactivate_owner') : t('activate_owner')}>
                   {owner.isActive ? <Icon name="delete" className="h-5 w-5" /> : <Icon name="restore" className="h-5 w-5" /> }
                </button>
            </div>
        </div>
    );
};

export default OwnerListItem;
