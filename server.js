//framework phổ biến để xây dựng server Node.js. Như: app.get, app.post, app.use để xử lý request/respone
const express = require("express");
    // Tạo một đối tượng Express – đại diện cho ứng dụng
    const app = express();

const cors = require('cors');

// Dùng để đổi màu chữ khi log ra console. <<<Ko ảnh hưởng đến app>>>
const colors = require("colors");

// Thư viện giúp ghi log các HTTP request đến server
// Middleware log các request HTTP (GET, POST, PUT...) đến server. Theo dõi hoạt động API
const morgan = require("morgan");

// Đọc file .env để nạp biến môi trường như PORT, MONGO_URI
// Tách biệt code dễ bảo mật, chỉnh sửa
const dotenv = require('dotenv');

    dotenv.config({
        path: './config/config.env'
    });

    const PORT = process.env.PORT || 3000;
    
// Kết nối tới MongoDB
const connectDB = require("./config/db");
connectDB();

// middleware tự tạo - chạy ở giữa request và responde
// app.use((req, res, next) => {
//     console.log("middleware ran");
//     req.title = "test use"
//     next(); // cho phép đi tiếp
// });

// Kích hoạt morgan với format 'dev'
app.use(morgan('dev'));

// Parse (phân tích) body của các HTTP request có định dạng JSON, rồi gắn vào req.body
app.use(express.json({}));
// Middleware đọc form-urlencoded từ req.body
app.use(express.urlencoded({ extended: true }));

app.use(cors());

// Đăng ký route http://localhost:3000/api/auth/register
app.use("/api/auth", require("./routes/users"));

// Xử lý gửi OTP
app.use("/api/otp", require("./routes/otp"));

app.use("/api/email_verification", require("./routes/email_verification"));
app.use("/api/forgot_password", require("./routes/forgot_password"));
app.use("/api/test", require("./routes/test"));
app.use("/api/certificate", require("./routes/certificates"));
app.use("/api/look_up_history", require("./routes/UserLookupHistory"));
app.use("/api/vocabulary", require("./routes/Vocabularies"));
app.use("/api/user_star", require("./routes/UserStars"));
app.use("/api/user_answers", require("./routes/user_answers"));
app.use("/api/score", require("./routes/Score"));

app.use("/api/admin", require("./routes/admin"));

// Chạy server
app.listen(PORT, 
    console.log(`Server running on port: ${PORT}`.blue.underline.bold)
);
