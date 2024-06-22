const router = require('express').Router()
const favoriteController = require('../controllers/favoriteController')
const { verifyAndAuthorization } = require('../middleware/verifyToken')

router.get("/", verifyAndAuthorization, favoriteController.getAllFavorite)
router.post("/", verifyAndAuthorization, favoriteController.addTofavorite)
router.delete('/:id', verifyAndAuthorization, favoriteController.removeFavoriteItem)

module.exports = router;