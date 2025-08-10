const jwt = require('jsonwebtoken');
const Users = require('../models/Users');
const bcryptjs = require('bcryptjs');
const {sendVerificationOTPEmail, verifyUserEmail} = require('./email_verificationController');
const { use } = require('../routes/email_verification');

// Đăng ký
exports.register = async (req, res, next) => {  
  // res.json({
  //   test: "testing"
  // });

  let {user_name, email, phone_number, password, provider} = req.body;

  user_name = user_name.trim();
  email = email.trim();
  if(phone_number)
    phone_number = phone_number.trim();
  password = password.trim();

  try{
    let user_exist = await Users.findOne({user_name: user_name});

    if(user_exist) {
      return res.status(400).json({
          success: false,
          msg: 'User already exists. Please use another username!'
      });
    }

    user_exist = await Users.findOne({email: email});

    if(user_exist) {
      return res.status(400).json({
          success: false,
          msg: 'Email already exists. Please use another Email!'
      });
    }

    let user = new Users();

    user.user_name = user_name;
    user.full_name = user_name;
    user.email = email;
    user.phone_number = phone_number;
    
    if(provider == null)
      user.provider = 'local';
    else
      user.provider = provider;

    const salt = await bcryptjs.genSalt(10);
    user.password_hash = await bcryptjs.hash(password, salt);

    await user.save();

    // verification account
    await sendVerificationOTPEmail(email);

    const payload = {
      user: {
        id: user.id
      }
    }    

    jwt.sign(payload, process.env.jwtUserSecret, {
      expiresIn: 360000
    }, (err, token) => {

      user.token = token;

      if(err) 
        throw err;

      return res.status(200).json({
        success: true,
        msg: "Register User successfully! Need verify Email",
        user_id: user.id,
        token: token,
        user: user
      });
      
    });

    await user.save();
    
    // res.json({
    //   success: true,
    //   msg: 'User registered',
    //   user: user
    // })

  } catch(err) {
    console.log(err);

    return res.status(400).json({
      success: false,
      msg: 'error'
    });
  }

  console.log(req.body);
};


// Login
exports.login = async (req, res, next) => {  
  let {user_name, password} = req.body;

  user_name = user_name.trim();
  password = password.trim();

  try {
    let user = await Users.findOne({user_name: user_name});

    if(!user) {
      user = await Users.findOne({email: user_name});

      if(!user) {
        return res.status(400).json({
          success: false,
          error_server: false,
          msg: 'Username or Email not exists!'
        });
      }
 
    }

    // check verify account
    if(!user.verified) {
      return res.status(400).json({
        success: false,
        error_server: false,
        verified: false,
        email: user.email,
        msg: "Email hasn't been verified yet. Check your inbox!"
      });
    }

    const isMatch = await bcryptjs.compare(password, user.password_hash)

    if(!isMatch) {
      return res.status(400).json({
        success: false,
        error_server: false,
        msg: 'Password is invalid!'
      });
    }

    // lưu token đăng nhập thành công
    const payload = {
      user: {
        id: user.id
      }
    }    

    jwt.sign(payload, process.env.jwtUserSecret, {
      expiresIn: 360000
    }, (err, token) => {
      if(err) throw err;

      user.token = token;

      return res.status(200).json({
        success: true,
        msg: 'User logged in!',
        user_id: user.id,
        token: token,
        user: user
      });
    });

    await user.save();

  } catch(err) {
    console.log(err.message);

    return res.status(500).json({
      success: false,
      error_server: true,
      msg: 'Server Error!'
    });
  }

};


// Get Current User
exports.getCurrentUser = async (req, res, next) => {
    try {
        const user = await Users.findById(req.user.id).select('-password_hash');

        // Nếu không tìm thấy người dùng
        if (!user) {
          return res.status(404).json({
              success: false,
              msg: 'User not found.'
          });
        } 

        // check verify account
        if(!user.verified) {
          return res.status(400).json({
            success: false,
            msg: "Email hasn't been verified yet."
          });
        }

        res.status(200).json({
            success: true,
            user_id: user.id,
            user: user
        });
  
    } catch(err) {
        console.log(err.message);
        res.status(500).json(
        {
            success: false,
            msg: 'Server Error'
        });
        next();
    }
};


// Google Auth
exports.googleAuth = async (req, res, next) => {  
    let {google_id, email, full_name, photo_url} = req.body;
  
    google_id = google_id.trim();
    email = email.trim();
    full_name = full_name.trim();
    photo_url = photo_url.trim();

    try {
      let isNewAccount = false;
      let user = await Users.findOne({google_id: google_id});
  
      if(!user) {
        // chưa tồn tại, tạo user
        user = new Users();
  
        user.google_id = google_id;
        user.email = email;
        user.full_name = full_name;
        user.photo_url = photo_url;
        user.provider = 'google';
        user.verified = true;

        isNewAccount = true;
  
        await user.save();
      }
  
      // đã tồn tại user
  
      const payload = {
        user: {
          id: user.id
        }
      }    
  
      jwt.sign(payload, process.env.jwtUserSecret, {
        expiresIn: 360000
      }, (err, token) => {
        if(err) 
          throw err;
  
        user.token = token;

        return res.status(200).json({
          success: true,
          msg: 'Login Google Successfully!',
          isNewAccount: isNewAccount,
          token: token,
          user_id: user.id,
          user: user
        });
      });
  
      await user.save();
  
    } catch(err) {
      console.log(err.message);
  
      return res.status(500).json({
        success: false,
        msg: 'Google Login Server Error!'
      });
    }
};

exports.logout = async (req, res) => {
  try {
      const user = await Users.findById(req.user.id);

      // Nếu không tìm thấy người dùng
      if (!user) {
        return res.status(404).json({
            success: false,
            msg: 'User not found or already logged out.'
        });
      } 

      return res.status(200).json({ success: true, msg: 'Logged out successfully' });

  } catch(err) {
      console.log(err.message);
      res.status(500).json(
      {
          success: false,
          msg: 'Server Error'
      });
  }
};

// -------------- query

// Lấy tất cả user
exports.getAllUsers = async (req, res) => {
  try {
    const users = await Users.find(); // Truy vấn tất cả user
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy 1 user theo ID
exports.getUserById = async (req, res) => {
  try {
    const user = await Users.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Tạo mới 1 user
exports.createUser = async (req, res) => {
  const user = new Users({
    name: req.body.name,
    email: req.body.email,
    age: req.body.age
  });
  try {
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Cập nhật 1 user
exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await Users.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Xoá 1 user
exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await Users.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------- function

// Lấy top 6 user theo score giảm dần
exports.getTopUsersByScore = async (req, res) => {
  try {
    const {number} = req.query;

    let topUsers = null;

    if(!number)
      topUsers = await Users.find().sort({ score: -1 }).limit(6);
    else
      topUsers = await Users.find().sort({ score: -1 }).limit(number);
    
    res.json(topUsers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserCount = async (req, res) => {
  try {
    userCount = await Users.countDocuments();
    res.json(userCount);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// -------------------------

// Update user information (full_name, phone_number, gender)
exports.updateUserInfo = async (req, res) => {
  try {
    const { user_id, full_name, phone_number, gender } = req.body;

    // Kiểm tra xem user_id có tồn tại không
    if (!user_id) {
      return res.status(400).json({ msg: "User ID is required" });
    }

    // Kiểm tra dữ liệu đầu vào
    if (full_name && full_name.length > 100) {
      return res.status(400).json({ msg: "Full name is too long" });
    }

    if (phone_number && phone_number.length > 15) {
      return res.status(400).json({ msg: "Phone number is too long" });
    }

    if (gender && !["Male", "Female", "Other"].includes(gender)) {
      return res.status(400).json({ msg: "Invalid gender value" });
    }

    // Tìm người dùng bằng user_id
    const user = await Users.findById(user_id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Cập nhật thông tin
    if (full_name) user.full_name = full_name;
    if (phone_number) user.phone_number = phone_number;
    if (gender) user.gender = gender;

    // Lưu thông tin đã cập nhật
    await user.save();

    // Trả về thông tin đã cập nhật
    return res.status(200).json({
      msg: "User information updated successfully",
      user: {
        user_id: user._id,
        full_name: user.full_name,
        phone_number: user.phone_number,
        gender: user.gender
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: err.message });
  }
};