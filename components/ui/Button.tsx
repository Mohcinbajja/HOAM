import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'md' | 'sm';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', ...props }) => {
    const baseClasses = "inline-flex items-center justify-center border border-transparent font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors";
    
    const variantClasses = {
        primary: "text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
        secondary: "text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-blue-500 dark:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600",
        danger: "text-white bg-red-600 hover:bg-red-700 focus:ring-red-500",
    };

    const sizeClasses = {
        md: "px-4 py-2 text-sm",
        sm: "px-2 py-1 text-xs",
    };

    return (
        <button className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`} {...props}>
            {children}
        </button>
    );
};

export default Button;