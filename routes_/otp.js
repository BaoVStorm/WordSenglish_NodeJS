const express = require("express");
const router = express.Router();
const {sendOTP, verifyOTP, deleteOTP} = require('../controllers/OTPController');

// verify OTP
router.post("/verify", async(req, res) => {
        try {
            let{email, otp} = req.body;
    
            const validOTP = await verifyOTP({email, otp});
            
            return res.status(200).json({
                success: true,
                valid: validOTP
            });

        } catch(error) {
            return res.status(400).json({
                success: false,
                "msg": error.message,
            });
    
        }
    });

// request new verification otp
router.post("/send", async(req, res) => {
    try {
        let {email, subject, message, duration} = req.body;

        // init
        if(!subject)
            subject = "ASTROLINGO: Email Verification";
        if(!message)
            message = "Verify your email with the code below.";
        if(!duration)
            duration = 10;

        const createdOTP = await sendOTP({
            email,
            subject,
            message,
            duration,
        });

        return res.status(200).json({
            "success": true,
            "msg": createdOTP
        });
    } catch(error) {
        return res.status(400).json({
            "success": false,
            "msg": error.message
        });
    }
});

module.exports = router;