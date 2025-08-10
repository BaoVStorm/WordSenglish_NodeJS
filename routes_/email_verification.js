const express = require("express");
const router = express.Router();
const {sendVerificationOTPEmail, verifyUserEmail} = require('../controllers/email_verificationController');

// verify otp
router.post("/verify", async(req, res) => {
    try {
        let{email, otp} = req.body;

        if(!(email && otp))
            throw Error("Empty OTP details are not allowed");

        await verifyUserEmail({email, otp});
        
        return res.status(200).json({
            success: true,
            email: email,
            verified: true,
        });

    } catch(error) {
        return res.status(400).json({
            success: false,
            "msg": error.message,
        });
    }
});

// request new verification otp
router.post("/", async(req, res) => {
    try {
        const {email} = req.body;
        if(!email)
            throw Error("An email is required!");

        const createEmailVerOTP = await sendVerificationOTPEmail(email);

        return res.status(200).json({
            "msg": "Resend Successfully, Please Check your email!",
            "createEmailVerOTP": createEmailVerOTP,
        });
    } catch(error) {
        return res.status(400).json({
            "msg": error.message,
        });
    }
})

module.exports = router;