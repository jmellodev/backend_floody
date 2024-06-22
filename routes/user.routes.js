const router = require('express').Router();
const userController = require('../controllers/userController');
const { verifyAndAuthorization } = require('../middleware/verifyToken');

router.get("/", verifyAndAuthorization, userController.getUser);

router.delete("/", verifyAndAuthorization, userController.deleteUser);

router.get("/verify/:otp", verifyAndAuthorization, userController.verifyAccount);

router.get("/verify_phone/:phone", verifyAndAuthorization, userController.verifyPhone);

router.put("/avatar/:id", userController.updateAvatar);

module.exports = router;
