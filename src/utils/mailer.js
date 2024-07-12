import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  // host: "smtp.gmail.com",
  service: "gmail",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SENDER_MAIL_ID,
    pass: process.env.SENDER_MAIL_PASSWORD,
  },
});

const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.SENDER_MAIL_ID,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}`,
  };

  return await transporter.sendMail(mailOptions);
};

export { sendOTPEmail };
