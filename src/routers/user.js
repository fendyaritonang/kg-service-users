const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/auth');
const router = new express.Router();
const cryptoRandom = require('crypto-random-string');
const { sendEmailConfirmation, sendForgotPassword } = require('../utils/mail');
const logging = require('../utils/logging');
const jwt = require('jsonwebtoken');

/**
 * @swagger
 * definitions:
 *  User:
 *      type: "object"
 *      properties:
 *          status:
 *              type: "integer"
 *              example: "1"
 *          _id:
 *              type: "string"
 *              example: "5ebe3126f2c8bd30b8525166"
 *          name:
 *              type: "string"
 *              example: "user1"
 *          email:
 *              type: "string"
 *              format: "email"
 *              example: "user@gmaaail.com"
 *          language:
 *              type: "string"
 *              example: "english"
 *          createdAt:
 *              type: "string"
 *              example: "2020-05-15T06:05:26.650Z"
 *          updatedAt:
 *              type: "string"
 *              example: "2020-05-15T06:05:26.650Z"
 */

/**
 * @swagger
 * /v1/users/register:
 *  post:
 *      summary: User registration
 *      description: Endpoint to allow user to do self registration. Email confirmation will be sent to user's email address to confirm the registration
 *      parameters:
 *          -   in: "body"
 *              name: "body"
 *              required: true
 *              schema:
 *                  type: "object"
 *                  required:
 *                  -   "name"
 *                  -   "email"
 *                  -   "password"
 *                  properties:
 *                      name:
 *                          type: "string"
 *                          example: "user"
 *                      email:
 *                          type: "string"
 *                          format: "email"
 *                          example: "user@gmaaail.com"
 *                      password:
 *                          type: "string"
 *                          format: "password"
 *                          example: "P_Ssword!"
 *                      registrationConfirmationURL:
 *                          type: "string"
 *                          example: "https://<your_url>"
 *      responses:
 *          '201':
 *              description: Successfully created a new user. Confirmation email will be sent shortly.
 *              schema:
 *                  type: "object"
 *                  properties:
 *                      user:
 *                          type: "object"
 *                          $ref: "#/definitions/User"
 *                      emailRegistrationSuccessful:
 *                          type: "boolean"
 *                          example: true
 *          '400':
 *              description: Error, invalid input
 */

router.post('/v1/users/register', async (req, res) => {
  const user = new User(req.body);
  const verificationToken = cryptoRandom({ length: 16 });
  user.verificationToken = verificationToken;

  try {
    await user.save();

    const url = req.body.registrationConfirmationURL + `/${verificationToken}`;
    const mailResult = await sendEmailConfirmation({
      email: user.email,
      registrationConfirmationURL: url,
    });

    res.status(201).send({ user, emailRegistrationSuccessful: mailResult });
  } catch (e) {
    logging.routerErrorLog(req, e.toString());
    res.status(400).send(e);
  }
});

/**
 * @swagger
 * /v1/users/login:
 *  post:
 *      summary: User login
 *      description: Endpoint to authenticate the user
 *      parameters:
 *          -   in: "body"
 *              name: "body"
 *              required: true
 *              schema:
 *                  type: "object"
 *                  required:
 *                  -   "name"
 *                  -   "email"
 *                  -   "password"
 *                  properties:
 *                      email:
 *                          type: "string"
 *                          format: "email"
 *                          example: "user@gmaaail.com"
 *                      password:
 *                          type: "string"
 *                          format: "password"
 *                          example: "P_Ssword!"
 *      responses:
 *          '200':
 *              description: User was successfully authenticated
 *              schema:
 *                  type: "object"
 *                  properties:
 *                      user:
 *                          type: "object"
 *                          $ref: "#/definitions/User"
 *                      token:
 *                          type: "string"
 *                          example: "5ebe3126f2c8bd30b8525166"
 *          '400':
 *              description: Error, invalid input
 */
router.post('/v1/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    logging.routerErrorLog(req, e.toString());
    res.status(400).send(e.toString());
  }
});

/**
 * @swagger
 * /v1/users/token/refresh/{token}:
 *  patch:
 *      summary: Refresh user's authentication token
 *      description: Refresh user's authentication token
 *      parameters:
 *          -   in: "path"
 *              name: "token"
 *              description: "Authentication token"
 *              required: true
 *              type: "string"
 *      responses:
 *          '200':
 *              description: Token was successfully refreshed
 *              schema:
 *                  type: "object"
 *                  properties:
 *                      newtoken:
 *                          type: "string"
 *                          example: "5ebe3126f2c8bd30b8525166"
 *          '400':
 *              description: Error, invalid input
 */
router.patch('/v1/users/token/refresh/:token', async (req, res) => {
  try {
    const oldToken = req.params.token;
    const tokenData = jwt.verify(oldToken, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: tokenData._id, status: 1 });

    if (!user) {
      throw new Error('Invalid token');
    }

    // remove current token
    await User.removeToken(user, oldToken);

    // generate new token
    const newToken = await user.generateAuthToken();

    res.send({ newtoken: newToken });
  } catch (e) {
    logging.routerErrorLog(req, e.toString());
    res.status(400).send(e.toString());
  }
});

/**
 * @swagger
 * /v1/users/logout:
 *  post:
 *      summary: User logout
 *      description: Endpoint to logout the user
 *      responses:
 *          '200':
 *              description: User was successfully logged out
 *          '500':
 *              description: Error, unable to logout the user
 *      security:
 *      -   JWT: []
 */
router.post('/v1/users/logout', auth, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user._id });

    if (!user) {
      throw new Error('Unable to logout the user');
    }

    // logout the user
    await User.removeToken(user, req.token);

    res.send();
  } catch (e) {
    logging.routerErrorLog(req, e.toString());
    res.status(500).send(e.toString());
  }
});

/**
 * @swagger
 * /v1/users/logoutAll:
 *  post:
 *      summary: User logout from all devices
 *      description: Endpoint to logout user from all devices
 *      responses:
 *          '200':
 *              description: User was successfully logged out from all devices
 *          '500':
 *              description: Error, unable to logout the user
 *      security:
 *      -   JWT: []
 */
router.post('/v1/users/logoutAll', auth, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user._id });
    user.tokens = [];
    await user.save();

    res.send();
  } catch (e) {
    logging.routerErrorLog(req, e.toString());
    res.status(500).send();
  }
});

/**
 * @swagger
 * /v1/users/me:
 *  get:
 *      summary: Get user profile who currently logged in
 *      description: Get user profile who currently logged in
 *      responses:
 *          '200':
 *              description: Successfully retrieved user profile who currently logged in
 *              schema:
 *                  type: "object"
 *                  $ref: "#/definitions/User"
 *          '401':
 *              description: Error, user is not authenticated
 *      security:
 *      -   JWT: []
 */
router.get('/v1/users/me', auth, async (req, res) => {
  res.send(req.user);
});

/**
 * @swagger
 * /v1/users/me:
 *  patch:
 *      summary: Update user profile who currently logged in
 *      description: Update user profile who currently logged in
 *      parameters:
 *          -   in: "body"
 *              name: "body"
 *              required: true
 *              schema:
 *                  type: "object"
 *                  required:
 *                  -   "name"
 *                  -   "email"
 *                  -   "password"
 *                  properties:
 *                      name:
 *                          type: "string"
 *                          format: "name"
 *                          example: "user"
 *                      language:
 *                          type: "string"
 *                          example: "english"
 *      responses:
 *          '200':
 *              description: Successfully modified user profile who currently logged in
 *              schema:
 *                  type: "object"
 *                  $ref: "#/definitions/User"
 *          '400':
 *              description: Error, invalid update
 *          '401':
 *              description: Error, user is not authenticated
 *      security:
 *      -   JWT: []
 */
router.patch('/v1/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'language'];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  try {
    if (!isValidOperation) {
      throw new Error('Invalid update!');
    }
    const user = await User.findOne({
      email: req.user.email,
    });
    updates.forEach((update) => (user[update] = req.body[update]));
    await user.save();
    res.send(user);
  } catch (e) {
    logging.routerErrorLog(req, e.toString());
    res.status(400).send(e.toString());
  }
});

/*router.delete('/users/me', auth, async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (e) {
    res.status(500).send(e);
  }
});*/

/**
 * @swagger
 * /v1/users/verifyRegistration/{token}:
 *  patch:
 *      summary: Update user profile who currently logged in
 *      description: Update user profile who currently logged in
 *      parameters:
 *          -   in: "path"
 *              name: "token"
 *              description: "Registration token"
 *              required: true
 *              type: "string"
 *      responses:
 *          '200':
 *              description: User registration has been successfully confirmed
 *              schema:
 *                  type: "object"
 *                  $ref: "#/definitions/User"
 *          '404':
 *              description: Error, invalid registration confirmation
 */
router.patch('/v1/users/verifyRegistration/:token', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { verificationToken: req.params.token, status: 2 },
      { status: 1 },
      { new: true }
    );

    if (!user) {
      throw new Error('Invalid registration confirmation!');
    }

    res.send(user);
  } catch (e) {
    logging.routerErrorLog(req, e.toString());
    res.status(404).send(e.toString());
  }
});

/**
 * @swagger
 * /v1/users/password:
 *  patch:
 *      summary: Change password of user who currently logged in
 *      description: Change password of user who currently logged in
 *      parameters:
 *          -   in: "body"
 *              name: "body"
 *              required: true
 *              schema:
 *                  type: "object"
 *                  properties:
 *                      passwordold:
 *                          type: "string"
 *                          format: "password"
 *                          example: "P@ssw0rdXXX"
 *                      passwordnew:
 *                          type: "string"
 *                          format: "password"
 *                          example: "P@ssw0rdYYY"
 *      responses:
 *          '200':
 *              description: Password has been changed successfully
 *          '400':
 *              description: Error, invalid update
 *      security:
 *      -   JWT: []
 */
router.patch('/v1/users/password', auth, async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.user.email,
      req.body.passwordold
    );
    if (!user) {
      throw new Error('Invalid update!');
    }

    user.password = req.body.passwordnew;
    await user.save();

    res.send();
  } catch (e) {
    console.log(e.toString());
    res.status(400).send(e.toString());
  }
});

/**
 * @swagger
 * /v1/users/forgotpassword:
 *  post:
 *      summary: Initiate forgot password functionality by sending an email that contain link to reset password
 *      description: To allow user to reset password without authorization through forgot password functionality. Please only replace <your_url> with the URL of your forgot password, and leave the rest the same (i.e. do not remove anything except to replace <your_url> placeholder). Then please create a new route <your_url>/{resetPasswordToken} which will call password end point. Please see /v1/users/self/resetpassword/{token} end point.
 *      parameters:
 *          -   in: "body"
 *              name: "body"
 *              required: true
 *              schema:
 *                  type: "object"
 *                  properties:
 *                      email:
 *                          type: "string"
 *                          format: "email"
 *                          example: "user@gmaaail.com"
 *                      forgotPasswordURL:
 *                          type: "string"
 *                          example: "https://<your_url>"
 *      responses:
 *          '200':
 *              description: Forgot password has been initiated successfully, and email to reset the password had been sent
 *              schema:
 *                  type: "object"
 *                  properties:
 *                      resetPasswordToken:
 *                          type: "string"
 *                          example: "5ebe3126f2c8bd30b8525166"
 *                      emailSuccessful:
 *                          type: "boolean"
 *                          example: true
 *          '404':
 *              description: Error, email is not found
 */
router.post('/v1/users/forgotpassword', async (req, res) => {
  const resetPasswordToken = cryptoRandom({ length: 16 });
  try {
    const user = await User.findOneAndUpdate(
      { email: req.body.email },
      { passwordResetToken: resetPasswordToken }
    );

    if (!user) {
      logging.routerErrorLog(req, 'Invalid user');
      return res.status(404).send();
    }

    const url = req.body.forgotPasswordURL + `/${resetPasswordToken}`;
    const mailResult = await sendForgotPassword({
      email: user.email,
      forgotPasswordURL: url,
    });

    res.send({
      resetPasswordToken,
      emailSuccessful: !mailResult ? 'failed' : 'successful',
    });
  } catch (e) {
    logging.routerErrorLog(req, e.toString());
    res.status(400).send(e.toString());
  }
});

/**
 * @swagger
 * /v1/users/resetpassword/{token}:
 *  patch:
 *      summary: Reset user password
 *      description: Reset user password through a link that is sent to user's email address
 *      parameters:
 *          -   in: "path"
 *              name: "token"
 *              description: "Reset Password token"
 *              required: true
 *              type: "string"
 *          -   in: "body"
 *              name: "body"
 *              required: true
 *              schema:
 *                  type: "object"
 *                  properties:
 *                      password:
 *                          type: "string"
 *                          format: "password"
 *                          example: "P@ssw0rdYYY"
 *      responses:
 *          '200':
 *              description: Password has bee reset successfully
 *          '400':
 *              description: Error, invalid update
 *          '500':
 *              description: Error, failed to change the password
 */
router.patch('/v1/users/resetpassword/:token', async (req, res) => {
  try {
    const user = await User.findOne({ passwordResetToken: req.params.token });

    if (!user) {
      logging.routerErrorLog(req, 'Invalid update');
      return res.status(404).send();
    }

    user.password = req.body.password;
    user.passwordResetToken = null;
    await user.save();

    res.send();
  } catch (e) {
    logging.routerErrorLog(req, e.toString());
    res.status(500).send(e);
  }
});

module.exports = router;
