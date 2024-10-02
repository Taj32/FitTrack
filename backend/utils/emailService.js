import nodemailer from 'nodemailer';

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // e.g., "smtp.gmail.com"
    port: 587, // Common port for TLS
    secure: false, // true for 465, false for other ports
    auth: {
        user: "tajvirchahal87@gmail.com",
        pass: "wppb vaid rtjp znjl"
    }
});

export const sendVerificationEmail = async (email, token) => {
    // The URL should point to your frontend route that handles verification
    const verificationLink = `https://gym-api-hwbqf0gpfwfnh4av.eastus-01.azurewebsites.net/auth/verify/${token}`;

    const mailOptions = {
        from: '"Your App Name" <tajvirchahal87@gmail.com>',
        to: email,
        subject: "Verify Your Email",
        html: `
            <h1>Email Verification</h1>
            <p>Please click the link below to verify your email address:</p>
            <a href="${verificationLink}">${verificationLink}</a>
            <p>If you didn't request this, you can safely ignore this email.</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully');
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw error;
    }
};

export const sendWorkoutReminderEmail = async (toEmail, fromName) => {
    const mailOptions = {
        from: '"Your App Name" <tajvirchahal87@gmail.com>',
        to: toEmail,
        subject: "Workout Reminder from Your Friend",
        html: `
            <h1>Workout Reminder</h1>
            <p>Your friend ${fromName} is reminding you to workout today!</p>
            <p>Stay motivated and keep up the good work!</p>
            <p>If you've already worked out today, great job!</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Workout reminder email sent successfully');
    } catch (error) {
        console.error('Error sending workout reminder email:', error);
        throw error;
    }
};

// // Optional: Function to send password reset emails
// export const sendPasswordResetEmail = async (email, resetToken) => {
//     const resetLink = `https://yourdomain.com/reset-password/${resetToken}`;

//     const mailOptions = {
//         from: '"Your App Name" <tajvirchahal87@gmail.com>',
//         to: email,
//         subject: "Password Reset Request",
//         html: `
//             <h1>Password Reset</h1>
//             <p>You requested a password reset. Click the link below to reset your password:</p>
//             <a href="${resetLink}">${resetLink}</a>
//             <p>If you didn't request this, you can safely ignore this email.</p>
//         `
//     };

//     try {
//         await transporter.sendMail(mailOptions);
//         console.log('Password reset email sent successfully');
//     } catch (error) {
//         console.error('Error sending password reset email:', error);
//         throw error;
//     }
// };