const sendForgotPassword = async ({ email, forgotPasswordURL }) => {
  return true;
};

const sendEmailConfirmation = async ({
  email,
  registrationConfirmationURL,
}) => {
  return true;
};

module.exports = { sendEmailConfirmation, sendForgotPassword };
