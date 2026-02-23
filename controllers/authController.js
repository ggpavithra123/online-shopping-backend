const catchAsyncError = require('../middlewares/catchAsyncError');
const User = require('../models/userModel');
const sendEmail = require('../utils/email');
const ErrorHandler = require('../utils/errorHandler');
const sendToken = require('../utils/jwt');
const crypto = require('crypto');


//Register User - /api/v1/register
exports.registerUser = catchAsyncError(async (req, res, next) => {
    const {name, email, password } = req.body

    let avatar;
    
    let BASE_URL = process.env.BACKEND_URL;
    if(process.env.NODE_ENV === "production"){
        BASE_URL = `${req.protocol}://${req.get('host')}`
    }

    if(req.file){
        avatar = `${BASE_URL}/uploads/user/${req.file.originalname}`
    }

    const user = await User.create({
        name,
        email,
        password,
        avatar
    });

    sendToken(user, 201, res)

});

exports.loginUser = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;   
    //checking if user has given password and email both
    if (!email || !password) {
        return next(new ErrorHandler('Please enter email & password', 400));
    }
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return next(new ErrorHandler('Invalid email or password', 401));
    }
    const isPasswordMatched = await user.isValidPassword(password);
    if (!isPasswordMatched) {
        return next(new ErrorHandler('Invalid email or password', 401));
    }   
    sendToken(user, 200, res);
   
});
// Logout user => /api/v1/logout
exports.logout = catchAsyncError(async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),  
        httpOnly: true
    })

    res.status(200).json({  
        success: true,
        message: 'Logged out'
    })
});

//Forgot Password - /api/v1/password/forgot
exports.forgotPassword = catchAsyncError( async (req, res, next)=>{
    const user =  await User.findOne({email: req.body.email});

    if(!user) {
        return next(new ErrorHandler('User not found with this email', 404))
    }

    const resetToken = user.getResetToken();
    await user.save({validateBeforeSave: false})
    
    let BASE_URL = process.env.FRONTEND_URL;
    if(process.env.NODE_ENV === "production"){
        BASE_URL = `${req.protocol}://${req.get('host')}`
    }


    //Create reset url
    const resetUrl = `${BASE_URL}/password/reset/${resetToken}`;

    const message = `Your password reset url is as follows \n\n 
    ${resetUrl} \n\n If you have not requested this email, then ignore it.`;

    try{
        sendEmail({
            email: user.email,
            subject: "JVLcart Password Recovery",
            message
        })

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email}`
        })

    }catch(error){
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpire = undefined;
        await user.save({validateBeforeSave: false});
        return next(new ErrorHandler(error.message), 500)
    }

})  

// Reset Password - /api/v1/password/reset/:token
exports.resetPassword = catchAsyncError(async (req, res, next) => {
    // 1️⃣ Hash the token from URL
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    // 2️⃣ Find user with valid token and non-expired time
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordTokenExpire: { $gt: Date.now() }
    });

    // 3️⃣ Token invalid or expired
    if (!user) {
        return next(
            new ErrorHandler(
                'Reset password token is invalid or has expired',
                400
            )
        );
    }

    // 4️⃣ Password & confirm password check
    if (req.body.password !== req.body.confirmPassword) {
        return next(
            new ErrorHandler('Password and confirm password do not match', 400)
        );
    }

    // 5️⃣ Update password
    user.password = req.body.password;

    // 6️⃣ Clear reset token fields (important for security)
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpire = undefined;

    // 7️⃣ Save user (bcrypt runs via pre-save hook)
    await user.save();

    // 8️⃣ Send JWT & login user
    sendToken(user, 200, res);
});

exports.getUserDetails = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id);  

    res.status(200).json({
        success: true,
        user
    })
});

//Change Password  - api/v1/password/change
exports.changePassword  = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');
    //check old password
    if(!await user.isValidPassword(req.body.oldPassword)) {
        return next(new ErrorHandler('Old password is incorrect', 401));
    }

    //assigning new password
    user.password = req.body.password;
    await user.save();
    res.status(200).json({
        success:true,
    })
 });

//Update User Profile  - api/v1/profile/update
exports.updateProfile  = catchAsyncError(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    //  let avatar;
    // let BASE_URL = process.env.BACKEND_URL;
    // if(process.env.NODE_ENV === "production"){
    //     BASE_URL = `${req.protocol}://${req.get('host')}`
    // }

    // if(req.file){
    //     avatar = `${BASE_URL}/uploads/user/${req.file.originalname}`
    //     newUserData = {...newUserData,avatar }
    // }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });
    res.status(200).json({
        success:true,
        user
    })
 }  );

//Get all users  => /api/v1/admin/users
exports.getAllUsers = catchAsyncError( async (req, res, next) => {
    const users = await User.find();    
    res.status(200).json({  

        success: true,
        users
    })
});

exports.getSingleUser = catchAsyncError( async (req, res, next) => {
    const user = await User.findById(req.params.id);    
    if(!user){
        return next(new ErrorHandler(`User does not exist with id: ${req.params.id}`))
    }
    res.status(200).json({  
        success: true,
        user
    })
});

exports.updateUserRole  = catchAsyncError(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }   
    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {         
        new: true,
        runValidators: true,
        useFindAndModify: false 
    });
    res.status(200).json({
        success:true,
        user
    })
 } );

 exports.deleteUser  = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if(!user){
        return next(new ErrorHandler(`User does not exist with id: ${req.params.id}`))
    }
    await user.deleteOne();
    res.status(200).json({
        success:true,
    })
 } );
 


