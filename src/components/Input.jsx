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
            w-full px-4 py-3 border rounded-lg transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
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