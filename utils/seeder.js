const products = require('../data/product');
const Product = require('../models/productModel');
const mongoose = require('mongoose');
const dotenv = require('dotenv');   
// Setting up config file
dotenv.config({ path: 'backend/config/config.env' });
// Connecting to database
mongoose.connect(process.env.DATABASE_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
}).then(() => {
    console.log('Database connected for seeding');
}).catch((err) => {
    console.error('Database connection error:', err);
    process.exit(1);
});
const seedProducts = async () => {
    try {
        // Clear existing products
        await Product.deleteMany();
        console.log('Existing products cleared');   
        // Insert sample products
        await Product.insertMany(products);
        console.log('Sample products inserted');   
        process.exit();
    } catch (error) {
        console.error('Error seeding products:', error);
        process.exit(1);
    }   
};
seedProducts();