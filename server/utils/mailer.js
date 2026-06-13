const nodemailer = require('nodemailer');

let transporter;

// Helper to get or initialize transporter
const getTransporter = async () => {
  if (transporter) return transporter;

  const isConfigured = 
    process.env.EMAIL_USER && 
    process.env.EMAIL_USER !== 'placeholder-email@gmail.com' &&
    process.env.EMAIL_PASS &&
    process.env.EMAIL_PASS !== 'placeholder-password';

  if (isConfigured) {
    console.log('Using configured SMTP settings from .env');
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    console.log('No custom email configured in .env. Initializing Ethereal test account...');
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`Ethereal SMTP user created: ${testAccount.user}`);
    } catch (err) {
      console.error('Failed to create Ethereal test account:', err);
      throw err;
    }
  }

  return transporter;
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transport = await getTransporter();
    const mailOptions = {
      from: `"Pizza Delivery Support" <${process.env.EMAIL_USER || 'no-reply@pizzadeliver.com'}>`,
      to,
      subject,
      html,
    };

    const info = await transport.sendMail(mailOptions);
    console.log(`Message sent: ${info.messageId}`);
    
    // If using Ethereal, log the preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`✉️ Ethereal Mail Preview URL: ${previewUrl}`);
    }
    return { success: true, info, previewUrl };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
};

module.exports = { sendEmail };
