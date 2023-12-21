const mongoose = require('mongoose');
const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/userdb', { useNewUrlParser: true, useUnifiedTopology: true });

// Create a mongoose schema and model
const userSchema = new mongoose.Schema({
    name: String,
    rollNo: String,
    phone: String,
    imagePath: String
});

const User = mongoose.model('User', userSchema);

// Set up multer for handling file uploads
const storage = multer.diskStorage({
    destination: './uploads',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Handle POST request to /api/register
app.post('/api/register', upload.single('image'), (req, res) => {
    const { name, rollNo, phone } = req.body;
    const imagePath = req.file ? req.file.filename : '';

    const newUser = new User({
        name,
        rollNo,
        phone,
        imagePath
    });

    newUser.save()
    .then(user => {
        res.json({ message: 'User registered successfully', user });
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: 'Error saving user to database', details: err.message });
    });

});

// Catch-all route to handle 404 errors
app.use((req, res) => {
    res.status(404).send('404 - Not Found');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
