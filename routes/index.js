const express = require("express");
const router = express.Router();
const path = require("path");

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

//Method - 'GET'
//Route - '/'
router.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    res.render(path.join(__dirname, "../", "/views/index"), { auth: true });
  } else {
    res.render(path.join(__dirname, "../", "/views/index"), { auth: false });
  }
});

module.exports = router;
