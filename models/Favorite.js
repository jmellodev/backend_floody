const mongoose = require('mongoose')

const FavoriteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
}, { timestamps: true })

module.exports = mongoose.model('Favorite', FavoriteSchema)