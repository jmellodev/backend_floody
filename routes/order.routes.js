const router = require('express').Router();
const orderController = require('../controllers/orderController');
const { verifyAndAuthorization } = require('../middleware/verifyToken');

router.post("/", verifyAndAuthorization, orderController.placeOrder);
router.get("/", verifyAndAuthorization, orderController.getUserOrder);

module.exports = router;
