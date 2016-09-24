const express = require('express');
const path = require('path');
const locations = require('./locations.json');
const apiKey = require('fs').readFileSync('GOOGLE_API_KEY.txt');

const app = express();

app.get('/', (req, res) => {
    res.redirect(`/${apiKey}`);
});

app.get(`/${apiKey}`, (req, res) => {
   res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/locations', (req, res) => {
    res.sendFile(path.join(__dirname, 'locations.json'));
});

const assetPath = locations[0].path.slice(0, locations[0].path.lastIndexOf('/'));
app.use(express.static(assetPath));

app.listen(8787, function () {
    console.log('listening!');
});