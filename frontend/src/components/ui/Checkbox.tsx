import React, { forwardRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
}
const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  error,
  className = '',
  ...props
}, ref) => {
  const {
    theme
  } = useTheme();
  return <div className={`flex items-start ${className}`}>
        <div className="flex items-center h-5">
          <input ref={ref} type="checkbox" className={`h-4 w-4 rounded border-gray-300 focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white'}`} {...props} />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor={props.id} className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
            {label}
          </label>
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
      </div>;
});
Checkbox.displayName = 'Checkbox';
export default Checkbox;