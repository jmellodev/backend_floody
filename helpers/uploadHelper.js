const { S3Client } = require("@aws-sdk/client-s3");
const multer = require('multer');
const multerS3 = require('multer-s3');
require('dotenv').config(); // Para carregar as variáveis de ambiente do arquivo .env

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

// Helper para o upload de arquivos
const uploadHelper = (path) => {
  return multer({
    storage: multerS3({
      s3: s3,
      bucket: AWS_S3_BUCKET,
      key: function (req, file, cb) {
        const fileName = `${path}/${Date.now().toString()}-${file.originalname}`;
        cb(null, fileName);
      },
    }),
  });
};

module.exports = uploadHelper;
