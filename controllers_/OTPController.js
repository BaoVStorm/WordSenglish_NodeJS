const OTP = require('../models/OTP');
const Users = require('../models/Users');
const nodemailer = require("nodemailer");
const {hashData, verifyHashedData} = require('../util/hashData');
const htmlEmailVerify = require('../util/getHtmlEmail');


// verifyOTP
const verifyOTP = async({email, otp}) => {
    try {
        if(!(email && otp))
            throw Error("Provide values for email, otp");

        // ensure otp recode exists
        const matchedOTPRecord = await OTP.findOne({
            email,
        });

        const {expiresAt} = matchedOTPRecord;

        // checking for expired code
        if(expiresAt < Date.now()) {
            await OTP.deleteOne({email});
            throw Error("Code has expired. Request for a new one.");
        }

        // not expired yet, verify value
        const hashedOTP = matchedOTPRecord.otp;
        const validOTP = await verifyHashedData(otp, hashedOTP);
        
        return validOTP;
    } catch(error) {
        throw error;
    }
};

// deleteOTP
const deleteOTP = async(email) => {
    try {
        await OTP.deleteOne({email});
    } catch(error) {
        throw error;
    }
}

// send OTP
const sendOTP = async ({email, subject, message, duration = 10}) => {
    try {
        if(!(email && subject && message)) {
            throw Error("Provide values for email, subject, message");
        }

        // clear any old record
        await OTP.deleteOne({email})

        // create random OTP
        let generateOTP = `${Math.floor(1000 + Math.random() * 9000)}`;

        // send mail
        const {AUTH_EMAIL, AUTH_PASS} = process.env;

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: AUTH_EMAIL,
                pass: AUTH_PASS,
            },
        });

        // test transporter
        transporter.verify((error, success) => {
            if(error) {
                console.log(error);
            } else {
                console.log("Ready for messages");
                console.log(success);
            }
        });

        // send email
        const mailOptions = {
            from: AUTH_EMAIL,
            to: email,
            subject: subject,
            text: "hello astrolingo!",
            html:  await htmlEmailVerify(generateOTP, duration),
        };
        await transporter.sendMail(mailOptions);

        // save otp record
        const hashedOTP = await hashData(generateOTP);
        const newOTP = await new OTP({
            email,
            otp: hashedOTP,
            createdAt: Date.now(),
            expiresAt: Date.now() + duration * 60 * 1000,
        });

        const createdOTPRecord = await newOTP.save();

        return createdOTPRecord;

    } catch(error) {
        throw error;
    }
};

module.exports = {sendOTP, verifyOTP, deleteOTP};

