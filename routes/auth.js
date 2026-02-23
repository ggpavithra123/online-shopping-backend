const { isAuthenticatedUser,authorizeRoles } = require('../middlewares/authenticate')

const { registerUser,loginUser,logout,forgotPassword,resetPassword,getUserDetails,changePassword, updateProfile,getAllUsers,getSingleUser,updateUserRole,deleteUser}=  require('../controllers/authController');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path')

const upload = multer({storage: multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join( __dirname,'..' , 'uploads/user' ) )
    },
    filename: function(req, file, cb ) {
        cb(null, file.originalname)
    }
}) })
router.route('/register').post(upload.single('avatar'), registerUser);
router.route('/login').post(loginUser);   
router.route('/logout').get(logout);
router.route('/password/forgot').post(forgotPassword);
router.route('/password/reset/:token').post(resetPassword);
router.route('/myprofile').get(isAuthenticatedUser,getUserDetails);
router.route('/password/change').put(isAuthenticatedUser, changePassword);
router.route('/update').put(isAuthenticatedUser,upload.single('avatar'), updateProfile);
//router.route('/update').put(isAuthenticatedUser, updateProfile);
//router.route('/myprofile').get(isAuthenticatedUser, getUserProfile);

//Admin routes
router.route('/admin/users').get(isAuthenticatedUser,authorizeRoles('admin'), getAllUsers);
router.route('/admin/user/:id').get(isAuthenticatedUser,authorizeRoles('admin'), getSingleUser)
                                .put(isAuthenticatedUser,authorizeRoles('admin'), updateUserRole)
                                .delete(isAuthenticatedUser,authorizeRoles('admin'), deleteUser);
module.exports = router;