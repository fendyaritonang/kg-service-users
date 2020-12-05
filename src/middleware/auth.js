const jwt = require('jsonwebtoken');
const User = require('../models/user');
const moment = require('moment');
const logging = require('../utils/logging');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decoded._id,
      'tokens.token': token,
    });

    if (!user) {
      throw new Error();
    }

    // Check token expiration
    const obj = user.tokens.filter((item) => {
      return item.token === token;
    });
    const activeDate = moment(obj[0].activeDate);
    const currentDate = moment();
    const duration = moment.duration(currentDate.diff(activeDate));

    // Force logout if user has been idle for more than 30 minutes
    if (duration.asMinutes() >= 30) {
      user.tokens = user.tokens.filter((item) => {
        return item.token !== token;
      });
      await user.save();
      throw new Error();
    }

    // Resetting the active date
    await User.updateOne(
      { _id: decoded._id, 'tokens.token': token },
      { $set: { 'tokens.$.activeDate': moment().format() } }
    );

    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

module.exports = auth;
