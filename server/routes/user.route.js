const passport = require("passport");
require("../config/passport")(passport);
const router = require("express").Router();
const userController = require("../controllers/user.controller");

router.get("/", userController.getAllUsers);
router.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  userController.getUserById
);
router.put(
  "/update",
  passport.authenticate("jwt", { session: false }),
  userController.updateUser
);
router.delete(
  "/delete",
  passport.authenticate("jwt", { session: false }),
  userController.deleteUser
);
router.get(
  "/audit/report",
  passport.authenticate("jwt", { session: false }),
  userController.getUserAudit
);

module.exports = router;
