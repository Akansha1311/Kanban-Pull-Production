const express = require("express");
let shortid = require("shortid");
const router = express.Router();
const path = require("path");
const cuttingBoard = require("../models/cuttingBoardTodo");
const CuttingBoardInProgress = require("../models/CuttingBoardInProgress");
const CuttingBoardCompleted = require("../models/CuttingBoardCompleted");
let sewingBoard = require("../models/SewingBoard");
let CuttingAvailableProducts = require("../models/CuttingAvailableProducts");
let PerformanceAnalyze = require("../models/PerformanceAnalyze");
let NotificationBoard = require("../models/NotificationBoard");
const moment = require("moment");

const cuttingBoardTodo = require("../models/cuttingBoardTodo");
// let CuttingBoardInProgress = require("../models/CuttingBoardInProgress");

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

//Method = GET
//Route = /cutting-board
router.get("/", async (req, res) => {
  let cuttingData = await cuttingBoard.find({}, "-_id -__v -startedAt").lean();
  let inProgress = await CuttingBoardInProgress.find({}, "-_id -__v").lean();
  let completed = await CuttingBoardCompleted.find({}, "-_id -__v")
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();
  res.render(path.join(__dirname, "../", "/views/cutting-board"), {
    data: cuttingData,
    inProgress,
    completed,
  });
});
router.get("/availableProducts", async (req, res) => {
  let data = await CuttingAvailableProducts.find({}, "-_id -__v").lean();
  res.render(
    path.join(__dirname, "../", "/views/cutting-board-available-products.ejs"),
    { data }
  );
});

router.post("/filter", async (req, res) => {
  let obj = {};
  Object.keys(req.body).forEach(function (prop) {
    if (req.body[prop] && prop != "date") {
      // obj[prop] = req.body[prop];
      obj[prop] = { $regex: new RegExp(req.body[prop], "i") };
    }
    if (req.body[prop] && (prop == "date" || prop == "dateOfCutting")) {
      obj[prop] = req.body[prop];
    }
  });
  let data = await CuttingAvailableProducts.find(obj, "-_id -__v")
    .sort({ createdAt: -1 })
    .lean();
  res.render(
    path.join(__dirname, "../", "/views/cutting-board-available-products.ejs"),
    {
      data,
      moment,
    }
  );
});

router.get("/:id", checkAuth, async (req, res) => {
  let id = req.params.id;
  let deletedCard = await cuttingBoard.findOneAndDelete({ id: id }).lean();
  let newInprogressCard = {};
  Object.keys(deletedCard).forEach(function (prop) {
    if (prop != "_id" || prop != "__v") {
      newInprogressCard[prop] = deletedCard[prop];
    }
  });
  delete newInprogressCard.startedAt;
  let inProgressCard = await CuttingBoardInProgress.create(newInprogressCard);
  res.redirect("/cutting-board");
});

router.get("/completed/:id", checkAuth, async (req, res) => {
  let id = req.params.id;
  let deletedCard = await CuttingBoardInProgress.findOneAndDelete({
    id: id,
  }).lean();
  let newCompletedCard = {};
  Object.keys(deletedCard).forEach(function (prop) {
    if (prop != "_id" || prop != "__v") {
      newCompletedCard[prop] = deletedCard[prop];
    }
  });
  let completedCard = await CuttingBoardCompleted.create(newCompletedCard);
  let sewingCard = await sewingBoard.create(newCompletedCard);
  // let deleteFabricAvailableProduct = await AvailableProducts.findOneAndDelete({
  //   id: id,
  //   dept: "fabric",
  // });
  newCompletedCard.dept = "cutting";
  // let availableCard = await AvailableProducts.create(newCompletedCard);
  delete newCompletedCard._id;
  let performance = await PerformanceAnalyze.create(newCompletedCard);
  let notificationData = {
    dept: "One task completed by Cutting Department",
  };
  let notifiction = await NotificationBoard.create(notificationData);
  res.redirect("/cutting-board");
});

router.get("/edit/:id", async (req, res) => {
  let id = req.params.id;
  let currentCard = await CuttingBoardInProgress.findOne(
    {
      id: id,
    },
    "-_id -__v"
  ).lean();
  res.render(path.join(__dirname, "../", "/views/edit-cutting-card.ejs"), {
    data: currentCard,
  });
});

router.post("/edit/:id", async (req, res) => {
  let id = req.params.id;
  let deletedCard = await CuttingBoardInProgress.findOneAndDelete({
    id: id,
  }).lean();
  let newCompletedCard = {};
  Object.keys(req.body).forEach(function (prop) {
    newCompletedCard[prop] = req.body[prop];
  });
  delete newCompletedCard["createdAt"];
  let piecesCutValue = req.body.piecesCut;
  newCompletedCard.piecesCut = piecesCutValue;
  delete newCompletedCard["length"];
  let availableCard = await CuttingAvailableProducts.create(newCompletedCard);
  let completdCard = await CuttingBoardCompleted.create(newCompletedCard);
  let notificationData = {
    dept: "One task Completed By Cutting Department",
  };
  let notification = await NotificationBoard.create(notificationData);
  res.redirect("/cutting-board");
});

router.get("/delete/:id", async (req, res) => {
  let id = req.params.id;
  let deletedCard = await CuttingAvailableProducts.findOneAndDelete({
    id: id,
  });
  res.redirect("/cutting-board/availableProducts");
});

router.post("/start/:id", checkAuth, async (req, res) => {
  let id = req.params.id;
  let pieces = req.body["piecesCut"];
  let deletedCard = await CuttingAvailableProducts.findOneAndDelete({
    id: id,
  }).lean();
  let newAvailableCard = {};
  let newSewingCard = {};
  Object.keys(deletedCard).forEach(function (prop) {
    if (prop != "_id" || prop != "__v") newSewingCard[prop] = deletedCard[prop];
    newAvailableCard[prop] = deletedCard[prop];
  });
  delete newAvailableCard["_id"];
  delete newAvailableCard["__v"];
  delete newSewingCard["_id"];
  delete newSewingCard["__v"];
  newSewingCard.id = shortid.generate();
  newAvailableCard["piecesCut"] = deletedCard["piecesCut"] - pieces;
  newSewingCard["Number of Pieces"] = Number(pieces);

  if (newAvailableCard["piecesCut"] > 0) {
    let availbePushedCard = await CuttingAvailableProducts.create(
      newAvailableCard
    );
  }
  // let cuttingPushedCard = await cuttingBoardTodo.create(newCuttingTodoCard);
  delete newSewingCard["piecesCut"];
  delete newSewingCard["dateOfCutting"];
  newSewingCard.dateOfSewing = req.body.dateOfSewing;
  let sewingPushedCard = await sewingBoard.create(newSewingCard);
  res.redirect("/cutting-board/availableProducts");
});

module.exports = router;
