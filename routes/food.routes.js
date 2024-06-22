const router = require('express').Router();
const foodController = require('../controllers/foodController');
const { verifyVendor } = require('../middleware/verifyToken');

router.post("/", foodController.addFood);

router.get("/recommendation/:code", foodController.getRandomFood);

router.get("/byCode/:code", foodController.getAllFoodsByCode);

router.get("/:id", foodController.getFoodById);

router.get("/restaurant-foods/:id", foodController.getFoodsByRestaurant);

router.get("/search/:search", foodController.searchFoods);

router.get("/:category/:code", foodController.getRandomFoodsByCategoryAndCode);

router.post('/tags/:id', foodController.addFoodTag)

router.get("/:id", foodController.getFoodById)

router.post("/type/:id", foodController.addFoodType)

router.delete("/:id", foodController.deleteFoodById)

router.patch("/:id", foodController.foodAvailibility)

router.get("/restaurant/:restaurantId", foodController.getFoodsByRestaurant)

module.exports = router;
