import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { UserIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
const SignUpPage: React.FC = () => {
  const {
    theme
  } = useTheme();
  const {
    signup
  } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {
          ...prev
        };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      setIsLoading(true);
      await signup(formData.displayName, formData.email, formData.password);
      navigate('/');
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({
        form: 'Failed to create account. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };
  return <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className={`max-w-md w-full space-y-8 p-8 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="text-center">
          <Link to="/" className="flex items-center justify-center">
            <span className="text-green-600 text-3xl font-bold">Eco</span>
            <span className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Finds
            </span>
          </Link>
          <h2 className="mt-6 text-2xl font-extrabold">Create your account</h2>
          <p className="mt-2 text-sm">Join our sustainable marketplace</p>
        </div>
        <div className="flex justify-center">
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border-4 border-white dark:border-gray-800">
            <UserIcon className="absolute inset-0 w-full h-full p-4 text-gray-400" />
          </div>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.form && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {errors.form}
            </div>}
          <div className="space-y-4">
            <Input id="displayName" name="displayName" type="text" autoComplete="name" label="Display Name" placeholder="Your name" value={formData.displayName} onChange={handleChange} error={errors.displayName} fullWidth required />
            <Input id="email" name="email" type="email" autoComplete="email" label="Email Address" placeholder="you@example.com" value={formData.email} onChange={handleChange} error={errors.email} fullWidth required />
            <div className="relative">
              <Input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" label="Password" placeholder="••••••••" value={formData.password} onChange={handleChange} error={errors.password} fullWidth required />
              <button type="button" className="absolute right-3 top-8 text-gray-500" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
              </button>
            </div>
            <div className="relative">
              <Input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" label="Confirm Password" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} fullWidth required />
              <button type="button" className="absolute right-3 top-8 text-gray-500" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
              </button>
            </div>
          </div>
          <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </Button>
          <div className="text-center">
            <p className="text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-green-600 hover:text-green-500 font-medium">
                Log in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>;
};
export default SignUpPage;