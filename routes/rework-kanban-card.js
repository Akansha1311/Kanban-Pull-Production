const router = require("express").Router();
let path = require("path");
let shortid = require("shortid");
let mongoose = require("mongoose");
const SewingBoard = require("../models/SewingBoard");

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
  res.render(path.join(__dirname, "../", "/views/rework-kanban-card"));
});

router.post("/", checkAuth, async (req, res) => {
  let newCard = {};
  Object.keys(req.body).forEach(function (prop) {
    newCard[prop] = req.body[prop];
  });
  newCard.id = shortid.generate();
  let card = await SewingBoard.create(newCard);

  res.redirect("/rework-kanban-card");
});

module.exports = router;
