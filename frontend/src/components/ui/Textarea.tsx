import React, { forwardRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  fullWidth = false,
  className = '',
  ...props
}, ref) => {
  const {
    theme
  } = useTheme();
  const baseClasses = `rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`;
  const errorClasses = error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600';
  const widthClass = fullWidth ? 'w-full' : '';
  return <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
        {label && <label htmlFor={props.id} className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {label}
          </label>}
        <textarea ref={ref} className={`${baseClasses} ${errorClasses} ${widthClass} px-4 py-2 border`} rows={4} {...props} />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>;
});
Textarea.displayName = 'Textarea';
export default Textarea;