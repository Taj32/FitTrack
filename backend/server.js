// Entry points for node js application
// using express.js
const express = require('express')
const app = express();

//create the server
app.get('/', (req, res) => {
    res.send('<h1>Hello, Node.js HTTP Server!!!</h1>');
});

// Include route files
const usersRoute = require('./routes/users');
const productsRoute = require('./routes/products');

// Use routes
app.use('/users', usersRoute);
app.use('/products', productsRoute);

const port = process.env.PORT || 3000;

//start the server
app.listen(port, () => {
    console.log(`Node.js HTTP server is running on port ${port}`); //note the backtick
});





//create an http server
// const server = http.createServer((req, res) => {
//     // Set the response headers
//     res.writeHead(200, {'Content-Type': 'text/html'});

//     //Write the response content
//     res.write('<h1>Hello, Node.js HTTP Server!!!</h1>');
//     res.end();
// });

// // Specify the port to listen on
// const port = 3000;

// // Start the server;
// server.listen(port, () => {
//     console.log(`Node.js HTTP server is running on port ${port}`);
// });