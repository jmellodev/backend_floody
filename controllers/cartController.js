const Cart = require('../models/Cart')

module.exports = {
  addProductToCart: async (req, res) => {
    const userId = req.user.id;
    const { productId, totalPrice, quantity } = req.body;
    let count;

    try {
      const existingProduct = await Cart.findOne({ userId: userId, productId: productId })
      count = await Cart.countDocuments({ userId: userId })

      if (existingProduct) {
        existingProduct.quantity += 1,
          existingProduct.totalPrice += totalPrice * quantity,
          await existingProduct.save()
        return res.status(200).json({ status: true, count: count })
      } else {
        const newCartItem = new Cart({
          userId: userId,
          productId: productId,
          additives: req.body.additives,
          instructions: req.body.instructions,
          totalPrice: req.body.totalPrice,
          quantity: req.body.quantity
        })

        await newCartItem.save()
        count = await Cart.countDocuments({ userId })
      }
      res.status(201).json({ status: true, count: count })
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  },

  removeCartItem: async (req, res) => {
    const cartItemId = req.params.id
    const userId = req.user.id

    try {
      const cartItem = await Cart.findById(cartItemId)

      if (!cartItem) {
        return res.status(404).json({ status: false, message: "Cart item not found" })
      }

      await Cart.findByIdAndDelete({ _id: cartItemId })
      const count = await Cart.countDocuments({ userId: userId })

      res.status(200).json({ status: true, count: count })
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  },

  getCart: async (req, res) => {
    const userId = req.user.id
    try {
      const cart = await Cart.find({ userId: userId })
        .populate({
          path: 'productId',
          select: 'imageUrl title restaurant rating ratingCount',
          populate: {
            path: 'restaurant',
            select: 'time coords'
          }
        })

      res.status(200).json(cart)
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  },

  getCartCount: async (req, res) => {
    const userId = req.user.id

    try {
      const count = await Cart.countDocuments({ userId: userId })
      res.status(200).json({ status: true, count: count })
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  },

  clearUserCart: async (req, res) => {
    const userId = req.user.id
    let count

    try {
      await Cart.deleteMany({ userId })
      count = await Cart.countDocuments({ userId })

      res.status(200).json({ status: true, count: count, message: "Cart cleared successfully" })
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  },

  fetchUserCart: async (req, res) => {
    const userId = req.user.id
    try {
      const userCart = await Cart.find({ userId })
        .populate({
          path: "productId",
          select: "title imageUrl restaurant rating ratingCount"
        })

      res.status(200).json({ status: true, cart: userCart })
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  },


  decrementProductQty: async (req, res) => {
    const userId = req.user.id
    const id = req.params.id

    try {
      const cartItem = await Cart.findById(id)

      if (cartItem) {
        const productPrice = cartItem.totalPrice / cartItem.quantity

        if (cartItem.quantity > 1) {
          cartItem.quantity -= 1
          cartItem.totalPrice -= productPrice
          await cartItem.save()
          res.status(200).json({ status: true, message: "Product quantity decremented" })
        } else {
          await Cart.findOneAndDelete({ _id: id })
          res.status(200).json({ status: true, message: "Produto deletado do carrinho." })
        }
      } else {
        res.status(400).json({ status: false, message: "Produto não encontrado." })
      }
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  },
}