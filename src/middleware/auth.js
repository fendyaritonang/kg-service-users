const jwt = require('jsonwebtoken');
const moment = require('moment');
const logging = require('../utils/logging');

const decodeToken = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  /*
  {
    _id: '5fcf8acd2a1a9724aca90869',
    email: 'user@gmaaail.com',
    name: 'user',
    language: 'english',
    iat: 1607515982,
    exp: 1607519582
  }
  */
  return decoded;
};

const tokenAgeMinutes = (token) => {
  const tokenData = decodeToken(token);
  const tokenIssueDate = moment.unix(tokenData.iat);
  const currentDate = moment();
  const duration = moment.duration(currentDate.diff(tokenIssueDate));
  return duration.asMinutes();
};

const isTokenExpired = (token) => {
  const tokenAge = tokenAgeMinutes(token);
  if (tokenAge > 30) {
    // 30 minutes
    return true;
  }
  return false;
};

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');

    // Check token expiration
    if (isTokenExpired(token)) {
      throw new Error();
    }

    const tokenData = decodeToken(token);
    req.token = token;
    req.user = {
      _id: tokenData._id,
      email: tokenData.email,
      name: tokenData.name,
      language: tokenData.language,
    };
    next();
  } catch (e) {
    console.log(e.toString());
    res.status(401).send('Please authenticate!');
  }
};

module.exports = { auth, decodeToken };
