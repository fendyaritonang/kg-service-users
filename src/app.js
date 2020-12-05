const express = require('express');
const mongoose = require('./db/mongoose');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const userRouter = require('./routers/user');
const cors = require('cors');

let app = express();
app.mongoose = mongoose;
app.use(cors());

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'KG User Service',
      description: 'Documentation of KG User Service API',
      contact: {
        name: 'KG',
      },
    },
    securityDefinitions: {
      JWT: {
        description:
          'Please copy and paste the token with prefix "Bearer " in input box.',
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
      },
    },
  },
  apis: ['src/routers/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
// Swagger UI for localhost
app.use('/users-api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Expose an endpoint for swagger.json, needed by Ocelot API Gateway
app.use('/swagger/v1/swagger.json', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocs);
});

app.use(express.json());
app.use(userRouter);

module.exports = app;
