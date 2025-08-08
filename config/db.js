const mongoose = require('mongoose');

const connectDB = async () => {
    const conn = await mongoose.connect(process.env.MONGO_URI,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    );

    console.log(`MongoDB connected: ${conn.connection.host}`.cyan.bold);
}

console.log("--------- Start Server ---------".red.bold);

module.exports = connectDB;
