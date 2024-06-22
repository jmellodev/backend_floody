const router = require('express').Router();
const addressController = require('../controllers/addressController');
const { verifyAndAuthorization } = require('../middleware/verifyToken');

router.post("/", verifyAndAuthorization, addressController.addAddress);

router.get("/all", verifyAndAuthorization, addressController.getAddresses);

router.get("/default", verifyAndAuthorization, addressController.getDefaultAddress);

router.patch("/default/:id", verifyAndAuthorization, addressController.setAddressDefault);

router.delete("/:id", verifyAndAuthorization, addressController.deleteAddress);

module.exports = router;
