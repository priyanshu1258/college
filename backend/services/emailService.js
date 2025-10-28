// emailService.js - Add this later when you need real emails
import nodemailer from 'nodemailer';

const emailService = {
  transporter: null,

  init() {
    this.transporter = nodemailer.createTransporter({
      service: 'gmail', // or your email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  },

  async sendOTP(email, otp) {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP for Tech Fest Registration',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Tech Fest Chaitanya 2025</h2>
            <p>Your OTP for registration is:</p>
            <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;">
              ${otp}
            </div>
            <p>This OTP will expire in 10 minutes.</p>
            <p>If you didn't request this OTP, please ignore this email.</p>
          </div>
        `
      });
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }
};

export default emailService;