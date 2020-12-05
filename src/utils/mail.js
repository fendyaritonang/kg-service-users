const logging = require('../utils/logging');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SMTP_API_KEY);
const brandShort = process.env.BRAND_SHORT || 'Ompusunggu';
const brandLong = process.env.BRAND_LONG || 'Ompusunggu';

const sendForgotPassword = async ({ email, forgotPasswordURL }) => {
  try {
    if (email.split(',').length !== 1 || !forgotPasswordURL) {
      return false;
    }

    const msg = {
      to: email,
      from: process.env.SMTP_SENDER_EMAIL,
      subject: `[${brandShort}] Password Reset`,
      text: `Please click the following link to reset your password ${forgotPasswordURL}`,
      html: `<!DOCTYPE html><html><body><h1>Reset Your Password</h1><p>Please click the following link to reset your password</p><a href="${forgotPasswordURL}" target="_blank">${forgotPasswordURL}</a><br/><br/>Thank you.<br/>${brandLong}</body></html>`,
    };

    const response = await sgMail.send(msg);

    if (response[0].statusCode === 202) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    return false;
  }
};

const sendEmailConfirmation = async ({
  email,
  registrationConfirmationURL,
}) => {
  try {
    if (email.split(',').length !== 1 || !registrationConfirmationURL) {
      return false;
    }

    const msg = {
      to: email,
      from: process.env.SMTP_SENDER_EMAIL,
      subject: `[${brandShort}] Registration Confirmation`,
      text: `Please confirm your registration by clicking the following link ${registrationConfirmationURL}`,
      html: `<!DOCTYPE html><html><body><h1>Confirm you email</h1><p>Please confirm your registration by clicking on the link below</p><a href="${registrationConfirmationURL}" target="_blank">${registrationConfirmationURL}</a><br/><br/>Thank you.<br/>${brandLong}</body></html>`,
    };

    const response = await sgMail.send(msg);

    if (response[0].statusCode === 202) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    console.log(e.toString());
    return false;
  }
};

module.exports = { sendEmailConfirmation, sendForgotPassword };
