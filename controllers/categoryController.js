const Category = require('../models/Category');

module.exports = {
  createCategory: async (reg, res) => {
    const newCategory = new Category(reg.body);
    try {
      await newCategory.save();
      res.status(201).json({ status: true, message: "Categoria criada com sucesso!" });
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  },

  getAllCategories: async (reg, res) => {
    try {
      const categories = await Category.find({ title: { $ne: "Mais" } }, { __v: 0 });
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  },

  getRamdonCategories: async (reg, res) => {
    try {
      let categories = await Category.aggregate([
        { $match: { value: { $ne: "mais" } } },
        { $sample: { size: 4 } }
      ]);

      const moreCategory = await Category.findOne({ value: "mais" }, { __v: 0 });

      if (moreCategory) {
        categories.push(moreCategory);
      }

      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  },

  getCategoriesWithProducts: async (req, res) => {
    try {
      // Utilize o $lookup para combinar a coleção categories com a coleção foods
      const categories = await Category.aggregate([
        {
          $lookup: {
            from: "foods",
            localField: "_id",
            foreignField: "category",
            as: "foods",
          },
        },
        {
          // Filtre as categorias que possuem produtos
          $match: {
            foods: { $ne: [] },
          },
        },
        {
          // Exclua o campo __v da resposta
          /* $project: {
            __v: 0,
          }, */

          $project: {
            _id: 1,
            title: 1,
            value: 1,
            imageUrl: 1,
            // foods: 1,
          },
        },
      ]);

      if (!categories) {
        return res.status(404).json({
          status: false,
          message: "Não existem categorias com produtos cadastradas.",
        });
      }

      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  },
};