const express = require("express");
const router = express.Router();
const { sendPasswordResetOTPEmail, resetUserPassword, checkValid} = require('../controllers/forgot_passwordController');

// Password reset request
router.post("/", async(req, res) => {
    try {
        const{email} = req.body;
        if(!email)
            throw Error("An email is required.");

        const createdPasswordResetOTP = await sendPasswordResetOTPEmail(email);

        return res.status(200).json({
            "msg": "Request Password Reset, Please Check your email!",
            "createdPasswordResetOTP": createdPasswordResetOTP,
        });

    } catch(error) {
        return res.status(400).json({
            "msg": error.message,
        });
    }
});

// 
router.post("/reset", async(req, res) => {
    try {
        let {email, otp, newPassword} = req.body;
        if(!(email && otp && newPassword))
            throw Error("Empty credentials are not allowed.");

        const user = await resetUserPassword({
            email, 
            otp, 
            newPassword
        });

        return res.status(200).json({
            success: true,
            email: email,
            msg: "Create new password successfully.",
            password_reset: true,
            user_id: user.id,
            token: user.token,
        });
    } catch(error) {
        return res.status(400).json({
            success: false,
            "msg": error.message,
        });
    }
});

router.post("/check_valid_digit", async(req, res) => {
    try {
        let {email, otp} = req.body;
        if(!(email && otp))
            throw Error("Empty credentials are not allowed.");

        await checkValid({
            email, 
            otp
        });

        return res.status(200).json({
            success: true,
            "msg": "Verify successfully, next create new password.",
            email: email,
            otp: otp,
        });
    } catch(error) {
        return res.status(400).json({
            success: false,
            "msg": error.message,
        });
    }
});

module.exports = router;