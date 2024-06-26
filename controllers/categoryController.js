const Category = require('../models/Category');
const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const multer = require('multer');
const multerS3 = require('multer-s3');
require('dotenv').config();

// Verificar as variáveis de ambiente
const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET } = process.env;
if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_REGION || !AWS_S3_BUCKET) {
  throw new Error('One or more AWS environment variables are missing');
}

// Configuração do AWS SDK
const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

// Configuração do multer com multer-s3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: AWS_S3_BUCKET,
    key: function (req, file, cb) {
      cb(null, 'category/' + Date.now().toString() + '-' + file.originalname);
    },
  }),
});

// Middleware para lidar com o upload de arquivos
const singleUpload = upload.single('imageUrl'); // 'imageUrl' deve ser o nome do campo do arquivo no formulário

module.exports = {
  createS3: async (req, res) => {
    singleUpload(req, res, async function (err) {
      if (err) {
        return res.status(500).json({ status: false, message: err.message });
      }

      const { title, value } = req.body;

      if (!title || !value || !req.file) {
        return res.status(400).json({ status: false, message: "You have a missing field" });
      }

      try {
        const newFood = new Category({
          title,
          value,
          imageUrl: req.file.location, // URL da imagem no S3
        });

        await newFood.save();

        res.status(201).json({ message: "Category has been successfully added! " + req.file.location });
      } catch (error) {
        if (!res.headersSent) {
          res.status(500).json({ status: false, message: error.message });
        }
      }
    });
  },
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