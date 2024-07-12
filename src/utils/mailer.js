import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false,
  auth: {
    user: "rusty.stokes@ethereal.email",
    pass: "3NE586eDPmfMGpBrZD",
  },
});

const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: "rusty.stokes@ethereal.email",
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}`,
  };

  return await transporter.sendMail(mailOptions);
};

export { sendOTPEmail };
