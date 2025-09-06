import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
const LoginPage: React.FC = () => {
  const {
    theme
  } = useTheme();
  const {
    login
  } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
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
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
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
      await login(formData.email, formData.password);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        form: 'Invalid email or password'
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
          <h2 className="mt-6 text-2xl font-extrabold">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm">
            Welcome back to our sustainable marketplace
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.form && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {errors.form}
            </div>}
          <div className="space-y-4">
            <Input id="email" name="email" type="email" autoComplete="email" label="Email Address" placeholder="you@example.com" value={formData.email} onChange={handleChange} error={errors.email} fullWidth required />
            <div className="relative">
              <Input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" label="Password" placeholder="••••••••" value={formData.password} onChange={handleChange} error={errors.password} fullWidth required />
              <button type="button" className="absolute right-3 top-8 text-gray-500" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" className={`h-4 w-4 rounded border-gray-300 focus:ring-green-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white'}`} />
                <label htmlFor="remember-me" className="ml-2 block text-sm">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <Link to="/forgot-password" className="text-green-600 hover:text-green-500 font-medium">
                  Forgot password?
                </Link>
              </div>
            </div>
          </div>
          <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
          <div className="text-center">
            <p className="text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-green-600 hover:text-green-500 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>;
};
export default LoginPage;