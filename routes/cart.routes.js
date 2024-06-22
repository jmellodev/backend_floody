const router = require('express').Router();
const cartController = require('../controllers/cartController');
const { verifyAndAuthorization } = require('../middleware/verifyToken');

router.post("/", verifyAndAuthorization, cartController.addProductToCart);

router.get("/decrement/:id", verifyAndAuthorization, cartController.decrementProductQty);

router.delete("/delete/:id", verifyAndAuthorization, cartController.removeCartItem);

router.get("/", verifyAndAuthorization, cartController.getCart);

router.get("/count/:code", verifyAndAuthorization, cartController.getCartCount);

router.delete("/clear", verifyAndAuthorization, cartController.clearUserCart);

module.exports = router;