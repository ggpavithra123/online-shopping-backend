const catchAsyncError = require('../middlewares/catchAsyncError');
const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
const APIfeatures = require('../utils/apiFeatures');

//Get all products => /api/v1/products

exports.getAllProducts = async (req, res, next) => {
  const resPerPage = 3;

  const apiFeatures = new APIfeatures(Product.find(), req.query)
    .search()
    .filter()
    .paginate(resPerPage);

  const products = await apiFeatures.query;

  res.status(200).json({
    success: true,
    count: products.length,
    resPerPage,
    products
  });
};

//Create Product - /api/v1/product/new
exports.newProduct = catchAsyncError(async (req, res, next)=>{
    let images = []
    let BASE_URL = process.env.BACKEND_URL;
    if(process.env.NODE_ENV === "production"){
        BASE_URL = `${req.protocol}://${req.get('host')}`
    }
    
    if(req.files.length > 0) {
        req.files.forEach( file => {
            let url = `${BASE_URL}/uploads/product/${file.originalname}`;
            images.push({ image: url })
        })
    }

    req.body.images = images;

    req.body.user = req.user.id;
    const product = await Product.create(req.body);
    res.status(201).json({
        success: true,
        product
    })
});

exports.getSingleProduct = async (req, res, next) => {  
    const product = await Product.findById(req.params.id);
    if(!product) {
        return next(new ErrorHandler('Product not found', 400));
    }
     await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate delay
    res.status(200).json({
        success: true,
        product 
    });  
}

exports.updateProduct = async (req, res, next) => {
    let product = await Product.findById(req.params.id);
    if (!product) { 
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        });
    }   
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,    
        useFindAndModify: false
    }); 
    res.status(200).json({  
        success: true,
        product 
    });  
}   

//Delete Product - api/v1/product/:id
exports.deleteProduct = async (req, res, next) =>{
    const product = await Product.findById(req.params.id);

    if(!product) {
        return res.status(404).json({
            success: false,
            message: "Product not found"
        });
    }

    await product.deleteOne();

    res.status(200).json({
        success: true,
        message: "Product Deleted!"
    })

}

// Create Review - api/v1/review
exports.createProductReview = catchAsyncError(async (req, res, next) => {
    const { productId, rating, comment } = req.body;

    const product = await Product.findById(productId);

    // ✅ PRODUCT NOT FOUND CHECK
    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    const review = {
        user: req.user.id,
        rating,
        comment
    };

    // Check if user already reviewed
    const isReviewed = product.reviews.find(
        review => review.user.toString() === req.user.id.toString()
    );

    if (isReviewed) {
        product.reviews.forEach(review => {
            if (review.user.toString() === req.user.id.toString()) {
                review.rating = rating;
                review.comment = comment;
            }
        });
    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    // Calculate average rating
    product.ratings =
        product.reviews.reduce((acc, item) => acc + item.rating, 0) /
        product.reviews.length;

    product.ratings = isNaN(product.ratings) ? 0 : product.ratings;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        message: "Review added/updated successfully"
    });
});

//Get Reviews - api/v1/reviews?id={productId}
exports.getReviews = catchAsyncError(async (req, res, next) =>{
    const product = await Product.findById(req.query.id).populate('reviews.user','name email');

    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
});

//Delete Review - api/v1/review
exports.deleteReview = catchAsyncError(async (req, res, next) =>{
    const product = await Product.findById(req.query.productId);
    
    //filtering the reviews which does match the deleting review id
    const reviews = product.reviews.filter(review => {
       return review._id.toString() !== req.query.id.toString()
    });
    //number of reviews 
    const numOfReviews = reviews.length;

    //finding the average with the filtered reviews
    let ratings = reviews.reduce((acc, review) => {
        return review.rating + acc;
    }, 0) / reviews.length;
    console.log("RATINGS 👉", ratings);
    ratings = isNaN(ratings)?0:ratings;

    //save the product document
    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        numOfReviews,
        ratings
    })
    res.status(200).json({
        success: true
    })


});

// get admin products  - api/v1/admin/products
exports.getAdminProducts = catchAsyncError(async (req, res, next) =>{
    const products = await Product.find();
    res.status(200).send({
        success: true,
        products
    })
});

