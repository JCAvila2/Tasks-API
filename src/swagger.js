const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Info about the API
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Tasks API',
            version: '1.0.0'
        }
    },
    apis: ['./src/app.js']
};

// Docs in JSON format
const swaggerSpec = swaggerJSDoc(options);


// Function to setup the docs
const swaggerDocs = (app, port) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.get('/api-docs.json', (request, response) => {
        response.setHeader('Content-Type', 'application/json');
        response.send(swaggerSpec);
    });
    console.log(`API docs available at http://localhost:${port}/api-docs`);
}

module.exports = { swaggerDocs };
