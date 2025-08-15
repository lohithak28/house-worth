const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json()); // Middleware to parse JSON

// MongoDB Connection
mongoose
  .connect('mongodb://127.0.0.1:27017/kmitstudent', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Student Schema and Model
const productSchema = new mongoose.Schema({
        productName: { type: String, required: true },
        price: { type: Number, required: true },
        category: { type: String, required: true },
        stock: { type: Number, required: true },
        addedDate: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

// Add a new student
app.post('/products', async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json({ message: 'Student added', student: newProduct });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add student', details: error.message });
  }
});

// Fetch all students
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch students', details: error.message });
  }
});

// Update a student’s course by ID
app.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { price } = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { price },
      { new: true, runValidators: true }
    );
    if (updatedProduct) {
      res.status(200).json({ message: 'Student course updated', student: updatedProduct });
    } else {
      res.status(404).json({ error: 'Student not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update student course', details: error.message });
  }
});

// Delete a student by ID
app.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (deletedProduct) {
      res.status(200).json({ message: 'Student removed', student: deletedProduct });
    } else {
      res.status(404).json({ error: 'Student not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete student', details: error.message });
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});