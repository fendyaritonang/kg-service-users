const jwt = require('jsonwebtoken');
const defaultUser = testHelper.defaultUser;

describe('Authentication test script', () => {
  beforeAll(async () => {
    await testHelper.truncateUserTable();
    await testHelper.createUser();
  }, 10000);

  test('Login with correct username and password should success with correct token TTL', async () => {
    const res = await testHelper.userLogin({
      email: defaultUser.email,
      password: defaultUser.password,
    });
    const tokenData = jwt.verify(res.body.token, process.env.JWT_SECRET);
    const from = parseInt(tokenData.iat);
    const to = parseInt(tokenData.exp);
    const duration = to - from;

    expect(duration).toEqual(900); // token time to live must be 3600 seconds (15 mins)
    expect(res.statusCode).toEqual(200);
  }, 10000);

  test('Login with incorrect username and password should fail', async () => {
    const res = await testHelper.userLogin({
      email: defaultUser.email,
      password: 'xxxx',
    });
    expect(res.statusCode).toEqual(400);
  }, 10000);

  test('Refreshing token with valid token should success', async () => {
    const res = await testHelper.userLogin({
      email: defaultUser.email,
      password: defaultUser.password,
    });
    const refreshResult = await testHelper.tokenRefresh(res.body.token);

    expect(refreshResult.statusCode).toEqual(200);
  }, 10000);

  test('Refreshing token with invalid token should fail', async () => {
    const res = await testHelper.userLogin({
      email: defaultUser.email,
      password: defaultUser.password,
    });
    const refreshResult = await testHelper.tokenRefresh(res.body.token + 'xxx');

    expect(refreshResult.statusCode).toEqual(401);
  }, 10000);

  test('Logout with correct authorization token should success', async () => {
    const res = await testHelper.userLogin({
      email: defaultUser.email,
      password: defaultUser.password,
    });
    const logoutResult = await testHelper.userLogout(res.body.token);
    // to ensure the token is no longer exist
    const userResult = await testHelper.userDataByEmail({
      email: defaultUser.email,
      'tokens.token': res.body.token,
    });

    let userResultExist = !userResult ? false : true;
    expect(userResultExist).toEqual(false);
    expect(logoutResult.statusCode).toEqual(200);
  }, 10000);

  afterAll(async (done) => {
    // Closing the DB connection allows Jest to exit successfully.
    testHelper.closeMongoose();
    done();
  });
});
