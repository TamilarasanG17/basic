// controllers/authController.js

const User = require('../models/user');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOtpEmail = (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP for Verification',
        html: `<p>Your OTP is <b>${otp}</b>. It is valid for 5 minutes.</p>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
};

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email, password });
        const otp = generateOtp();
        user.otp = otp;
        user.otpExpires = Date.now() + 300000; // 5 minutes
        await user.save();
        sendOtpEmail(email, otp);
        res.status(201).json({ message: 'User registered successfully. Please verify your OTP.', email });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }

        // OTP is valid, but now we need to handle both login and register verification
        // For a new user, isVerified is set to true. For a logged-in user, we'll issue a token.
        if (user.isVerified) {
            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save();
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return res.status(200).json({ message: 'OTP verified successfully. Login successful.', token });
        } else {
            user.isVerified = true;
            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save();
            return res.status(200).json({ message: 'OTP verified successfully. You can now log in.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error.' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // Generate and send a new OTP for every login attempt
        const otp = generateOtp();
        user.otp = otp;
        user.otpExpires = Date.now() + 300000; // 5 minutes
        await user.save();
        sendOtpEmail(email, otp);

        res.status(200).json({ message: 'Login successful. Please verify your OTP.', email });
    } catch (error) {
        res.status(500).json({ error: 'Server error.' });
    }
};