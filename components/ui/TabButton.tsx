import React from 'react';

interface TabButtonProps {
    isActive: boolean;
    onClick: () => void;
    children: React.ReactNode;
    disabled?: boolean;
    variant?: 'primary' | 'secondary';
}

const TabButton: React.FC<TabButtonProps> = ({ isActive, onClick, children, disabled = false, variant = 'primary' }) => {
    const baseClasses = "whitespace-nowrap font-medium text-sm focus:outline-none transition-colors";
    const disabledClasses = 'text-gray-400 dark:text-gray-500 cursor-not-allowed';

    const variants = {
        primary: {
            base: 'py-4 px-1 border-b-2',
            active: 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-300',
            inactive: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600',
        },
        secondary: {
            base: 'py-2 px-4 rounded-md',
            active: 'bg-white dark:bg-gray-800 shadow-sm text-blue-700 dark:text-blue-200',
            inactive: 'text-gray-600 hover:bg-white/60 dark:text-gray-300 dark:hover:bg-gray-800/60',
        }
    };
    
    const variantStyle = variants[variant];
    const activeStateClasses = isActive ? variantStyle.active : variantStyle.inactive;

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variantStyle.base} ${disabled ? disabledClasses : activeStateClasses}`}
        >
            {children}
        </button>
    );
};

export default TabButton;