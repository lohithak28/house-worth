
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
const songSchema = new mongoose.Schema({
    title: { type: String, required: true },
  artist: { type: String, required: true },
  album: { type: String },
  genre: { type: String },
  releaseDate: { type: Date }
});

const Song = mongoose.model('Song', songSchema);

// API Routes

// CREATE: Add a new product
app.post('/songs', async (req, res) => {
    try {
        const newSong = new Song(req.body);
        const savedSong = await newSong.save();
        res.status(201).json({ success: true, data: savedSong, message: 'Song added successfully.' });
    } catch (error) {
        res.status(400).json({ success: false, data: null, message: error.message });
    }
});

// READ: Fetch all products
app.get('/songs', async (req, res) => {
    try {
        const songs = await Song.find();
        res.status(200).json({ success: true, data: songs, message: 'songs fetched successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, data: null, message: error.message });
    }
});

// UPDATE: Update a product by ID
app.put('/songs/:id', async (req, res) => {
    try {
        const updatedSong = await Song.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedSong) {
            return res.status(404).json({ success: false, data: null, message: 'Song not found.' });
        }
        res.status(200).json({ success: true, data: updatedSong, message: 'Stock updated successfully.' });
    } catch (error) {
        res.status(400).json({ success: false, data: null, message: error.message });
    }
});

// DELETE: Remove a product by ID
app.delete('/songs/:id', async (req, res) => {
    try {
        const deletedSong = await Song.findByIdAndDelete(req.params.id);
        if (!deletedSong) {
            return res.status(404).json({ success: false, data: null, message: 'Song not found.' });
        }
        res.status(200).json({ success: true, data: deletedProduct, message: 'Song deleted successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, data: null, message: error.message });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));