const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('../models/Category');
const Product = require('../models/Product');
const User = require('../models/User');
const Hero = require('../models/Hero');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

// Mock Data
const CATEGORIES = [
    'Dresses', 'Jackets', 'Hijabs', 'Sets', 'Accessories', 'Shoes'
];

const PRODUCTS_DATA = [
    {
        name: 'Silk Chiffon Dress',
        price: 129.99,
        originalPrice: 159.99,
        rating: 4.8,
        reviews: 124,
        image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000',
        discount: '20% OFF',
        isNew: true,
        categoryName: 'Dresses',
    },
    {
        name: 'Linen Summer Set',
        price: 89.99,
        rating: 4.5,
        reviews: 89,
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000',
        categoryName: 'Sets',
    },
    {
        name: 'Elegant Beige Coat',
        price: 199.99,
        rating: 4.9,
        reviews: 56,
        image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=1000',
        categoryName: 'Jackets',
    },
    {
        name: 'Floral Maxi Hijab',
        price: 29.99,
        originalPrice: 39.99,
        rating: 4.7,
        reviews: 210,
        image: 'https://images.unsplash.com/photo-1585250003309-170460c1c850?q=80&w=1000',
        discount: 'Sale',
        categoryName: 'Hijabs',
    }
];

const HERO_SLIDES = [
    {
        title: 'Elegant Modesty',
        subtitle: 'New Collection 2025',
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000&auto=format&fit=crop',
        ctaText: 'Shop Collection',
        linkType: 'category',
        linkValue: 'Dresses',
        order: 1
    },
    {
        title: 'Summer Breeze',
        subtitle: 'Light & Airy Styles',
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
        ctaText: 'Discover',
        linkType: 'category',
        linkValue: 'Sets',
        order: 2
    },
    {
        title: 'Office Chic',
        subtitle: 'Professional & Stylish',
        image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1000&auto=format&fit=crop',
        ctaText: 'Explore',
        linkType: 'category',
        linkValue: 'Jackets',
        order: 3
    },
];

// Import Data
const importData = async () => {
    try {
        // Clear DB
        await Category.deleteMany();
        await Product.deleteMany();
        await User.deleteMany();
        await Hero.deleteMany();

        console.log('Data Destroyed...');

        // Create Categories
        const categoryMap = {};
        for (const catName of CATEGORIES) {
            const cat = await Category.create({ name: catName });
            categoryMap[catName] = cat._id;
        }

        console.log('Categories Created...');

        // Create Products
        const products = PRODUCTS_DATA.map(product => {
            const { categoryName, ...rest } = product;
            return {
                ...rest,
                category: categoryMap[categoryName]
            };
        });

        await Product.create(products);

        console.log('Products Created...');

        // Create Heroes
        await Hero.create(HERO_SLIDES);
        console.log('Heroes Created...');

        console.log('Data Imported!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

// Delete Data
const deleteData = async () => {
    try {
        await Category.deleteMany();
        await Product.deleteMany();
        await User.deleteMany();
        await Hero.deleteMany();
        console.log('Data Destroyed...');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    deleteData();
} else {
    importData();
}
