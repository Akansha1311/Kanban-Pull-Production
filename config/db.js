//MONGO_URI env variables
const MONGO_URI = process.env.MONGO_URI;

//MONGOOSE - MONGODB DRIVER
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    console.log(`Mongoose connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = connectDB;
