const express = require("express");
const router = express.Router();
const path = require("path");
let shortid = require("shortid");
let mongoose = require("mongoose");
let KanbanCard = require("../models/KanbanCard");

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
//route - /production-kanban-card
router.get("/", checkAuth, (req, res) => {
  res.render(path.join(__dirname, "../", "/views/production-kanban-card"));
});

//Method - 'POST
//Route - /production-kanban-card
router.post("/", checkAuth, async (req, res) => {
  let newCard = {};
  Object.keys(req.body).forEach(function (prop) {
    newCard[prop] = req.body[prop];
  });
  newCard.id = shortid.generate();
  let card = await KanbanCard.create(newCard);
  res.redirect("/production-kanban-card");
});

module.exports = router;
