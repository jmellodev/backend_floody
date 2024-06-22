const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const crypto = require("crypto");

// Import routes
const FoodRoute = require("./routes/food.routes");
const RatingRoute = require("./routes/rating.routes");
const CategoryRoute = require("./routes/category.routes");
const RestaurantRoute = require("./routes/restaurant.routes");
const AuthRoute = require("./routes/auth.routes");
const UserRoute = require("./routes/user.routes");
const AddressRoute = require("./routes/address.routes");
const CartRoute = require("./routes/cart.routes");
const OrderRoute = require("./routes/order.routes");
const FavoriteRoute = require("./routes/favorite.routes");

// Initialize app
const app = express();
dotenv.config();

// Generate a secure JWT_SECRET
const secret = crypto.randomBytes(64).toString("hex");
// console.log(secret);

// Database connection
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("Floody Database connected"))
  .catch((err) => console.error(err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const routes = [
  { path: "/api/v1/auth", route: AuthRoute },
  { path: "/api/v1/users", route: UserRoute },
  { path: "/api/v1/category", route: CategoryRoute },
  { path: "/api/v1/restaurant", route: RestaurantRoute },
  { path: "/api/v1/foods", route: FoodRoute },
  { path: "/api/v1/rating", route: RatingRoute },
  { path: "/api/v1/address", route: AddressRoute },
  { path: "/api/v1/cart", route: CartRoute },
  { path: "/api/v1/order", route: OrderRoute },
  { path: "/api/v1/favorite", route: FavoriteRoute }
];

routes.forEach(({ path, route }) => app.use(path, route));

// Start server
const PORT = process.env.PORT || 6013;
app.listen(PORT, () => console.log(`Floody Backend is running on ${PORT}!`));
