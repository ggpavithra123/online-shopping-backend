const express = require('express');
const router = express.Router();
const {isAuthenticatedUser, authorizeRoles} = require('../middlewares/authenticate');
const { getAllProducts,newProduct, getSingleProduct, updateProduct, deleteProduct,getAdminProducts, createProductReview,getReviews,deleteReview} = require('../controllers/productController'); 
const path = require('path');
const multer = require('multer');

const upload = multer({storage: multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join( __dirname,'..' , 'uploads/product' ) )
    },
    filename: function(req, file, cb ) {
        cb(null, file.originalname)
    }
}) })

router.route('/products').get(getAllProducts);
//router.route('/product/new').post(isAuthenticatedUser,authorizeRoles('admin'),newProduct);
router.route('/product/:id').get(getSingleProduct);
router.route('/product/:id').put(updateProduct);
router.route('/product/:id').delete(deleteProduct);
router.route('/review').put(isAuthenticatedUser, createProductReview);
router.route('/reviews').get(isAuthenticatedUser, getReviews);
router.route('/review').delete(isAuthenticatedUser, authorizeRoles('admin'),deleteReview)

//Admin routes
router.route('/product/new')
  .post(
    isAuthenticatedUser,
    upload.array('images'),   // 🔥 IMPORTANT
    newProduct
  );
//router.route('/admin/product/new').post(isAuthenticatedUser, authorizeRoles('admin'), newProduct);
router.route('/admin/products').get(isAuthenticatedUser, authorizeRoles('admin'), getAdminProducts);
router.route('/admin/product/:id').delete(isAuthenticatedUser, authorizeRoles('admin'), deleteProduct);
router.route('/admin/product/:id').put(isAuthenticatedUser, authorizeRoles('admin'),upload.array('images'), updateProduct);
router.route('/admin/reviews').get(isAuthenticatedUser, authorizeRoles('admin'),getReviews)
router.route('/admin/review').delete(isAuthenticatedUser, authorizeRoles('admin'),deleteReview)
module.exports = router;