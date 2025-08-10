const User = require('../models/Users');
const {sendOTP, verifyOTP, deleteOTP} = require('../controllers/OTPController');
const {hashData, verifyHashedData} = require('../util/hashData');

const sendPasswordResetOTPEmail = async(email) => {
    try {
        // check if an account exists
        const existingUser = await User.findOne({email});
        if(!existingUser) {
            throw  Error("There's no account for the provided email.");
        }

        if(!existingUser.verified) {
            throw Error("Email hasn't been verified yet. Check your inbox.");
        }

        const otpDetails = {
            email,
            subject: "ASTROLINGO: Password Reset",
            message: "Enter the code below to reset your password.",
            duration: 15
        };

        const createdOTP = await sendOTP(otpDetails);
        return createdOTP;
    } catch (error) {
        throw error;
    }
};

//
const resetUserPassword = async({email, otp, newPassword}) => {
    try {
        const validOTP = await verifyOTP({email, otp});
        if(!validOTP) {
            throw Error("Invalid code passed. Check your inbox.");
        }

        // now update user record with new password.
        if(newPassword.length < 8) {
            throw Error("Password is to short!")
        }
        const hashedNewPassword = await hashData(newPassword);

        let user = await User.findOne({email: email});
        user.password_hash = hashedNewPassword;
        await user.save();

        // await User.updateOne({
        //     email
        //     }, {
        //     password_hash: hashedNewPassword
        // });

        await deleteOTP(email);

        return user;
    } catch(error) {
        throw error;
    }
}

//
const checkValid = async({email, otp}) => {
    try {
        const validOTP = await verifyOTP({email, otp});
        if(!validOTP) {
            throw Error("Invalid code passed. Check your inbox.");
        }

        return;
    } catch(error) {
        throw error;
    }
}

module.exports = { sendPasswordResetOTPEmail, resetUserPassword, checkValid }