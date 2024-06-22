const router = require('express').Router();
const categoryController = require('../controllers/categoryController');

router.post("/", categoryController.createCategory);

router.get("/", categoryController.getAllCategories);

router.get("/random", categoryController.getRamdonCategories);

router.get("/with-foods", categoryController.getCategoriesWithProducts);

module.exports = router;
