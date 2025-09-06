import React from 'react';
import { CommitteeMember } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import Icon from '../ui/Icon';

interface CommitteeMemberListItemProps {
    member: CommitteeMember;
    onEdit: () => void;
    onDelete: () => void;
}

const CommitteeMemberListItem: React.FC<CommitteeMemberListItemProps> = ({ member, onEdit, onDelete }) => {
    const { t } = useLanguage();

    return (
        <div className="grid grid-cols-12 gap-4 items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="col-span-6 flex items-center space-x-3">
                {member.photoUrl ? (
                    <img src={member.photoUrl} alt={member.fullName} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                        <Icon name="owners" className="h-5 w-5 text-gray-400" />
                    </div>
                )}
                <span className="font-semibold text-gray-800 dark:text-white truncate" title={member.fullName}>{member.fullName}</span>
            </div>
            <div className="col-span-4 text-sm text-gray-600 dark:text-gray-300 truncate" title={member.position}>{member.position}</div>
            <div className="col-span-2 flex justify-end space-x-1">
                <button onClick={onEdit} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400" title={t('edit')}>
                    <Icon name="edit" className="h-5 w-5" />
                </button>
                <button onClick={onDelete} className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900 text-red-500 dark:text-red-400" title={t('delete')}>
                    <Icon name="delete" className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

export default CommitteeMemberListItem;