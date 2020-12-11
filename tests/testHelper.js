jest.mock('../src/utils/mail');
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');

global.testHelper = {
  defaultUser: {
    name: 'User Name',
    email: 'user@gmaaail.com',
    password: 'P_Ssword!',
  },
  testUser: {
    name: 'Test',
    email: 'test@gmaaail.com',
    password: 'ThisisNotTheRealOne',
  },
  closeMongoose: () => {
    app.mongoose.connection.close();
  },
  truncateUserTable: async () => {
    await User.deleteMany();
  },
  createUser: async () => {
    const user = new User({
      ...testHelper.defaultUser,
      status: 1,
    });
    await user.save();
  },
  userLogin: async (data) => {
    const res = await request(app).post('/v1/users/login').send(data);
    return res;
  },
  userLogout: async (token) => {
    const res = await request(app)
      .post('/v1/users/logout')
      .set({
        authorization: `Bearer ${token}`,
      });
    return res;
  },
  userLogoutAll: async (token) => {
    const res = await request(app)
      .post('/v1/users/logoutAll')
      .set({
        authorization: `Bearer ${token}`,
      });
    return res;
  },
  tokenRefresh: async (token) => {
    const res = await request(app).patch(`/v1/users/token/refresh/${token}`);
    return res;
  },
  userRegistration: async (data) => {
    const res = await request(app).post('/v1/users/register').send(data);
    return res;
  },
  userDataByEmail: async (filter) => {
    const res = await User.findOne(filter);
    return res;
  },
  userRegistrationConfirmation: async (confirmationToken) => {
    const res = await request(app).patch(
      `/v1/users/verifyRegistration/${confirmationToken}`
    );
    return res;
  },
  userGet: async (token) => {
    const res = await request(app)
      .get(`/v1/users/me`)
      .set({
        authorization: `Bearer ${token}`,
      });
    return res;
  },
  userUpdate: async (token, data) => {
    const res = await request(app)
      .patch(`/v1/users/me`)
      .set({
        authorization: `Bearer ${token}`,
      })
      .send(data);
    return res;
  },
  userChangePassword: async (token, data) => {
    const res = await request(app)
      .patch(`/v1/users/password`)
      .set({
        authorization: `Bearer ${token}`,
      })
      .send(data);
    return res;
  },
  userForgotPassword: async (data) => {
    const res = await request(app).post(`/v1/users/forgotpassword`).send(data);
    return res;
  },
  userResetPassword: async (resettoken, data) => {
    const res = await request(app)
      .patch(`/v1/users/resetpassword/${resettoken}`)
      .send(data);
    return res;
  },
};

module.exports = testHelper;
