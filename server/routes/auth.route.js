const passport = require("passport");
require("../config/passport")(passport);
const router = require("express").Router();
const authController = require("../controllers/auth.controller");

router.post(
  "/register",
  authController.registerUser
);
router.post("/login", authController.logInUser);
router.get(
  "/protected",
  passport.authenticate("jwt", { session: false }),
  authController.protectedRoute
);

module.exports = router;
