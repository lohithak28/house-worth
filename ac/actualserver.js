const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('actual')); // Serve static files

// MongoDB connection
const mongoURI = 'mongodb://localhost:27017/mydatabase';
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Serve static HTML files
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'actual', 'l1.html'));
});
app.get('/signup', (req, res) => res.sendFile(path.join(__dirname, 'actual', 'signup.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'actual', 'houselogin.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'actual', 'ha1.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, 'actual', 'housecontact.html')));


app.get('/sell', (req, res) => res.sendFile(path.join(__dirname, 'actual', 'sell.html')));
app.get('/contactpage', (req, res) => res.sendFile(path.join(__dirname, 'actual', 'lc.html')));
// User schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});
const User = mongoose.model('User', userSchema);

// Signup and login routes
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).send({ error: 'User already exists' });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();
    res.status(201).send({ message: 'Signup successful' });
  } catch (err) {
    console.error('Error during signup:', err);
    res.status(500).send({ error: 'Internal server error' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username, password });
    if (user) {
      res.send({ message: 'Login successful', username: user.username });
    } else {
      res.status(401).send({ error: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).send({ error: 'Internal server error' });
  }
});
// Mongoose Schema
const feedbackSchema = new mongoose.Schema({
  areaInterest: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  school: { type: String },
  comments: { type: String },
  source: { type: String },
});

// Mongoose Model
const Feedback = mongoose.model("Feedback", feedbackSchema);

// Routes
app.post("/submit", async (req, res) => {
  try {
    const feedbackData = new Feedback({
      areaInterest: req.body["area-interest"],
      firstName: req.body["first-name"],
      lastName: req.body["last-name"],
      email: req.body.email,
      phone: req.body.phone,
      school: req.body.school,
      comments: req.body.comments,
      source: req.body.source,
    });

    await feedbackData.save();
    res.status(201).send("Feedback submitted successfully!");
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while submitting feedback.");
  }
});

// Property schema for storing property data
const propertySchema = new mongoose.Schema({
  title: String,
  price: Number,
  location: String,
  description: String,
  flatType: String, // 1BHK, 2BHK, 3BHK
  houseType: String, // apartment, villa, studio-apartment
  images: [String], // Array of image URLs
  contact: String,   // Phone number of the seller
  email: String,     // Email of the seller
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const Property = mongoose.model('Property', propertySchema);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Upload setup with multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Routes for listing properties
// Route for handling property submissions
app.post('/sell', upload.array('images', 5), async (req, res) => {
  let { price, location, description, flatType, houseType, contact, email } = req.body;
  const images = req.files.map((file) => `/uploads/${file.filename}`);
  
  // Check if the images were uploaded
  if (images.length === 0) {
    return res.status(400).json({ message: 'At least one image must be uploaded' });
  }

  // Remove commas from price and convert it to a number
  if (price && typeof price === 'string') {
    price = Number(price.replace(/,/g, ''));
  } else {
    return res.status(400).json({ message: 'Invalid price format' });
  }

  // Create a new property document
  const newProperty = new Property({
    price,
    location,
    description,
    flatType,
    houseType,
    images, // Store multiple images
    contact,
    email,
  });

  try {
    await newProperty.save();

    // Return success message with location for frontend redirection
    res.status(200).json({
      message: 'Property successfully listed!',
      location: location.toLowerCase(),
    });
    
  } catch (error) {
    console.error('Error saving property:', error.message);
    res.status(500).json({ message: `Error saving property: ${error.message}` });
  }
});
// Route to fetch filtered properties (using GET)
app.get('/filter-properties', async (req, res) => {
  const { propertyType, flatType, priceRange, location } = req.query;

  // Initialize an empty filter object
  let filter = {};

  // Apply filters dynamically based on query parameters
  if (location) filter.location = location;  // Filter by location
  if (propertyType) filter.propertyType = propertyType;  // Filter by property type
  if (flatType) filter.flatType = flatType;  // Filter by flat type

  if (priceRange) {
      // Assuming priceRange is a string like "0-50L", "50L-1Cr", or "1Cr-Above"
      const [minPrice, maxPrice] = priceRange.split('-').map(val => {
          if (val.includes('L')) {
              return parseInt(val.replace('L', '')) * 100000;  // Convert lakhs to actual numbers
          }
          if (val.includes('Cr')) {
              return parseInt(val.replace('Cr', '')) * 10000000;  // Convert crores to actual numbers
          }
          return parseInt(val);
      });
      
      if (minPrice && maxPrice) {
          filter.price = { $gte: minPrice, $lte: maxPrice };
      } else if (minPrice) {
          filter.price = { $gte: minPrice };
      } else if (maxPrice) {
          filter.price = { $lte: maxPrice };
      }
  }

  try {
      // Find properties based on filter
      const properties = await Property.find(filter);

      // Send filtered properties as response
      res.json({ properties });
  } catch (error) {
      console.error("Error filtering properties:", error);
      res.status(500).json({ message: "Error filtering properties" });
  }
});
// Contact schema for storing seller contact data
const contactSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  location: String,
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Contact = mongoose.model('Contact', contactSchema);
// Route to handle contact seller form submission
app.post('/contact-seller', async (req, res) => {
  const { name, phone, email, location } = req.body;

  // Validate input data
  if (!name || !phone || !email || !location ) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Create a new contact document and save it to the database
  const newContact = new Contact({
    name,
    phone,
    email,
    location,
    
  });

  try {
    await newContact.save();
    res.status(200).json({
      message: 'Contact details saved successfully. Seller will be notified.',
    });
  } catch (err) {
    console.error('Error saving contact details:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// API to fetch properties for the Buy page (e.g., Kukatpally)
// Route for Kukatpally (or any other location)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Route for /buy/kukatpally
app.get('/buy/kukatpally', async (req, res) => {
  try {
    // Fetch properties based on location
    const properties = await Property.find({ location: 'Kukatpally' });

    // Render the Kukatpally page with the properties
    res.render('kukatpally', { properties: properties });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).send('Error fetching properties');
  }
});

app.get('/buy/lingampally', async (req, res) => {
  try {
    // Fetch properties based on location
    const properties = await Property.find({ location: 'Lingampally' });

    // Log the properties to inspect the data
    console.log(properties);

    // Render the Kukatpally page with the properties
    res.render('lingampally', { properties });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).send('Error fetching properties');
  }
});

app.get('/buy/jubilee-hills', async (req, res) => {
  try {
    // Fetch properties based on location
    const properties = await Property.find({ location: 'Jubliee Hills' });

    // Log the properties to inspect the data
    console.log(properties);

    // Render the Jubilee Hills page with the properties
    res.render('jubilee_hills', { properties });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).send('Error fetching properties');
  }
});
app.get('/buy/gachibowli', async (req, res) => {
  try {
    // Fetch properties based on location
    const properties = await Property.find({ location: 'Gachibowli' });

    // Log the properties to inspect the data
    console.log(properties);

    // Render the Jubilee Hills page with the properties
    res.render('gachibowli', { properties });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).send('Error fetching properties');
  }
});




// Start the server
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
