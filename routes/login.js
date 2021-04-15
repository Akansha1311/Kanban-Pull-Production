const express = require("express");
const router = express.Router();
const path = require("path");
const passport = require("passport");

function checkAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    let data = req.flash("message")[0];
    res.render(path.join(__dirname, "../", "/views/login"), {
      message: "",
      data,
    });
  }
}

router.get("/", checkAuth, (req, res) => {
  res.render(path.join(__dirname, "../", "/views/login"), {
    message: "",
    data: "",
  });
});

router.post(
  "/",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  function (req, res) {
    res.redirect("/");
  }
);
module.exports = router;
