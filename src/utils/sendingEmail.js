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
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
                <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 20px; 
                            border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
                    <h2 style="color: #004250; text-align: center;">Your OTP Code</h2>
                    <p style="font-size: 16px; text-align: center;">
                        Use the OTP below to verify your account. This code will expire in 
                        <strong>60 seconds</strong>.
                    </p>
                    <div style="font-size: 22px; font-weight: bold; text-align: center; 
                                padding: 15px; background: #004250; color: #ffffff; border-radius: 5px;">
                        ${otp}
                    </div>
                    <p style="font-size: 14px; text-align: center; color: #888;">
                        If you did not request this, please ignore this email.
                    </p>
                </div>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending OTP email:", error);
    }
};

module.exports = sendOTPEmail;
