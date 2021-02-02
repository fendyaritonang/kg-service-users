const jwt = require('jsonwebtoken');
const logging = require('../utils/logging');

const auth = (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    const tokenData = jwt.verify(token, process.env.JWT_SECRET);

    req.token = token;
    req.user = tokenData;
    next();
  } catch (e) {
    logging.routerErrorLog(req, e.toString());
    res.status(401).send('Please authenticate!');
  }
};

module.exports = auth;
