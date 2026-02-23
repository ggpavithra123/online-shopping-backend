const express = require("express");
const app = express();
const cors = require("cors");

const productRoutes = require("./routes/product");
const authRoutes = require("./routes/auth");
const order = require("./routes/order");
const errorMiddleware = require("./middlewares/error");
const cookieParser = require("cookie-parser");
//const fileUpload = require("express-fileupload");

//app.use(express.json());

app.use(
  cors({
    origin: [
      "https://onlineshoppingfrontend.vercel.app",
      "https://online-shopping-frontend-xi.vercel.app/",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//app.use(fileUpload());
app.use("/api/v1", productRoutes);
app.use("/api/v1", authRoutes);
app.use("/api/v1", order);

app.use(errorMiddleware);
//app.use(express.urlencoded({ extended: true }))

module.exports = app;
