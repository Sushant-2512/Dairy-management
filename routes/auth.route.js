const router = require("express").Router();
const User = require("../models/users.model");
const { body, validationResult } = require("express-validator");
const passport = require("passport");

router.get("/login", (req, res, next) => {
  res.render("login");
});
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/Dash",

    failureRedirect: "/login",
  })
);

router.get("/register", (req, res, next) => {
  res.render("register");
});
router.post(
  "/register",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Enter Valid Email")
      .normalizeEmail()
      .toLowerCase(),
    body("password").trim(),
    body("address").trim(),
    body("name").trim(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw errors;

      const pass = req.body.password;
      const cpass = req.body.Cpassword;
      if (pass === cpass) {
        const user = new User({
          name: req.body.fullname,
          email: req.body.email,
          password: pass,
          milktype: req.body.type,
          role: req.body.role,
          PhoneNo: req.body.phnno,
          Address: req.body.address,
        });
        const users = await user.save();

        if (users) res.redirect("/login");
      } else {
        throw new Error("Password-confirm passsword not matching");
      }
    } catch (error) {
      next(error);
    }
  }
);

router.get("/logout", ensureAuthenticated, (req, res) => {
  req.logout();
  res.redirect("/login");
});
module.exports = router;

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/login");
  }
}

function ensureNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect("back");
  } else {
    next();
  }
}
