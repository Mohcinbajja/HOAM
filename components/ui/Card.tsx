import React from 'react';

interface CardProps {
    title: string;
    children: React.ReactNode;
    className?: string
}

const Card: React.FC<CardProps> = ({ title, children, className = '' }) => (
    <div className={`p-6 bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">{title}</h3>
        {children}
    </div>
);

export default Card;
