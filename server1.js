const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 6000;

app.use(bodyParser.json());
app.use(express.json());

// MongoDB connection string
const mongoURI = 'mongodb://localhost:27017/mydatabase';

// Connect to MongoDB
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error', err));

// Employee schema and model
const employeeSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    jobTitle: {
        type: String,
        required: true,
        trim: true
    },
    department: {
        type: String,
        required: true
    },
    dateOfHire: {
        type: Date,
        default: Date.now
    },
    salary: {
        type: Number,
        required: true,
        min: 0
    }
});

const Employee = mongoose.model('Employee', employeeSchema);

// 1. Insert 5 employees
app.post('/employees', async (req, res) => {
    try {
        const employees = req.body; // expects an array of employees
        const insertedEmployees = await Employee.insertMany(employees);
        res.status(201).json(insertedEmployees);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 2. Retrieve all employees
app.get('/employees', async (req, res) => {
    try {
        const employees = await Employee.find();
        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Update employee salary where empid is 3
app.put('/employees/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { salary } = req.body;
        const updatedEmployee = await Employee.findOneAndUpdate(
            { id: parseInt(id) },
            { salary },
            { new: true, runValidators: true }
        );
        if (!updatedEmployee) return res.status(404).json({ message: 'Employee not found' });
        res.status(200).json(updatedEmployee);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 4. Delete employees with salary greater than 40000
app.delete('/employees/high-salary', async (req, res) => {
    try {
        const result = await Employee.deleteMany({ salary: { $gt: 40000 } });
        res.status(200).json({ message: `${result.deletedCount} employees deleted successfully` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
