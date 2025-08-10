import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
    children,
    variant = 'primary',
    onClick,
    disabled = false,
    className = '',
    type = 'button',
    fullWidth = false
}) => {
    const baseClasses = 'font-medium py-2 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variants = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow focus:ring-blue-500',
        secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500',
        outline: 'bg-transparent hover:bg-blue-50 text-blue-600 border border-blue-300 hover:border-blue-400 focus:ring-blue-500',
        danger: 'bg-red-600 hover:bg-red-700 text-white shadow focus:ring-red-500'
    };

    const widthClass = fullWidth ? 'w-full' : '';
    const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

    return (
        <motion.button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variants[variant]} ${widthClass} ${disabledClass} ${className}`}
            whileHover={!disabled ? { scale: 1.02 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
        >
            {children}
        </motion.button>
    );
};

export default Button; 