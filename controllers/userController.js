const User = require('../models/User')
const jwt = require("jsonwebtoken")

module.exports = {
  getUser: async (req, res) => {
    try {
      const user = await User.findById(req.body.id);

      const { password, __v, createdAt, updatedAt, otp, ...userData } = user._doc;

      res.status(200).json(userData);
    } catch (error) {
      res.status(500).json({ status: false, message: error.message })
    }
  },

  verifyAccount: async (req, res) => {
    const userOtp = req.params.otp;
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(400).json({ status: false, message: "Usuário não encontrado." })
      }

      if (userOtp === user.otp) {
        user.verification = true;
        user.otp = "none";

        await user.save();

        const token = jwt.sign({
          id: user._id,
          userType: user.userType,
          email: user.email,
        }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE })

        const { paswword, __v, otp, createdAt, ...others } = user._doc;

        return res.status(200).json({ ...others, token });
      } else {
        return res.status(400).json({ status: false, message: "Falha na verificação OTP" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: false, message: error.message })
    }
  },

  verifyPhone: async (req, res) => {
    const phone = req.params.phone;

    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(400).json({ status: false, message: "Usuário não encontrado." })
      }

      user.phoneVerification = true;
      user.phone = phone;

      await user.save();

      const token = jwt.sign({
        id: user._id,
        userType: user.userType,
        email: user.email,
      }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE })

      const { paswword, __v, otp, createdAt, ...others } = user._doc;

      res.status(200).json({ ...others, token });

    } catch (error) {
      res.status(500).json({ status: false, message: error.message })
    }
  },

  deleteUser: async (req, res) => {
    try {
      await User.findByIdAndDelete(req.user.id);

      res.status(200).json({ status: true, message: "User successfully deleted" });
    } catch (error) {
      res.status(500).json({ status: false, message: error.message })
    }
  },

  updateAvatar: async (req, res) => {
    const id = req.params.id;
    const { profile } = req.body;

    try {
      if (!profile || typeof profile !== "string" || profile === "") {
        return res
          .status(400)
          .json({ status: false, message: "Avatar inválido." });
      }

      const user = await User.findById(id);
      console.log(user);
      if (!user)
        return res
          .status(400)
          .json({ status: false, message: "Usuário não existe" });

      await User.findByIdAndUpdate(id, { profile });

      res
        .status(200)
        .json({ status: true, message: "Avatar atualizado com sucesso." });
    } catch (error) {
      res
        .status(500)
        .json({ status: false, message: "Erro ao atualizar foto da desgraça." });
    }
  },
}
