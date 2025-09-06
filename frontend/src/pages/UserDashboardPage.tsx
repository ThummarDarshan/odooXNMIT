import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { UserIcon, PackageIcon, ShoppingCartIcon, HeartIcon, SettingsIcon, LogOutIcon, CameraIcon, CheckIcon } from 'lucide-react';
const UserDashboardPage: React.FC = () => {
  const {
    theme
  } = useTheme();
  const {
    user,
    logout
  } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || ''
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      name,
      value
    } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(URL.createObjectURL(file));
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would update the user profile via API
    setTimeout(() => {
      setIsEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };
  if (!user) {
    return <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">Please sign in</h2>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            You need to be logged in to view your dashboard.
          </p>
          <Link to="/login">
            <Button variant="primary">Sign In</Button>
          </Link>
        </div>
      </div>;
  }
  return <div className={`${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-8">My Dashboard</h1>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className={`rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md p-6`}>
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <img src={profileImage || user.profileImage} alt={user.displayName} className="w-24 h-24 rounded-full object-cover" />
                </div>
                <h2 className="mt-4 text-xl font-medium">{user.displayName}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.email}
                </p>
              </div>
              <nav className="space-y-1">
                <Link to="/dashboard" className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}>
                  <UserIcon className="h-5 w-5 mr-3" />
                  Profile
                </Link>
                <Link to="/listings" className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}>
                  <PackageIcon className="h-5 w-5 mr-3" />
                  My Listings
                </Link>
                <Link to="/purchases" className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}>
                  <ShoppingCartIcon className="h-5 w-5 mr-3" />
                  My Purchases
                </Link>
                <Link to="/wishlist" className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}>
                  <HeartIcon className="h-5 w-5 mr-3" />
                  Wishlist
                </Link>
                <Link to="/settings" className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}>
                  <SettingsIcon className="h-5 w-5 mr-3" />
                  Settings
                </Link>
                <button onClick={logout} className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium ${theme === 'dark' ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-600'}`}>
                  <LogOutIcon className="h-5 w-5 mr-3" />
                  Sign Out
                </button>
              </nav>
            </div>
          </div>
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className={`rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md p-6`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium">Profile Information</h2>
                {!isEditing && <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>}
              </div>
              {showSuccess && <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-md flex items-center">
                  <CheckIcon className="h-5 w-5 mr-2" />
                  Profile updated successfully!
                </div>}
              {isEditing ? <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative">
                      <img src={profileImage || user.profileImage} alt={user.displayName} className="w-32 h-32 rounded-full object-cover" />
                      <label htmlFor="profile-image" className="absolute bottom-0 right-0 bg-green-500 text-white p-2 rounded-full cursor-pointer">
                        <CameraIcon className="h-5 w-5" />
                      </label>
                      <input type="file" id="profile-image" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </div>
                  </div>
                  <Input id="displayName" name="displayName" label="Display Name" value={profileData.displayName} onChange={handleChange} fullWidth />
                  <Input id="email" name="email" label="Email Address" type="email" value={profileData.email} onChange={handleChange} fullWidth />
                  <div className="flex justify-end space-x-4 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary">
                      Save Changes
                    </Button>
                  </div>
                </form> : <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Display Name
                      </p>
                      <p className="font-medium">{user.displayName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Email Address
                      </p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium mb-4">
                      Account Statistics
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Active Listings
                        </p>
                        <p className="text-2xl font-bold">3</p>
                      </div>
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Completed Sales
                        </p>
                        <p className="text-2xl font-bold">12</p>
                      </div>
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Purchases
                        </p>
                        <p className="text-2xl font-bold">8</p>
                      </div>
                    </div>
                  </div>
                </div>}
            </div>
            <div className={`mt-8 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md p-6`}>
              <h2 className="text-xl font-medium mb-4">
                Sustainability Impact
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-green-700 bg-green-900/20' : 'border-green-200 bg-green-50'}`}>
                  <h3 className="text-green-600 dark:text-green-400 font-medium mb-1">
                    CO₂ Saved
                  </h3>
                  <p className="text-2xl font-bold">47 kg</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    By buying and selling second-hand
                  </p>
                </div>
                <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-blue-700 bg-blue-900/20' : 'border-blue-200 bg-blue-50'}`}>
                  <h3 className="text-blue-600 dark:text-blue-400 font-medium mb-1">
                    Water Saved
                  </h3>
                  <p className="text-2xl font-bold">1,240 L</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Compared to buying new products
                  </p>
                </div>
                <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-purple-700 bg-purple-900/20' : 'border-purple-200 bg-purple-50'}`}>
                  <h3 className="text-purple-600 dark:text-purple-400 font-medium mb-1">
                    Waste Reduced
                  </h3>
                  <p className="text-2xl font-bold">8.5 kg</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    By extending product lifecycle
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default UserDashboardPage;