const router = require('express').Router();
const ratingController = require('../controllers/RatingController');
const { verifyAndAuthorization } = require('../middleware/verifyToken');

router.post("/", verifyAndAuthorization, ratingController.addRating);
router.get("/", verifyAndAuthorization, ratingController.checkUserRating);

module.exports = router;
