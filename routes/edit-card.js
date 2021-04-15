const router = require("express").Router();
const path = require("path");
const cuttingBoardTodo = require("../models/cuttingBoardTodo");
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

router.get("/:id", checkAuth, async (req, res) => {
  let id = req.params.id;
  let card = await SewingBoard.find({ id: id }).lean();
  let card2 = await cuttingBoardTodo.find({ id: id }).lean();
  if (card.length < 1) {
    res.render(path.join(__dirname, "../", "/views/edit-card.ejs"), {
      data: card2,
    });
  } else {
    res.render(path.join(__dirname, "../", "/views/edit-card.ejs"), {
      data: card,
    });
  }
});

router.post("/:id", checkAuth, async (req, res) => {
  let id = req.params.id;
  let card = await SewingBoard.find({ id: id }).lean();
  let card2 = await cuttingBoardTodo.find({ id: id }).lean();
  if (card.length < 1) {
    let deletedCard = await cuttingBoardTodo.findOneAndDelete({ id });
    let newCard = {};
    Object.keys(req.body).forEach(function (prop) {
      if (prop != "_id" || prop != "__v") {
        newCard[prop] = req.body[prop];
      }
    });
    delete newCard._id;
    delete newCard.__v;
    let editedCard = cuttingBoardTodo.create(newCard);
    res.redirect("/");
  } else {
    let deletedCard = await SewingBoard.findOneAndDelete({ id: id }).lean();
    let newCard = {};
    Object.keys(req.body).forEach(function (prop) {
      if (prop != "_id" || prop != "__v") {
        newCard[prop] = req.body[prop];
      }
    });
    delete newCard._id;
    delete newCard.__v;
    newCard.id = newCard.id.trim();
    let editedCard = await SewingBoard.create(newCard);
    res.redirect("/");
  }
});

module.exports = router;
