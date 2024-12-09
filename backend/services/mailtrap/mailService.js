const { PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE } = require("./emailTemplates");
const { mailtrapClient, sender } = require("../../config/mailtrap.config");

const sendPasswordResetEmail = async (email, resetUrl) => {
  try {
    const recipients = [ email ];

    const response = await mailtrapClient.sendMail({
        from: sender,
        to: recipients,
        subject: "Reset your password",
        html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetUrl),
        category: "Password Reset"
    });

    console.log('response', response);
  } catch (error) {
      console.error("Error sending password reset email:", error);
      throw error;
  }
};

const sendResetSuccessEmail = async (email) => {
  try {
    const recipients = [ email ];

    const response = await mailtrapClient.sendMail({
        from: sender,
        to: recipients,
        subject: "Password Reset Successful",
        html: PASSWORD_RESET_SUCCESS_TEMPLATE,
        category: "Password Reset"
    });

    console.log('response', response);
    } catch (error) {
        console.error("Error sending password reset success email:", error);
        throw error;
    }
};

module.exports = { sendPasswordResetEmail, sendResetSuccessEmail };