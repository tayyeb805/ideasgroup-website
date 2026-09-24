const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Disable cache in development so edits show immediately
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public'), { etag: false, maxAge: 0 }));

// Route for home
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route for about us page
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/about.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

// Route for IDEAS ONE Mall page
app.get('/ideas-one', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ideas-one.html'));
});

app.get('/ideas-one.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ideas-one.html'));
});

app.get('/mall', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ideas-one.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`IdeasGroup server is running on http://localhost:${PORT}`);
});