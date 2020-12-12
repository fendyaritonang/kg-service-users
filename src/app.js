const express = require('express');
const mongoose = require('./db/mongoose');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const userRouter = require('./routers/user');
const cors = require('cors');
const BRAND_SHORT = process.env.BRAND_SHORT || 'Ompusunggu';

let app = express();
app.mongoose = mongoose;
app.use(cors());

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: `${BRAND_SHORT} User Service`,
      description: `Documentation of ${BRAND_SHORT} User Service API`,
      contact: {
        name: BRAND_SHORT,
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

app.use(express.json());
app.use(userRouter);

module.exports = app;
