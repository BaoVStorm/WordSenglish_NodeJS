const express = require("express");
    const app = express();

const cors = require('cors');

const colors = require("colors");

const morgan = require("morgan");

const dotenv = require('dotenv');

dotenv.config({
    path: './config/config.env'
});

const PORT = process.env.PORT || 3000;
    
const connectDB = require("./config/db");
connectDB();

app.use(morgan('dev'));

app.use(express.json({}));
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use("/api/auth", require("./routes/users"));
app.use("/api/post", require("./routes/posts"));
app.use("/api/vocabItem", require("./routes/vocabItem"));
app.use("/api/love", require("./routes/love"));
app.use("/api/comment", require("./routes/comment"));

// Chạy server
app.listen(PORT, 
    console.log(`Server running on port: ${PORT}`.blue.underline.bold)
);
