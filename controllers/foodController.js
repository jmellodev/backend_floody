const Food = require('../models/Food');
require('dotenv').config(); // Para carregar as variáveis de ambiente do arquivo .env
const uploadHelper = require('../helpers/uploadHelper');
const createFieldChecker = require('../helpers/createFieldChecker');

// Middleware para lidar com o upload de múltiplos arquivos
const multipleUpload = uploadHelper('foods').array('imageUrl', 10); // 'imageUrls' deve ser o nome do campo de arquivos no formulário, e '10' é o número máximo de arquivos permitidos

const requiredFields = ['title', 'foodTags', 'category', 'code', 'restaurant', 'description', 'time', 'price', 'additives'];
const checkMissingFields = createFieldChecker(requiredFields);

module.exports = {
  addFood: async (req, res) => {
    multipleUpload(req, res, async function (err) {
      const missingFields = checkMissingFields(req.body);

      if (missingFields.length > 0) {
        return res.status(400).json({ message: `Os seguintes campos estão faltando: ${missingFields.join(', ')}` });
      }
      if (err) {
        return res.status(500).json({ message: err.message });
      }

      const imageUrls = req.files ? req.files.map(file => file.location) : [];

      try {
        const newFood = new Food({
          title: req.body.title,
          foodTags: req.body.foodTags,
          category: req.body.category,
          code: req.body.code,
          restaurant: req.body.restaurant,
          description: req.body.description,
          time: req.body.time,
          price: req.body.price,
          additives: req.body.additives,
          imageUrls, // Array de URLs das imagens no S3
        });

        await newFood.save();

        res.status(201).json({ message: "Food has been successfully added!" });
      } catch (error) {
        if (!res.headersSent) {
          res.status(500).json({ message: error.message });
        }
      }
    });
  },
  /* addFood: async (req, res) => {
    multipleUpload(req, res, async function (err) {
      const { title, foodTags, category, code, restaurant, description, time, price, additives } = req.body;

      if (!title || !foodTags || !category || !code || !restaurant || !description || !time || !price || !additives || !req.files) {
        return res.status(400).json({ message: "Você tem um campo ausente" });
      }

      if (err) {
        return res.status(500).json({ message: err.message })
      }

      const imageUrls = req.files.map(file => file.location);

      try {
        const newFood = new Food({
          title,
          foodTags,
          category,
          code,
          restaurant,
          description,
          time,
          price,
          additives,
          imageUrl: imageUrls, // Array de URLs das imagens no S3
        });

        await newFood.save();

        res.status(201).json({ message: "A comida foi adicionada com sucesso!" });
      } catch (error) {
        if (!res.headersSent) {
          res.status(500).json({ message: error.message });
        }
      }
    })
  }, */

  getFoodById: async (req, res) => {
    const foodId = req.params.id;

    try {
      const food = await Food.findById(foodId);

      if (!food) {
        return res.status(404).json({ status: false, message: "Food not found" });
      }

      res.status(200).json(food);
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  },

  getRandomFood: async (req, res) => {
    try {
      let randomFoodList = [];

      // Check if code is provided in the params

      if (req.params.code) {
        randomFoodList = await Food.aggregate([
          { $match: { code: req.params.code } },
          { $sample: { size: 3 } },
          { $project: { __v: 0 } }
        ])
      }

      // If no code provided in params or no Foods match the providec
      if (!randomFoodList.length) {
        randomFoodList = await Food.aggregate([

          { $sample: { size: 5 } },
          { $project: { __v: 0 } }
        ])
      }

      // Respond with the results
      if (randomFoodList.length) {
        res.status(200).json(randomFoodList);
      } else {
        res.status(404).json({ status: false, message: "Not found" })
      }

    } catch (error) {
      res.status(500).json(error);
    }
  },

  getAllFoodsByCode: async (req, res) => {
    const code = req.params.code;

    try {
      const foodList = await Food.find({ code: code })

      return res.status(200).json(foodList);
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  },

  //Restaurant Menu
  getFoodsByRestaurant: async (req, res) => {
    // const id = req.params.id;
    const restaurantId = req.params.id;

    try {
      const foods = await Food.find({ restaurant: restaurantId });
      console.log(foods);

      if (!foods || foods.length === 0) {
        return res.status(404).json({ Status: false, message: "No food items found" });
      }

      res.status(200).json(foods)
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  },

  getFoodsByCategoryAndCode: async (req, res) => {
    const { category, code } = req.params;

    try {
      const foods = await Food.aggregate([
        { $match: { category: category, code: code, isAvailable: true } },
        { $project: { __v: 0 } }
      ])

      if (foods.length === 0) {
        return res.status(200).json({ status: false, message: "No Food found" })
      }

      res.status(200).json(foods);
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  },

  searchFoods: async (req, res) => {
    const search = req.params.search;

    try {
      const results = await Food.aggregate([
        {
          $search: {
            index: "foods",
            text: {
              query: search,
              path: {
                wildcard: "*"
              }
            }
          }
        }
      ])

      res.status(200).json(results)
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  },

  getRandomFoodsByCategoryAndCode: async (req, res) => {
    const { category, code } = req.params;

    try {
      let foods;

      foods = await Food.aggregate([
        { $match: { category: category, code: code, isAvailable: true } },
        { $sample: { size: 10 } }
      ])

      if (!foods || foods.length === 0) {
        foods = await Food.aggregate([
          { $match: { code: code, isAvailable: true } },
          { $sample: { size: 10 } }
        ])
      } else if (!foods || foods.length === 0) {
        foods = await Food.aggregate([
          { $match: { isAvailable: true } },
          { $sample: { size: 10 } }
        ])
      }

      res.status(200).json(foods);

    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  },

  deleteFoodById: async (req, res) => {
    const foodId = req.params.id;

    try {
      const food = await food.findById(foodId)

      if (!food) {
        return res.status(404).json({ status: false, message: "Food item not found" })
      }

      await Food.findByIdAndDelete(foodId)

      res.status(200).json({ status: true, message: "Food item deleted successfully" })
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  },

  foodAvailibility: async (req, res) => {
    const foodId = req.params.id;

    try {
      const food = await Food.findById(foodId)

      if (!food) {
        return res.status(404).json({ status: false, message: "Food not found" })
      }

      food.isAvailable = !food.isAvailable;

      await food.save()

      res.status(200).json({ status: true, message: "Food availability successfully toggled" })
    } catch (error) {
      res.status(500).json({ status: false, message: error.message + " cacete" });
    }
  },

  updateFoodById: async (req, res) => {
    const foodId = req.params.id;

    try {
      const updateFood = Food.findByIdAndUpdate(foodId, req.body, { new: true, runValidators: true });

      if (!updateFood) {
        return res.status(404).json({ status: false, message: "Food item not updated" })
      }

      res.status(200).json({ status: true, message: "Food item successfully updated" });
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  },

  addFoodTag: async (req, res) => {
    const foodId = req.params.id;
    const { tag } = req.body;

    try {
      const food = await Food.findById(foodId)

      if (!food) {
        return res.status(404).json({ status: false, message: "Food item not found" })
      }

      if (food.foodTags.includes(tag)) {
        return res.status(404).json({ status: false, message: "Tag already exist" })
      }

      food.foodTags.push(tag)

      await food.save()

      res.status(200).json({ status: true, message: "Food tag successfully added" });
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }

  },

  getRandomFoodsByCode: async (req, res) => {
    try {
      const randomFoodItem = await Food.aggregate([
        { $match: { code: req.params.code } },
        { $sample: { size: 5 } },
        { $project: { _id: 0 } }
      ]);

      res.status(200).json(randomFoodItem)
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  },

  addFoodType: async (req, res) => {
    const foodId = req.params.id;
    const foodType = req.body.foodType;

    try {
      const food = await Food.findById(foodId)

      if (!food) {
        return res.status(404).json({ status: false, message: error.message })
      }

      if (food.foodType.includes(foodType)) {
        return res.status(404).json({ status: false, message: "Type already exist" })
      }

      food.foodType.push(foodType)

      await food.save()

      res.status(200).json({ status: true, message: "Food type successfully added" });
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  },

  getRandomByCategoryAndCode: async (req, res) => {
    const { category, code } = req.params;

    try {
      let foods = await Food.aggregate([
        { $match: { category: category, code: code } },
        { $sample: { size: 10 } }
      ])
      if (!foods || foods.length === 0) {
        foods = await Food.aggregate([
          { $match: { code: code } },
          { $sample: { size: 10 } }
        ])
      } else {
        foods = await Food.aggregate([
          { $sample: { size: 10 } }
        ])
      }

      res.status(200).json(foods)
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  },
}

// res.status(500).json({ status: false, message: error.message });
