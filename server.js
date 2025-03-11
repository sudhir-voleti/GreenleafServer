// server.js - Node.js server file for Greenleaf Organics website

// Import necessary modules
const express = require('express'); // Express.js for creating the server
const bodyParser = require('body-parser'); // Body-parser to handle request bodies
const fs = require('fs'); // File system module to work with files

// Create an Express application
const app = express();
const port = 3000; // Define the port number for the server

// Middleware to parse URL-encoded bodies (for form data)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // To parse JSON bodies (if needed in future)

// Serve static files from the 'public' directory
// This allows access to your HTML, CSS, JS, and image files in the 'public' folder
app.use(express.static('public'));

// --- Signup Endpoint ---
app.post('/signup', (req, res) => {
    // Log the signup request for debugging
    console.log('Signup request received');

    // Extract email and password from the request body
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required for signup.' });
    }

    // Get the current timestamp for signup
    const timestamp = new Date().toISOString();

    // User data to be stored
    const newUser = {
        email: email,
        password: password, // In a real application, you would hash the password!
        signupTimestamp: timestamp
    };

    // Path to the users.json file - assuming it's in the root directory of your server
    const usersFilePath = 'users.json';

    // Read existing users from users.json
    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        let users = []; // Initialize users array

        if (!err) {
            // If file exists and is readable, parse existing user data
            try {
                users = JSON.parse(data);
            } catch (parseError) {
                console.error('Error parsing users.json:', parseError);
                return res.status(500).json({ message: 'Error reading user data.' });
            }
        } else if (err.code !== 'ENOENT') { // ENOENT error means file not found (which is OK initially)
            // If there's an error reading the file other than 'file not found'
            console.error('Error reading users.json:', err);
            return res.status(500).json({ message: 'Failed to read user data.' });
        }

        // Add the new user to the users array
        users.push(newUser);

        // Write the updated users array back to users.json
        fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (writeErr) => {
            if (writeErr) {
                console.error('Error writing to users.json:', writeErr);
                return res.status(500).json({ message: 'Signup failed: Could not save user data.' });
            }

            // Respond with a success message
            console.log('New user signed up successfully:', email);
            res.status(200).json({ message: 'Signup successful!' });
        });
    });
});

// --- Login Endpoint ---
app.post('/login', (req, res) => {
    // Log the login request for debugging
    console.log('Login request received');

    // Extract email and password from the request body
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required for login.' });
    }

    // Path to the users.json file
    const usersFilePath = 'users.json';

    // Read users from users.json
    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            // If file not found or other read error
            console.error('Error reading users.json for login:', err);
            return res.status(500).json({ message: 'Login failed: Could not read user data.' });
        }

        let users = [];
        try {
            users = JSON.parse(data);
        } catch (parseError) {
            console.error('Error parsing users.json for login:', parseError);
            return res.status(500).json({ message: 'Error reading user data.' });
        }

        // Find user by email and check password
        const user = users.find(u => u.email === email && u.password === password); // IMPORTANT: In real apps, never store passwords in plain text! Hash them!

        if (user) {
            // If user found and password matches
            console.log('Login successful for user:', email);
            res.status(200).json({ message: 'Login successful!' });
        } else {
            // If no matching user found
            console.log('Login failed for user:', email);
            res.status(401).json({ message: 'Login failed: Invalid email or password.' }); // 401 Unauthorized status
        }
    });
});

// --- Start the server ---
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
