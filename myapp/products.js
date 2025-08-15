const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Initialize Express app
const app = express();
app.use(bodyParser.json());

// MongoDB connection
const mongoURI = 'mongodb://localhost:27017/student_management'; // Replace with your MongoDB URI if using Atlas
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Product Schema
const productSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    price: { type: Number, required: true, validate: value => value > 0 },
    category: { type: String, required: true },
    stock: { type: Number, required: true, validate: value => value >= 0 },
    addedDate: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

// API Routes

// CREATE: Add a new product
app.post('/products', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        const savedProduct = await newProduct.save();
        res.status(201).json({ success: true, data: savedProduct, message: 'Product added successfully.' });
    } catch (error) {
        res.status(400).json({ success: false, data: null, message: error.message });
    }
});

// READ: Fetch all products
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json({ success: true, data: products, message: 'Products fetched successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, data: null, message: error.message });
    }
});

// UPDATE: Update a product by ID
app.put('/products/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedProduct) {
            return res.status(404).json({ success: false, data: null, message: 'Product not found.' });
        }
        res.status(200).json({ success: true, data: updatedProduct, message: 'Stock updated successfully.' });
    } catch (error) {
        res.status(400).json({ success: false, data: null, message: error.message });
    }
});

// DELETE: Remove a product by ID
app.delete('/products/:id', async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ success: false, data: null, message: 'Product not found.' });
        }
        res.status(200).json({ success: true, data: deletedProduct, message: 'Product deleted successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, data: null, message: error.message });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));