import React from 'react';
import { CommitteeMember } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import Icon from '../ui/Icon';

interface CommitteeMemberCardProps {
    member: CommitteeMember;
    onEdit: () => void;
    onDelete: () => void;
}

const CommitteeMemberCard: React.FC<CommitteeMemberCardProps> = ({ member, onEdit, onDelete }) => {
    const { t } = useLanguage();

    return (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-sm transition-all hover:shadow-md flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                        {member.photoUrl ? (
                            <img src={member.photoUrl} alt={member.fullName} className="h-12 w-12 rounded-full object-cover" />
                        ) : (
                            <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                                <Icon name="owners" className="h-6 w-6 text-gray-400" />
                            </div>
                        )}
                        <div>
                            <h4 className="font-bold text-lg text-gray-800 dark:text-white break-all">{member.fullName}</h4>
                            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{member.position}</p>
                        </div>
                    </div>
                    <div className="flex space-x-1 flex-shrink-0 ml-2">
                        <button onClick={onEdit} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400" title={t('edit')}>
                            <Icon name="edit" className="h-5 w-5" />
                        </button>
                        <button onClick={onDelete} className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900 text-red-500 dark:text-red-400" title={t('delete')}>
                            <Icon name="delete" className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommitteeMemberCard;