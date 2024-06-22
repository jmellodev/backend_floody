const Favorite = require('../models/Favorite')

module.exports = {
  addTofavorite: async (req, res) => {
    const userId = req.user.id;
    const { productId } = req.body;
    let count;

    try {
      const existFavorite = await Favorite.findOne({ userId: userId, productId: productId })
      count = await Favorite.countDocuments({ userId: userId })

      if (existFavorite) {
        return res.status(400).json({ status: false, message: "Produto já é favorito!" })
      } else {
        const newFavorite = new Favorite({
          userId: userId,
          productId: productId
        })

        await newFavorite.save()
        count = await Favorite.countDocuments({ userId })
      }
      res.status(200).json({ status: true, message: 'Adicionado a seus favoritos.' })
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  },

  removeFavoriteItem: async (req, res) => {
    const favoriteItemId = req.params.id
    const userId = req.user.id

    try {
      const favoriteItem = await Favorite.findById(favoriteItemId)

      if (!favoriteItem) {
        return res.status(404).json({ status: false, message: "Cart item not found" })
      }

      await Favorite.findByIdAndDelete({ _id: favoriteItemId })
      const count = await Favorite.countDocuments({ userId: userId })

      res.status(200).json({ status: true, count: count })
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  },

  getAllFavorite: async (req, res) => {
    const userId = req.user.id

    try {
      const favorite = await Favorite.find({ userId: userId })
        .populate({
          path: 'productId',
          select: 'imageUrl title restaurant rating ratingCount price',
          populate: {
            path: 'restaurant',
            select: 'time coords title'
          }
        })

      res.status(200).json(favorite)
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  },
}