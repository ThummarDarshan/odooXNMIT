import { Product, Purchase } from './types';
export const products: Product[] = [
  // Furniture Category
  {
    id: '1',
    title: 'Vintage Wooden Desk',
    description: 'Beautiful handcrafted wooden desk made from reclaimed oak. Perfect for a home office or study area.',
    price: 20749.17,
    category: 'Furniture',
    condition: 'Like New',
    imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    seller: {
      id: '101',
      name: 'EcoFurniture',
      rating: 4.8,
      isVerified: true
    },
    year: 2018,
    brand: 'Artisan Woodworks',
    dimensions: '120cm x 60cm x 75cm',
    weight: '35kg',
    material: 'Reclaimed Oak',
    hasWarranty: true,
    hasManual: false,
    quantity: 1,
    isEcoFriendly: true,
    sustainabilityScore: 85
  },
  {
    id: '9',
    title: 'Reclaimed Wood Bookshelf',
    description: 'Sturdy 5-tier bookshelf made from reclaimed barn wood. Perfect for organizing books and decor.',
    price: 14939.17,
    category: 'Furniture',
    condition: 'Used',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    seller: {
      id: '109',
      name: 'RusticFurniture',
      rating: 4.6,
      isVerified: true
    },
    year: 2020,
    brand: 'BarnWood Co',
    dimensions: '180cm x 80cm x 30cm',
    weight: '25kg',
    material: 'Reclaimed Barn Wood',
    quantity: 2,
    isEcoFriendly: true,
    sustainabilityScore: 88
  },
  {
    id: '10',
    title: 'Bamboo Dining Chair Set',
    description: 'Set of 4 eco-friendly bamboo dining chairs. Lightweight yet sturdy construction.',
    price: 16599.17,
    category: 'Furniture',
    condition: 'New',
    imageUrl: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    seller: {
      id: '110',
      name: 'BambooLiving',
      rating: 4.7,
      isVerified: true
    },
    brand: 'EcoSeating',
    dimensions: '45cm x 45cm x 85cm',
    weight: '8kg each',
    material: 'Bamboo',
    quantity: 4,
    isEcoFriendly: true,
    sustainabilityScore: 92
  },

  // Kitchen Category
  {
    id: '2',
    title: 'Bamboo Coffee Mug Set',
    description: 'Set of 4 eco-friendly bamboo coffee mugs. Biodegradable and sustainable.',
    price: 2074.17,
    category: 'Kitchen',
    condition: 'New',
    imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    seller: {
      id: '102',
      name: 'GreenKitchen',
      rating: 4.6,
      isVerified: true
    },
    brand: 'EcoCup',
    weight: '400g',
    material: 'Bamboo',
    hasManual: true,
    quantity: 8,
    isEcoFriendly: true,
    sustainabilityScore: 95
  },
  {
    id: '11',
    title: 'Stainless Steel Water Bottle',
    description: 'Insulated stainless steel water bottle. Keeps drinks cold for 24 hours or hot for 12 hours.',
    price: 1659.17,
    category: 'Kitchen',
    condition: 'Like New',
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    seller: {
      id: '111',
      name: 'HydrateWell',
      rating: 4.8,
      isVerified: true
    },
    brand: 'EcoBottle',
    dimensions: '25cm x 7cm',
    weight: '350g',
    material: 'Stainless Steel',
    quantity: 15,
    isEcoFriendly: true,
    sustainabilityScore: 90
  },
  {
    id: '12',
    title: 'Organic Cotton Kitchen Towels',
    description: 'Set of 6 organic cotton kitchen towels. Absorbent and machine washable.',
    price: 2904.17,
    category: 'Kitchen',
    condition: 'New',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    seller: {
      id: '112',
      name: 'OrganicTextiles',
      rating: 4.5,
      isVerified: true
    },
    brand: 'PureCotton',
    dimensions: '50cm x 70cm each',
    material: 'Organic Cotton',
    quantity: 6,
    isEcoFriendly: true,
    sustainabilityScore: 87
  },

  // Clothing Category
  {
    id: '3',
    title: 'Vintage Leather Jacket',
    description: 'Classic brown leather jacket, gently used. Great condition with minimal wear.',
    price: 7469.17,
    category: 'Clothing',
    condition: 'Used',
    imageUrl: 'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    seller: {
      id: '103',
      name: 'VintageFinds',
      rating: 4.3,
      isVerified: false
    },
    year: 2010,
    brand: 'Classic Leather',
    material: 'Genuine Leather',
    quantity: 1,
    sustainabilityScore: 70
  },
  {
    id: '13',
    title: 'Organic Cotton T-Shirt',
    description: 'Comfortable organic cotton t-shirt in various sizes. Soft and breathable.',
    price: 24.99,
    category: 'Clothing',
    condition: 'New',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    seller: {
      id: '113',
      name: 'EcoWear',
      rating: 4.4,
      isVerified: true
    },
    brand: 'OrganicWear',
    material: 'Organic Cotton',
    quantity: 20,
    isEcoFriendly: true,
    sustainabilityScore: 85
  },
  {
    id: '14',
    title: 'Upcycled Denim Jeans',
    description: 'Vintage-style jeans made from upcycled denim. Unique distressed look.',
    price: 3817.17,
    category: 'Clothing',
    condition: 'Used',
    imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    seller: {
      id: '114',
      name: 'DenimRevival',
      rating: 4.6,
      isVerified: true
    },
    brand: 'UpcycledFashion',
    material: 'Upcycled Denim',
    quantity: 8,
    isEcoFriendly: true,
    sustainabilityScore: 88
  },

  // Electronics Category
  {
    id: '4',
    title: 'Solar Powered Charger',
    description: 'Portable solar charger for all your devices. Eco-friendly way to charge on the go.',
    price: 4149.17,
    category: 'Electronics',
    condition: 'Like New',
    imageUrl: 'https://images.unsplash.com/photo-1620827252031-876c8e5a558a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    seller: {
      id: '104',
      name: 'GreenTech',
      rating: 4.9,
      isVerified: true
    },
    year: 2022,
    brand: 'SolarCharge',
    dimensions: '15cm x 8cm x 2cm',
    weight: '250g',
    hasManual: true,
    quantity: 5,
    isEcoFriendly: true,
    sustainabilityScore: 90
  },
  {
    id: '7',
    title: 'Vintage Record Player',
    description: 'Refurbished 1970s record player in excellent working condition. Perfect for vinyl enthusiasts.',
    price: 15769.17,
    category: 'Electronics',
    condition: 'Used',
    imageUrl: 'https://images.unsplash.com/photo-1461360228754-6e81c478b882?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    seller: {
      id: '107',
      name: 'RetroAudio',
      rating: 4.5,
      isVerified: false
    },
    year: 1975,
    brand: 'AudioClassics',
    dimensions: '40cm x 35cm x 15cm',
    weight: '5kg',
    quantity: 1,
    sustainabilityScore: 75
  },
  {
    id: '15',
    title: 'Energy Efficient LED Bulbs',
    description: 'Pack of 6 energy-efficient LED bulbs. Lasts 25,000 hours and saves energy.',
    price: 2489.17,
    category: 'Electronics',
    condition: 'New',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    seller: {
      id: '115',
      name: 'EcoLighting',
      rating: 4.7,
      isVerified: true
    },
    brand: 'GreenLight',
    quantity: 6,
    isEcoFriendly: true,
    sustainabilityScore: 95
  },

  // Home Decor Category
  {
    id: '5',
    title: 'Organic Cotton Throw Blanket',
    description: 'Soft and cozy throw blanket made from 100% organic cotton. Perfect for cool evenings.',
    price: 2946.5,
    category: 'Home Decor',
    condition: 'New',
    imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    seller: {
      id: '105',
      name: 'EcoHome',
      rating: 4.7,
      isVerified: true
    },
    brand: 'OrganicLiving',
    dimensions: '150cm x 120cm',
    material: 'Organic Cotton',
    quantity: 12,
    isEcoFriendly: true,
    sustainabilityScore: 88
  },
  {
    id: '6',
    title: 'Recycled Glass Vase',
    description: 'Beautiful handblown vase made from recycled glass. Each piece is unique.',
    price: 3486.0,
    category: 'Home Decor',
    condition: 'New',
    imageUrl: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    seller: {
      id: '106',
      name: 'ArtisanGlass',
      rating: 4.8,
      isVerified: true
    },
    dimensions: '25cm x 15cm',
    material: 'Recycled Glass',
    quantity: 3,
    isEcoFriendly: true,
    sustainabilityScore: 92
  },
  {
    id: '16',
    title: 'Cork Wall Art',
    description: 'Eco-friendly wall art made from recycled cork. Natural and sustainable decoration.',
    price: 2406.17,
    category: 'Home Decor',
    condition: 'New',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    seller: {
      id: '116',
      name: 'CorkArt',
      rating: 4.3,
      isVerified: true
    },
    brand: 'NaturalDecor',
    dimensions: '40cm x 30cm',
    material: 'Recycled Cork',
    quantity: 5,
    isEcoFriendly: true,
    sustainabilityScore: 89
  },

  // Accessories Category
  {
    id: '8',
    title: 'Upcycled Denim Tote Bag',
    description: 'Handmade tote bag created from upcycled denim jeans. Durable and stylish.',
    price: 2489.17,
    category: 'Accessories',
    condition: 'New',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    seller: {
      id: '108',
      name: 'UpcycledFashion',
      rating: 4.7,
      isVerified: true
    },
    dimensions: '40cm x 35cm x 10cm',
    material: 'Upcycled Denim',
    quantity: 7,
    isEcoFriendly: true,
    sustainabilityScore: 93
  },
  {
    id: '17',
    title: 'Bamboo Sunglasses',
    description: 'Stylish sunglasses with bamboo frames. Lightweight and eco-friendly.',
    price: 3319.17,
    category: 'Accessories',
    condition: 'New',
    imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    seller: {
      id: '117',
      name: 'BambooStyle',
      rating: 4.5,
      isVerified: true
    },
    brand: 'EcoVision',
    material: 'Bamboo',
    quantity: 12,
    isEcoFriendly: true,
    sustainabilityScore: 91
  },
  {
    id: '18',
    title: 'Recycled Metal Keychain',
    description: 'Unique keychain made from recycled metal. Each piece is handcrafted.',
    price: 746.17,
    category: 'Accessories',
    condition: 'New',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    seller: {
      id: '118',
      name: 'MetalCraft',
      rating: 4.2,
      isVerified: false
    },
    brand: 'RecycledMetal',
    material: 'Recycled Metal',
    quantity: 25,
    isEcoFriendly: true,
    sustainabilityScore: 86
  },

  // Books Category
  {
    id: '19',
    title: 'Sustainable Living Guide',
    description: 'Comprehensive guide to sustainable living practices. Paperback edition.',
    price: 1327.17,
    category: 'Books',
    condition: 'Used',
    imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    seller: {
      id: '119',
      name: 'GreenBooks',
      rating: 4.6,
      isVerified: true
    },
    brand: 'EcoPress',
    quantity: 3,
    isEcoFriendly: true,
    sustainabilityScore: 80
  },
  {
    id: '20',
    title: 'Zero Waste Cookbook',
    description: 'Delicious recipes for zero waste cooking. Hardcover with beautiful illustrations.',
    price: 1908.17,
    category: 'Books',
    condition: 'Like New',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    seller: {
      id: '120',
      name: 'CookbookCorner',
      rating: 4.8,
      isVerified: true
    },
    brand: 'GreenCooking',
    quantity: 2,
    isEcoFriendly: true,
    sustainabilityScore: 85
  },

  // Sports Category
  {
    id: '21',
    title: 'Yoga Mat (Natural Rubber)',
    description: 'Eco-friendly yoga mat made from natural rubber. Non-slip and biodegradable.',
    price: 4149.17,
    category: 'Sports',
    condition: 'New',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    seller: {
      id: '121',
      name: 'EcoFitness',
      rating: 4.7,
      isVerified: true
    },
    brand: 'NaturalYoga',
    dimensions: '180cm x 60cm x 0.5cm',
    material: 'Natural Rubber',
    quantity: 8,
    isEcoFriendly: true,
    sustainabilityScore: 92
  },
  {
    id: '22',
    title: 'Bamboo Water Bottle',
    description: 'Lightweight water bottle with bamboo exterior. Perfect for hiking and sports.',
    price: 24.99,
    category: 'Sports',
    condition: 'New',
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    seller: {
      id: '122',
      name: 'SportEco',
      rating: 4.4,
      isVerified: true
    },
    brand: 'BambooSport',
    material: 'Bamboo & Stainless Steel',
    quantity: 15,
    isEcoFriendly: true,
    sustainabilityScore: 88
  },

  // Toys Category
  {
    id: '23',
    title: 'Wooden Building Blocks',
    description: 'Set of 50 wooden building blocks made from sustainable wood. Safe for children.',
    price: 2904.17,
    category: 'Toys',
    condition: 'Used',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    seller: {
      id: '123',
      name: 'EcoToys',
      rating: 4.9,
      isVerified: true
    },
    brand: 'NaturalPlay',
    material: 'Sustainable Wood',
    quantity: 4,
    isEcoFriendly: true,
    sustainabilityScore: 94
  },
  {
    id: '24',
    title: 'Recycled Plastic Toy Car',
    description: 'Colorful toy car made from recycled plastic. Durable and safe for kids.',
    price: 1659.17,
    category: 'Toys',
    condition: 'Like New',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    seller: {
      id: '124',
      name: 'GreenToys',
      rating: 4.6,
      isVerified: true
    },
    brand: 'RecycledPlay',
    material: 'Recycled Plastic',
    quantity: 6,
    isEcoFriendly: true,
    sustainabilityScore: 87
  },

  // Garden Category
  {
    id: '25',
    title: 'Compost Bin',
    description: 'Eco-friendly compost bin for kitchen waste. Helps reduce food waste and create fertilizer.',
    price: 6639.17,
    category: 'Garden',
    condition: 'New',
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    seller: {
      id: '125',
      name: 'GardenEco',
      rating: 4.8,
      isVerified: true
    },
    brand: 'CompostPro',
    dimensions: '40cm x 40cm x 60cm',
    material: 'Recycled Plastic',
    quantity: 3,
    isEcoFriendly: true,
    sustainabilityScore: 96
  },
  {
    id: '26',
    title: 'Seed Starter Kit',
    description: 'Complete kit for starting your own garden. Includes seeds, pots, and soil.',
    price: 2489.17,
    category: 'Garden',
    condition: 'New',
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    seller: {
      id: '126',
      name: 'GrowGreen',
      rating: 4.5,
      isVerified: true
    },
    brand: 'SeedStart',
    quantity: 10,
    isEcoFriendly: true,
    sustainabilityScore: 90
  }
];
export const purchases: Purchase[] = [{
  id: 'p1',
  product: products[2],
  purchaseDate: '2023-09-15',
  quantity: 1
}, {
  id: 'p2',
  product: products[4],
  purchaseDate: '2023-08-22',
  quantity: 2
}, {
  id: 'p3',
  product: products[7],
  purchaseDate: '2023-07-10',
  quantity: 1
}];
export const categories = ['All Categories', 'Furniture', 'Kitchen', 'Clothing', 'Electronics', 'Home Decor', 'Accessories', 'Books', 'Sports', 'Toys', 'Garden'];
export const conditions = ['All Conditions', 'New', 'Like New', 'Used'];
export const sortOptions = [{
  value: 'newest',
  label: 'Newest First'
}, {
  value: 'oldest',
  label: 'Oldest First'
}, {
  value: 'price-low',
  label: 'Price: Low to High'
}, {
  value: 'price-high',
  label: 'Price: High to Low'
}, {
  value: 'sustainability',
  label: 'Sustainability Score'
}];
export const myListings = [products[0], products[3], products[5]];