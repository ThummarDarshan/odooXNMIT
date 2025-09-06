import React, { forwardRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ChevronDownIcon } from 'lucide-react';
interface Option {
  value: string;
  label: string;
}
interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  options: Option[] | string[];
  error?: string;
  fullWidth?: boolean;
  onChange?: (value: string) => void;
}
const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  options,
  error,
  fullWidth = false,
  onChange,
  className = '',
  ...props
}, ref) => {
  const {
    theme
  } = useTheme();
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };
  const baseClasses = `rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`;
  const errorClasses = error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600';
  const widthClass = fullWidth ? 'w-full' : '';
  return <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
        {label && <label htmlFor={props.id} className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            {label}
          </label>}
        <div className="relative">
          <select ref={ref} className={`${baseClasses} ${errorClasses} ${widthClass} appearance-none px-4 py-2 pr-10 border`} onChange={handleChange} {...props}>
            {options.map((option, index) => {
          if (typeof option === 'string') {
            return <option key={index} value={option}>
                    {option}
                  </option>;
          } else {
            return <option key={index} value={option.value}>
                    {option.label}
                  </option>;
          }
        })}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
            <ChevronDownIcon className="h-5 w-5" />
          </div>
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>;
});
Select.displayName = 'Select';
export default Select;