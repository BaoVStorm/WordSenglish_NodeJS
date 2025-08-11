const jwt = require('jsonwebtoken');
const Users = require('../models/Users');
const bcryptjs = require('bcryptjs');
const { createToken } = require('../util/CreateToken');

// refresh Token 
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({error: "Refresh token is required"});
    }

    // Check if refresh token exists in DB
    const user = await Users.findOne({ refreshToken });
    if (!user) {
      return res.status(401).json({error: "Invalid refresh token"});
    }

    // Verify refresh token
    jwt.verify(refreshToken, process.env.jwtUserSecret, (err, decoded) => {
      if (err) {
        return res.status(403).json({error: "Refresh token expired or invalid"});
      }

      // Create new access token
      const payload = { user: { id: user.id } };
      const newAccessToken = createToken({...payload, type: 'access'}, "15m");

      res.status(200).json({
        success: true,
        accessToken: newAccessToken
      });
    });

    throw error;
  } catch (err) {
    res.status(500).json({err: "server error"});
  }
};

// Đăng ký
exports.register = async (req, res, next) => {  
  let {username, password} = req.body;

  username = username.trim();
  password = password.trim();

  try{
    let user_exist = await Users.findOne({user_name: username});
    if(user_exist) {
      return res.status(400).json({
          success: false,
          msg: 'User already exists. Please use another username!'
      });
    }

    // tạo user mới
    const salt = await bcryptjs.genSalt(10);
    const password_hash = await bcryptjs.hash(password, salt);

    let user = new Users({
      user_name: username,
      password_hash
    });

    await user.save();

    const payload = {
       user: { id: user.id }
    }    
    
    // tạo access token
    let accessToken =  createToken({...payload, type: 'access'}, "15m");
    
    // tạo Refresh token
    const refreshToken = createToken({...payload, type: 'refresh'}, "7d");

    // Lưu refresh token vào DB
    user.refreshToken = refreshToken;
    await user.save();

    return res.status(200).json({
      success: true,
      msg: "Register User successfully! Need verify Email",
      username: user.user_name,
      accessToken: accessToken,
      refreshToken: user.refreshToken
    });

  } catch(err) {
    console.log(err);

    return res.status(400).json({
      success: false,
      msg: 'error'
    });
  }
};

// Login
exports.login = async (req, res) => {  
  let {username, password} = req.body;

  if(!username || !password)
    return res.status(403).json({
      success: false,
      error_server: false,
      msg: 'username or password must not empty'
    });

  username = username.trim();
  password = password.trim();

  try {
    let user = await Users.findOne({user_name: username});

    if(!user) {
      return res.status(400).json({
        success: false,
        error_server: false,
        msg: 'Username not exists!'
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

    const payload = {
       user: { id: user.id }
    }    

    // tạo access token
    const accessToken = createToken({...payload, type: 'access'}, "15m");
    
    // tạo Refresh token
    const refreshToken = createToken({...payload, type: 'refresh'}, "7d");

    user.refreshToken = refreshToken;
    await user.save();

    return res.status(200).json({
      success: true,
      msg: 'User logged in!',
      username: user.user_name,
      accessToken: accessToken,
      refreshToken: user.refreshToken
    });


  } catch(err) {
    console.log(err.message);

    return res.status(500).json({
      success: false,
      error_server: true,
      msg: 'Server Error!'
    });
  }

};


exports.logout = async (req, res) => {
  try {
      const userId = req.user.id; // Comes from middleware

      const user = await Users.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          msg: 'User not found.'
        });
      }

      user.refreshToken = null;
      await user.save();

      res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'strict' });

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


// ----- query

// Get Current User
exports.profile = async (req, res) => {
    try {
        const user = await Users.findById(req.user.id);

        // Nếu không tìm thấy người dùng
        if (!user) {
          return res.status(404).json({
              success: false,
              msg: 'User not found.'
          });
        } 

        return res.status(200).json({
            success: true,
            username: user.user_name,
            msg: 'Fetch Successfully.'
        });
  
    } catch(err) {
        console.log(err.message);
        res.status(500).json(
        {
            success: false,
            msg: 'Server Error'
        });
    }
};
