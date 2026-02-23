const catchAsyncError = require('../middlewares/catchAsyncError');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
//Create New Order - api/v1/order/new
exports.newOrder =  catchAsyncError( async (req, res, next) => {
    const {
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo
    } = req.body;

    const order = await Order.create({
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
        paidAt: Date.now(),
        user: req.user.id
    })

    res.status(200).json({
        success: true,
        order
    })
});

exports.getSingleOrder = catchAsyncError( async (req, res, next) => {   
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if(!order){
        return next(new ErrorHandler('Order not found with this Id', 404))
    }   

    res.status(200).json({
        success: true,
        order
    })
});

//Get Loggedin User Orders - /api/v1/myorders
exports.myOrders = catchAsyncError(async (req, res, next) => {
    const orders = await Order.find({user: req.user.id});

    res.status(200).json({
        success: true,
        orders
    })
})

exports.orders = catchAsyncError( async (req, res, next) => {   
    const orders = await Order.find();   
    let totalAmount = 0;
    orders.forEach(order => {
        totalAmount += order.totalPrice;
    });
    res.status(200).json({
        success: true,
        totalAmount,
        orders
    })
});
exports.updateOrder = catchAsyncError( async (req, res, next) => {   
    const order = await Order.findById(req.params.id);  
    if(!order){
        return next(new ErrorHandler('Order not found with this Id', 404))
    }  
    console.log("ORDER STATUS 👉", order.orderStatus)     
    if(order.orderStatus === 'Delivered'){
        return next(new ErrorHandler('You have already delivered this order', 400))
    }       
    order.orderItems.forEach( async item => {
        await updateStock(item.product, item.quantity);
    });
    console.log("REQ BODY STATUS 👉", req.body.status)
    order.orderStatus = req.body.status;    
    if(req.body.status === 'Delivered'){
        order.deliveredAt = Date.now();
    }
    await order.save({validateBeforeSave: false});

    res.status(200).json({
        success: true,
        //order
    })
});

async function updateStock(id, quantity){
    const product = await Product.findById(id);
    product.stock -= quantity;
    await product.save({validateBeforeSave: false});
}   

exports.deleteOrder = catchAsyncError( async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    if(!order){
        return next(new ErrorHandler('Order not found with this Id', 404))
    }       

    await order.deleteOne();
    res.status(200).json({
        success: true,
    })
});


