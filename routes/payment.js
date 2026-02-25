const express = require('express');
const { processPayment, sendStripeApi } = require('../controllers/paymentController');
const { isAuthenticatedUser } = require('../middlewares/authenticate');
const router = express.Router();

router.route('/payment/process').post( isAuthenticatedUser, processPayment);
router.route('/stripeapi').get( isAuthenticatedUser, sendStripeApi);


<<<<<<< HEAD
module.exports = router;
=======
module.exports = router;
>>>>>>> 0c6c65cb15ea0d3ce65c17475199cd5400d9d865
