const nodemailer = require("nodemailer");

const sendEmailResetPass = async (email, resetLink) => {
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
        subject: "Reset Password Link",
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
                <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 20px; 
                            border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
                    <h2 style="color: #004250; text-align: center;">Password Reset Request</h2>
                    <p style="font-size: 16px; text-align: center;">
                        You requested a password reset. Click the button below to reset your password.
                    </p>
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="${resetLink}" target="_blank" 
                            style="background: #004250; color: #ffffff; text-decoration: none; 
                                   padding: 12px 20px; font-size: 16px; border-radius: 5px; display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    <p style="font-size: 14px; text-align: center; color: #888;">
                        If you didn't request this, please ignore this email.
                    </p>
                </div>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending password reset email:", error);
    }
};

module.exports = sendEmailResetPass;
