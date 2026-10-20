const userModel=require('../models/user.model')
const otpModel=require('../models/otp.model')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const {sendOTPEmail}=require('../utils/email.utils')
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

async function authRegister  (req, res) {
    try {
        console.log("REGISTER CONTROLLER CALLED");
        const { name, email, password, role } = req.body;
        let user = await userModel.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await userModel.create({
            name,
            email,
            password: hashedPassword,
            role: 'user', // Hardcoded to prevent frontend passing role
            isVerified: false
        });

        const otp = generateOTP();
        
        const savedOtp=await otpModel.create({ email, otp, action: 'account_verification' });

        
        await sendOTPEmail(email, otp, 'account_verification');

        res.status(201).json({
            message: 'OTP sent to email. Please verify.',
            email: user.email
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

async function authLogin (req, res) {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        if (!user.isVerified && user.role !== 'admin') {
            const otp = generateOTP();
            await otpModel.findOneAndDelete({ email: user.email, action: 'account_verification' });
            await otpModel.create({ email: user.email, otp, action: 'account_verification' });
            await sendOTPEmail(user.email, otp, 'account_verification');
            return res.status(403).json({ message: 'Account not verified', needsVerification: true, email: user.email });
        }

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id, user.role)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

async function verifyOTP (req, res)  {
    try {
        const { email, otp } = req.body;


const records = await otpModel.find({ email: email });
    
        const validOTP = await otpModel.findOne({ email, otp, action: 'account_verification' });
        console.log("otp record found ",validOTP);
        
        if (!validOTP) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const user = await userModel.findOneAndUpdate({ email }, { isVerified: true }, { new: true });
        await otpModel.deleteOne({ _id: validOTP._id }); // Delete OTP after usage

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id, user.role)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error',err:error.message });
    }
};
module.exports={authRegister,authLogin,verifyOTP}