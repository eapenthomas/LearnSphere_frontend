import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Input = ({
    label,
    type = 'text',
    value,
    onChange,
    error,
    placeholder,
    required = false,
    className = '',
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!value);

    const handleChange = (e) => {
        setHasValue(!!e.target.value);
        onChange(e);
    };

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    return (
        <div className={`relative ${className}`}>
            <div className="relative">
                <input
                    type={type}
                    value={value}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    required={required}
                    className={`
            w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-500
            focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
            ${hasValue || isFocused ? 'pt-6 pb-2' : 'py-3'}
          `}
                    {...props}
                />
                {(hasValue || isFocused) && (
                    <motion.label
                        initial={{ opacity: 0, y: 0 }}
                        animate={{ opacity: 1, y: -8 }}
                        className={`
              absolute left-4 top-2 text-xs font-medium transition-colors duration-200
              ${error ? 'text-red-500' : 'text-blue-600'}
            `}
                    >
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </motion.label>
                )}
            </div>
            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-1 ml-1"
                >
                    {error}
                </motion.p>
            )}
        </div>
    );
};

export default Input; 