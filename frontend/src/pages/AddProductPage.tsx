import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import Checkbox from '../components/ui/Checkbox';
import Button from '../components/ui/Button';
import { UploadIcon, XIcon, CheckIcon } from 'lucide-react';
import { categories as dummyCategories } from '../data/dummyData';
import { productsApi } from '../lib/api';
interface FormData {
  title: string;
  category: string;
  description: string;
  price: string;
  quantity: string;
  condition: string;
  year: string;
  brand: string;
  dimensions: string;
  weight: string;
  material: string;
  hasWarranty: boolean;
  hasManual: boolean;
  isEcoFriendly: boolean;
  images: File[];
}
const AddProductPage: React.FC = () => {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    category: '',
    description: '',
    price: '',
    quantity: '1',
    condition: 'Used',
    year: '',
    brand: '',
    dimensions: '',
    weight: '',
    material: '',
    hasWarranty: false,
    hasManual: false,
    isEcoFriendly: false,
    images: []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formProgress, setFormProgress] = useState(0);
  const conditions = ['New', 'Like New', 'Used'];
  const [categoryOptions, setCategoryOptions] = useState<string[]>(dummyCategories.filter(c => c !== 'All Categories'));
  const [categoryMap, setCategoryMap] = useState<Record<string, number>>({});

  // Calculate form progress
  const calculateProgress = () => {
    const requiredFields = ['title', 'category', 'description', 'price', 'quantity', 'condition'];
    const filledFields = requiredFields.filter(field => {
      const value = formData[field as keyof FormData];
      return value && value.toString().trim() !== '';
    });
    return Math.round((filledFields.length / requiredFields.length) * 100);
  };

  // Update progress when form data changes
  useEffect(() => {
    setFormProgress(calculateProgress());
  }, [formData]);

  // Load categories from backend
  useEffect(() => {
    (async () => {
      try {
        const res = await productsApi.categories();
        setCategoryOptions(res.categories.map(c => c.name));
        const map: Record<string, number> = {};
        res.categories.forEach(c => { map[c.name] = c.id; });
        setCategoryMap(map);
      } catch (_) {
        // fallback to dummy categories already set
      }
    })();
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
    
    // Real-time validation for price
    if (name === 'price' && value) {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue <= 0) {
        setErrors(prev => ({
          ...prev,
          price: 'Price must be a positive number'
        }));
      }
    }
    
    // Real-time validation for quantity
    if (name === 'quantity' && value) {
      const numValue = parseInt(value);
      if (isNaN(numValue) || numValue <= 0) {
        setErrors(prev => ({
          ...prev,
          quantity: 'Quantity must be a positive number'
        }));
      }
    }
  };
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      name,
      checked
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
    }
  };
  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    if (!formData.quantity.trim()) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(parseInt(formData.quantity)) || parseInt(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be a positive number';
    }
    if (!formData.condition) {
      newErrors.condition = 'Condition is required';
    }
    if (formData.year && (isNaN(parseInt(formData.year)) || parseInt(formData.year) < 1900 || parseInt(formData.year) > new Date().getFullYear())) {
      newErrors.year = 'Please enter a valid year';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    try {
      // Submit to backend
      const categoryEntityId = categoryMap[formData.category];
      const payload = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        categoryId: categoryEntityId || 1,
        condition: formData.condition as any,
        quantity: parseInt(formData.quantity),
        year: formData.year ? parseInt(formData.year) : undefined,
        brand: formData.brand || undefined,
        dimensions: formData.dimensions || undefined,
        weight: formData.weight || undefined,
        material: formData.material || undefined,
        hasWarranty: Boolean(formData.hasWarranty),
        hasManual: Boolean(formData.hasManual),
        isEcoFriendly: Boolean(formData.isEcoFriendly),
        sustainabilityScore: formData.isEcoFriendly ? Math.floor(Math.random() * 20) + 80 : undefined,
        images: formData.images
      };
      await productsApi.create(payload);
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/listings');
      }, 2000);
    } catch (error) {
      console.error('Error adding product:', error);
      setErrors({
        form: 'Failed to add product. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return <div className={`${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">Add a New Listing</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Fill out the details below to add your sustainable item to the
            marketplace.
          </p>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Form Progress
              </span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {formProgress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${formProgress}%` }}
              ></div>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {formProgress === 100 ? 'Ready to submit!' : 'Complete all required fields to continue'}
            </p>
          </div>
        </div>
        {showSuccess ? <div className={`rounded-lg p-6 text-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
              <CheckIcon className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
            <h3 className="mt-3 text-lg font-medium">
              Product Added Successfully!
            </h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Your item has been added to your listings.
            </p>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Redirecting to your listings...
              </p>
            </div>
          </div> : <form onSubmit={handleSubmit} className="space-y-6">
            {errors.form && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                {errors.form}
              </div>}
            <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
              <h2 className="text-lg font-medium mb-4">Basic Information</h2>
              <div className="space-y-4">
                <Input id="title" name="title" label="Product Title*" placeholder="Enter a descriptive title" value={formData.title} onChange={handleChange} error={errors.title} fullWidth required />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select id="category" name="category" label="Category*" options={categoryOptions} value={formData.category} onChange={value => {
                setFormData(prev => ({
                  ...prev,
                  category: value
                }));
                if (errors.category) {
                  setErrors(prev => {
                    const newErrors = {
                      ...prev
                    };
                    delete newErrors.category;
                    return newErrors;
                  });
                }
              }} error={errors.category} fullWidth required />
                  <Select id="condition" name="condition" label="Condition*" options={conditions} value={formData.condition} onChange={value => {
                setFormData(prev => ({
                  ...prev,
                  condition: value
                }));
              }} fullWidth required />
                </div>
                <div>
                  <Textarea 
                    id="description" 
                    name="description" 
                    label="Description*" 
                    placeholder="Describe your item, including any defects or special features" 
                    value={formData.description} 
                    onChange={handleChange} 
                    error={errors.description} 
                    fullWidth 
                    required 
                  />
                  <div className="mt-1 text-right">
                    <span className={`text-xs ${formData.description.length > 500 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                      {formData.description.length}/1000 characters
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input id="price" name="price" type="number" label="Price ($)*" placeholder="0.00" min="0.01" step="0.01" value={formData.price} onChange={handleChange} error={errors.price} fullWidth required />
                  <Input id="quantity" name="quantity" type="number" label="Quantity*" placeholder="1" min="1" value={formData.quantity} onChange={handleChange} error={errors.quantity} fullWidth required />
                </div>
              </div>
            </div>
            <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
              <h2 className="text-lg font-medium mb-4">Additional Details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input id="year" name="year" type="number" label="Year of Manufacture" placeholder="e.g. 2020" value={formData.year} onChange={handleChange} error={errors.year} fullWidth />
                  <Input id="brand" name="brand" label="Brand" placeholder="e.g. Apple, IKEA" value={formData.brand} onChange={handleChange} fullWidth />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input id="dimensions" name="dimensions" label="Dimensions" placeholder="e.g. 10cm x 20cm x 5cm" value={formData.dimensions} onChange={handleChange} fullWidth />
                  <Input id="weight" name="weight" label="Weight" placeholder="e.g. 2kg" value={formData.weight} onChange={handleChange} fullWidth />
                  <Input id="material" name="material" label="Material" placeholder="e.g. Wood, Plastic" value={formData.material} onChange={handleChange} fullWidth />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <Checkbox id="hasWarranty" name="hasWarranty" label="Warranty Included" checked={formData.hasWarranty} onChange={handleCheckboxChange} />
                  <Checkbox id="hasManual" name="hasManual" label="Manual Included" checked={formData.hasManual} onChange={handleCheckboxChange} />
                  <Checkbox id="isEcoFriendly" name="isEcoFriendly" label="Eco-Friendly" checked={formData.isEcoFriendly} onChange={handleCheckboxChange} />
                </div>
              </div>
            </div>
            <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
              <h2 className="text-lg font-medium mb-4">Product Images</h2>
              <div className="space-y-4">
                {/* Image Preview */}
                {formData.images.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Uploaded Images ({formData.images.length})
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border dark:border-gray-700 group">
                          <img 
                            src={URL.createObjectURL(image)} 
                            alt={`Product image ${index + 1}`} 
                            className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                          />
                          <button 
                            type="button" 
                            onClick={() => handleRemoveImage(index)} 
                            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity" 
                            aria-label="Remove image"
                          >
                            <XIcon className="h-4 w-4" />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {image.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Image Upload */}
                <div className="mt-2">
                  <label 
                    htmlFor="image-upload" 
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
                      theme === 'dark' 
                        ? 'border-gray-600 hover:border-green-500 bg-gray-700 hover:bg-gray-600' 
                        : 'border-gray-300 hover:border-green-500 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadIcon className="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span>{' '}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG, GIF up to 10MB each
                      </p>
                      {formData.images.length > 0 && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          {formData.images.length} image(s) uploaded
                        </p>
                      )}
                    </div>
                    <input 
                      id="image-upload" 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      multiple 
                      onChange={handleImageUpload} 
                    />
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center pt-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {formProgress === 100 ? (
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    ✓ All required fields completed
                  </span>
                ) : (
                  <span>
                    {6 - Math.round((formProgress / 100) * 6)} required fields remaining
                  </span>
                )}
              </div>
              <div className="flex space-x-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={isSubmitting || formProgress < 100}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding...
                    </div>
                  ) : (
                    'Add Product'
                  )}
                </Button>
              </div>
            </div>
          </form>}
      </div>
    </div>;
};
export default AddProductPage;