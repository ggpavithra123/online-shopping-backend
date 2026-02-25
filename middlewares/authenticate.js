const ErrorHandler = require("../utils/errorHandler");
const User = require("../models/userModel");
const catchAsyncError = require("./catchAsyncError");
const jwt = require("jsonwebtoken");

exports.isAuthenticatedUser = catchAsyncError(async (req, res, next) => {

    console.log("===== AUTH DEBUG START =====");

    // Log all cookies
    console.log("Cookies received:", req.cookies);

    // Log headers (important for cross-site issues)
    console.log("Request Origin:", req.headers.origin);
    console.log("Request Headers:", req.headers.cookie);

    const { token } = req.cookies;

    console.log("Extracted token:", token);

    if (!token) {
        console.log("❌ No token found in cookies");
        console.log("===== AUTH DEBUG END =====");
        return next(new ErrorHandler("Login first to handle this resource", 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("✅ Token verified. Decoded:", decoded);

        req.user = await User.findById(decoded.id);
        console.log("✅ User found:", req.user?._id);

        console.log("===== AUTH DEBUG END =====");
        next();

    } catch (error) {
        console.log("❌ JWT Verification Failed:", error.message);
        console.log("===== AUTH DEBUG END =====");
        return next(new ErrorHandler("Invalid or expired token", 401));
    }
});

exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        console.log("Authorizing role:", req.user?.role);

        if (!roles.includes(req.user.role)) {
            return next(
                new ErrorHandler(`Role ${req.user.role} is not allowed`, 401)
            );
        }

        next();
    };
};