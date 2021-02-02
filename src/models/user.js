const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const moment = require('moment');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Email is invalid.');
        }
      },
    },
    language: {
      type: String,
      required: true,
      default: 'english', // english
    },
    password: {
      type: String,
      required: true,
      minlength: 7,
      trim: true,
      validate(value) {
        if (value.toLowerCase().includes('password')) {
          throw new Error('Password cannot contain "password"');
        }
      },
    },
    status: {
      type: Number,
      default: 2, // pending verification
    },
    role: {
      type: Number,
      default: 2, // 1: admin, 2: user
    },
    verificationToken: {
      type: String,
    },
    passwordResetToken: {
      type: String,
    },
    loginAttempt: {
      type: Number,
      default: 0,
    },
    loginLastFailed: {
      type: Date,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;
  delete userObject.verificationToken;
  delete userObject.passwordResetToken;

  return userObject;
};

userSchema.methods.generateAuthToken = async function (res) {
  const user = this;
  const data = {
    _id: user._id.toString(),
    email: user.email,
    name: user.name,
    language: user.language,
    role: user.role,
  };
  const token = jwt.sign({ ...data }, process.env.JWT_SECRET, {
    expiresIn: 60 * 15, // 15 mins
  });

  user.tokens = user.tokens.concat({ token });
  await user.save();

  res.cookie('jwt', token, {
    maxAge: 1200000, // 20 minutes
    httpOnly: true,
    secure: true,
  });

  return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
  // only confirmed user who can login
  const user = await User.findOne({ email, status: 1 });

  if (!user) {
    throw new Error('user account not found');
  }

  const thresholdMinute = 15;
  let loginAttempt = user.loginAttempt || 0;
  const lastLoginFailed = user.loginLastFailed || moment().utc().format();
  const duration = moment
    .duration(moment().diff(moment(lastLoginFailed)))
    .asMinutes();

  if (duration < thresholdMinute && loginAttempt > 5) {
    throw new Error('maximum login attempt has reached threshold');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    if (duration >= thresholdMinute) {
      loginAttempt = 0;
    }
    user.loginAttempt = loginAttempt + 1;
    user.loginLastFailed = moment().utc().format();
    await user.save();
    throw new Error('invalid username or password');
  }

  user.loginAttempt = 0;
  user.loginLastFailed = null;
  await user.save();

  return user;
};

userSchema.statics.removeToken = async (userObject, tokenToRemove) => {
  userObject.tokens = userObject.tokens.filter((token) => {
    return token.token !== tokenToRemove;
  });
  await userObject.save();
};

// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
