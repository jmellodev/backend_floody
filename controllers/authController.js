const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const generateOtp = require("../utils/otp_generator");
const sendMail = require("../utils/email_functions");

const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const minPasswordLength = 5;

module.exports = {
  createUser: async (req, res) => {
    const { email, password, name, username, profile } = req.body;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ status: false, message: "E-mail inválido" });
    }

    if (password.length < minPasswordLength) {
      return res.status(400).json({
        status: false,
        message: `A senha deve ter no mínimo ${minPasswordLength} caracteres`,
      });
    }

    try {
      const emailExists = await User.findOne({ email });

      if (emailExists) {
        return res.status(400).json({ status: false, message: "E-mail já existe" });
      }

      const otp = generateOtp();
      const encryptedPassword = CryptoJS.AES.encrypt(password, process.env.SECRET).toString();

      const newUser = new User({
        name,
        username,
        email,
        userType: "Client",
        password: encryptedPassword,
        otp,
      });

      await newUser.save();
      sendMail(email, otp);

      res.status(201).json({ status: true, message: "Usuário criado com sucesso." });
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  },

  createUserA: async (req, res) => {
    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!emailRegex.test(req.body.email)) {
      return res
        .status(400)
        .json({ status: false, message: "E-mail inválido" });
    }

    const minPassword = 5;

    if (req.body.password.length < minPassword) {
      return res
        .status(400)
        .json({
          status: false,
          message: "A senha deve ter no mínimo " + minPassword + " caracteres",
        });
    }

    try {
      const emailExists = await User.findOne({ email: req.body.email });

      if (emailExists) {
        return res
          .status(400)
          .json({ status: false, message: "E-mail já existe" });
      }

      // Generate OTP
      const otp = generateOtp();

      const newUser = new User({
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        userType: "Client",
        password: CryptoJS.AES.encrypt(req.body.password, process.env.SECRET),
        otp: otp,
      });

      // Save user
      await newUser.save();

      // Send OTP to email
      sendMail(newUser.email, otp);

      res
        .status(201)
        .json({ status: true, message: "Usuário criado com sucesso." });
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  },

  loginUserA: async (req, res) => {
    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!emailRegex.test(req.body.email)) {
      return res
        .status(400)
        .json({ status: false, message: "E-mail não é válido" });
    }

    const minPassword = 5;

    if (req.body.password < minPassword) {
      return res
        .status(400)
        .json({
          status: false,
          message: "A senha deve ter no máximo " + minPassword + " caracteres",
        });
    }

    try {
      const user = await User.findOne({ email: req.body.email });

      if (!user) {
        return res
          .status(400)
          .json({ status: false, message: "Usuário não encontrado" });
      }

      const decryptedPassword = CryptoJS.AES.decrypt(
        user.password,
        process.env.SECRET
      );
      const depassword = decryptedPassword.toString(CryptoJS.enc.Utf8);

      if (depassword !== req.body.password) {
        return res
          .status(400)
          .json({ status: false, message: "Senha incorreta" });
      }

      const userToken = jwt.sign({
        id: user._id,
        userType: user.userType,
        email: user.email,
      }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE }
      );

      const { password, createdAt, updatedAt, __v, otp, ...others } = user._doc;

      res.status(200).json({ ...others, userToken });
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  },

  loginUser: async (req, res) => {
    const { identifier, password } = req.body; // Capture identifier (email, username, or phone number)

    // Input validation for identifier
    if (!identifier) {
      return res.status(400).json({
        status: false,
        message: "Por favor, forneça o e-mail, nome de usuário ou telefone.",
      });
    }

    const minPassword = 5;
    if (password <= minPassword || password == '') return res.status(400).json({ status: false, message: "A senha deve ser maior que 5 caracteres" })

    try {
      // Find user by email, username, or phone number (depending on your model)
      const user = await User.findOne({
        $or: [
          { email: identifier },
          { username: identifier },
          { phone: identifier },
        ],
      });

      if (!user) {
        return res
          .status(400)
          .json({ status: false, message: "Usuário não encontrado." });
      }

      // Secure password comparison using CryptoJS (assuming password is encrypted)
      const decryptedPassword = CryptoJS.AES.decrypt(
        user.password,
        process.env.SECRET
      );
      const depassword = decryptedPassword.toString(CryptoJS.enc.Utf8);
      if (depassword !== req.body.password) {
        return res
          .status(400)
          .json({ status: false, message: "Senha incorreta." });
      }

      // Generate JWT token with appropriate payload (avoid sensitive data)
      const token = jwt.sign(
        {
          id: user._id,
          userType: user.userType,
          address: user.address
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      // Exclude sensitive data from response
      const filteredUser = { ...user._doc };
      delete filteredUser.password;
      delete filteredUser.createdAt;
      delete filteredUser.updatedAt;
      delete filteredUser.__v;
      delete filteredUser.otp; // Remove any additional sensitive fields

      res.status(200).json({ ...filteredUser, token });
    } catch (error) {
      res
        .status(500)
        .json({ message: error.message });
    }
  },
};
