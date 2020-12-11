const defaultUser = testHelper.defaultUser;
const testUser = testHelper.testUser;

describe('User test script', () => {
  beforeAll(async () => {
    await testHelper.truncateUserTable();
    await testHelper.createUser();
  }, 10000);

  test('Registration with correct data should success', async () => {
    const res = await testHelper.userRegistration({
      ...testUser,
      registrationConfirmationURL: 'http://wwww.gmaaail.com',
    });

    const userResult = await testHelper.userDataByEmail({
      email: testUser.email,
    });
    const confirmationResult = await testHelper.userRegistrationConfirmation(
      userResult.verificationToken
    );

    expect(userResult.status).toEqual(2);
    expect(confirmationResult.body.status).toEqual(1);
    expect(res.statusCode).toEqual(201);
  }, 15000);

  test('Registration with duplicate email should fail', async () => {
    const res = await testHelper.userRegistration({
      ...defaultUser,
      registrationConfirmationURL: 'http://wwww.gmaaail.com',
    });

    expect(res.statusCode).toEqual(400);
  }, 15000);

  test('Getting user info based on correct token information should success', async () => {
    const auth = await testHelper.userLogin({
      email: defaultUser.email,
      password: defaultUser.password,
    });
    const token = auth.body.token;
    const userInfo = await testHelper.userGet(token);

    expect(auth.statusCode).toEqual(200);
    expect(userInfo.statusCode).toEqual(200);
    expect(userInfo.body.email).toEqual('user@gmaaail.com');
  }, 10000);

  test('Updating user info based on correct token information should success', async () => {
    const auth = await testHelper.userLogin({
      email: defaultUser.email,
      password: defaultUser.password,
    });
    const token = auth.body.token;
    const userUpdate = await testHelper.userUpdate(token, {
      name: 'John Doe',
      language: 'Indonesia',
    });
    const userResult = await testHelper.userDataByEmail({
      email: defaultUser.email,
    });

    expect(auth.statusCode).toEqual(200);
    expect(userUpdate.statusCode).toEqual(200);
    expect(userResult.name).toEqual('John Doe');
  }, 10000);

  test('Updating user info other than name and language should fail', async () => {
    const auth = await testHelper.userLogin({
      email: defaultUser.email,
      password: defaultUser.password,
    });
    const token = auth.body.token;
    const userUpdate = await testHelper.userUpdate(token, {
      name: 'John Doe',
      language: 'Indonesia',
      email: 'testing@yahoooo.com',
    });

    expect(auth.statusCode).toEqual(200);
    expect(userUpdate.statusCode).toEqual(400);
  }, 10000);

  test('Changing user password based on correct token information should success', async () => {
    const auth1 = await testHelper.userLogin({
      email: testUser.email,
      password: testUser.password,
    });
    const token = auth1.body.token;
    const userUpdate = await testHelper.userChangePassword(token, {
      passwordold: testUser.password,
      passwordnew: 'Th1sIsNewPassw0rd',
    });
    const auth2 = await testHelper.userLogin({
      email: testUser.email,
      password: 'Th1sIsNewPassw0rd',
    });

    expect(auth1.statusCode).toEqual(200);
    expect(auth2.statusCode).toEqual(200);
    expect(userUpdate.statusCode).toEqual(200);
  }, 10000);

  test('Initiate forgot password and reset password based on correct token should success', async () => {
    const forgotPassword = await testHelper.userForgotPassword({
      email: testUser.email,
      forgotPasswordURL: 'https://www.gmaaail.com',
    });
    const resetPasswordToken = forgotPassword.body.resetPasswordToken;
    const newPassword = 'ThisIsAnotherPassw00rd';
    const userResetPassword = await testHelper.userResetPassword(
      resetPasswordToken,
      { password: newPassword }
    );
    const auth = await testHelper.userLogin({
      email: testUser.email,
      password: newPassword,
    });

    expect(forgotPassword.statusCode).toEqual(200);
    expect(userResetPassword.statusCode).toEqual(200);
    expect(auth.statusCode).toEqual(200);
  }, 10000);

  afterAll(async (done) => {
    // Closing the DB connection allows Jest to exit successfully.
    testHelper.closeMongoose();
    done();
  });
});
