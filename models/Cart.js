const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
  additives: { type: Array, required: false, default: [] },
  instructions: { type: String, default: '' },
  quantity: { type: Number, required: true, default: 1 },
  totalPrice: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Cart', CartSchema);