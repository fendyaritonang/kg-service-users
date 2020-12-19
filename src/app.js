const express = require('express');
const mongoose = require('./db/mongoose');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const userRouter = require('./routers/user');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const BRAND_SHORT = process.env.BRAND_SHORT || 'Ompusunggu';
const rateLimit = require('express-rate-limit');

let app = express();
app.mongoose = mongoose;
app.use(cors());
app.use(cookieParser());

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: `${BRAND_SHORT} User Service`,
      description: `Documentation of ${BRAND_SHORT} User Service API`,
      contact: {
        name: BRAND_SHORT,
      },
    },
  },
  apis: ['src/routers/*.js'],
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Swagger UI for localhost
app.use('/users-api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(express.json());
app.use(userRouter);

module.exports = app;
