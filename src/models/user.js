const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
    verificationToken: {
      type: String,
    },
    passwordResetToken: {
      type: String,
    },
    tokens: [
      {
        issuedDate: {
          type: Date,
          required: true,
        },
        activeDate: {
          type: Date,
          required: true,
        },
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

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

  const issuedDate = Date.now();
  const activeDate = issuedDate;

  user.tokens = user.tokens.concat({ issuedDate, activeDate, token });
  await user.save();

  return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
  // only confirmed user who can login
  const user = await User.findOne({ email, status: 1 });

  if (!user) {
    throw new Error('Unable to login');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Invalid user or password');
  }

  return user;
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
