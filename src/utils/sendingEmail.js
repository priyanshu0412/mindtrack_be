const nodemailer = require("nodemailer");

const sendOTPEmail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP code is ${otp}. It expires in 60 seconds.`,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending OTP email:", error);
    }
};

module.exports = sendOTPEmail;
