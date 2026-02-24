const mongoose = require("mongoose");

const connectDatabase = () => {
  mongoose.connect(process.env.DATABASE_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.log("MongoDB connection failed:", err.message);
    process.exit(1);
  });
};

module.exports = connectDatabase;