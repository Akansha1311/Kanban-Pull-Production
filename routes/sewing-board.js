const express = require("express");
const router = express.Router();
const path = require("path");
const SewingBoard = require("../models/SewingBoard");
const SewingBoardInProgress = require("../models/SewingBoardInProgress");
const SewingBoardCompleted = require("../models/SewingBoardCompleted");
const AvailableProducts = require("../models/AvailableProducts");
let FinishingBoard = require("../models/FinishingBoard");
let ReworkKanbanCard = require("../models/ReworkKanbanCard");
let PerformanceAnalyze = require("../models/PerformanceAnalyze");
let NotificationBoard = require("../models/NotificationBoard");
let SewingAvailableProducts = require("../models/SewingAvailableProducts");
let shortid = require("shortid");
const moment = require("moment");

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
//Route = /sewing-board
router.get("/", async (req, res) => {
  let data = await SewingBoard.find({}, "-_id -__v -startedAt").lean();
  let reworkdata = await ReworkKanbanCard.find({}, "-_id -__v").lean();
  let inProgress = await SewingBoardInProgress.find({}, "-_id -__v").lean();
  let completed = await SewingBoardCompleted.find({}, "-_id -__v")
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();
  res.render(path.join(__dirname, "../", "/views/sewing-board"), {
    data,
    inProgress,
    completed,
    reworkdata,
  });
});

router.get("/availableProducts", async (req, res) => {
  let data = await SewingAvailableProducts.find({}, "-_id -__v")
    .lean()
    .sort({ createdAt: -1 });
  res.render(
    path.join(__dirname, "../", "/views/sewing-board-available-products"),
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
    if (req.body[prop] && prop == "date") {
      obj[prop] = req.body[prop];
    }
  });
  let data = await SewingAvailableProducts.find(obj, "-_id -__v")
    .sort({ createdAt: -1 })
    .lean();
  res.render(
    path.join(__dirname, "../", "/views/sewing-board-available-products.ejs"),
    {
      data,
      moment,
    }
  );
});

router.get("/:id", checkAuth, async (req, res) => {
  let id = req.params.id;
  let deletedCard = await SewingBoard.findOneAndDelete({ id: id }).lean();
  let newInprogressCard = {};
  Object.keys(deletedCard).forEach(function (prop) {
    if (prop != "_id" || prop != "__v") {
      newInprogressCard[prop] = deletedCard[prop];
    }
  });

  delete newInprogressCard.startedAt;
  let inProgressCard = await SewingBoardInProgress.create(newInprogressCard);
  res.redirect("/sewing-board");
});

router.get("/completed/:id", checkAuth, async (req, res) => {
  let id = req.params.id;
  let deletedCard = await SewingBoardInProgress.findOneAndDelete({
    id: id,
  }).lean();
  let newCompletedCard = {};
  Object.keys(deletedCard).forEach(function (prop) {
    if (prop != "_id" || prop != "__v")
      newCompletedCard[prop] = deletedCard[prop];
  });
  let completedCard = await SewingBoardCompleted.create(newCompletedCard);
  let deleteCuttingAvailableProduct = await AvailableProducts.findOneAndDelete({
    id: id,
    dept: "cutting",
  });
  newCompletedCard.dept = "sewing";
  let availableCard = await AvailableProducts.create(newCompletedCard);
  let FinishingBoardCard = await FinishingBoard.create(newCompletedCard);
  delete newCompletedCard._id;
  let performance = await PerformanceAnalyze.create(newCompletedCard);
  let notificationData = {
    dept: "One task completed by Sewing Department",
  };
  let notifiction = await NotificationBoard.create(notificationData);
  res.redirect("/sewing-board");
});

router.get("/edit/:id", async (req, res) => {
  let id = req.params.id;
  let currentCard = await SewingBoardInProgress.findOne(
    {
      id: id,
    },
    "-_id -__v"
  ).lean();
  res.render(path.join(__dirname, "../", "/views/edit-sewing-card.ejs"), {
    data: currentCard,
  });
});

router.post("/edit/:id", async (req, res) => {
  let id = req.params.id;
  let deletedCard = await SewingBoardInProgress.findOneAndDelete({
    id: id,
  }).lean();
  let newCompletedCard = {};
  Object.keys(req.body).forEach(function (prop) {
    newCompletedCard[prop] = req.body[prop];
  });
  delete newCompletedCard["createdAt"];
  let garmentsMadeValue = req.body.garmentsMade;
  newCompletedCard.garmentsMade = garmentsMadeValue;
  delete newCompletedCard["Number of Pieces"];
  let completdCard = await SewingBoardCompleted.create(newCompletedCard);
  let availableCard = await SewingAvailableProducts.create(newCompletedCard);
  let notificationData = {
    dept: "One task Completed By Cutting Department",
  };
  let notification = await NotificationBoard.create(notificationData);
  newCompletedCard.dept = "sewing";
  let performanceCard = await PerformanceAnalyze.create(newCompletedCard);
  res.redirect("/sewing-board");
});

router.post("/start/:id", checkAuth, async (req, res) => {
  let id = req.params.id;
  let garments = req.body["garmentsMade"];
  let deletedCard = await SewingAvailableProducts.findOneAndDelete({
    id: id,
  }).lean();
  let newAvailableCard = {};
  let newFinishingCard = {};
  Object.keys(deletedCard).forEach(function (prop) {
    if (prop != "_id" || prop != "__v")
      newFinishingCard[prop] = deletedCard[prop];
    newAvailableCard[prop] = deletedCard[prop];
  });
  delete newAvailableCard["_id"];
  delete newAvailableCard["__v"];
  delete newFinishingCard["_id"];
  delete newFinishingCard["__v"];
  newFinishingCard.id = shortid.generate();
  newAvailableCard["garmentsMade"] = deletedCard["garmentsMade"] - garments;
  newFinishingCard["Number of Garments"] = Number(garments);

  if (newAvailableCard["garmentsMade"] > 0) {
    let availbePushedCard = await SewingAvailableProducts.create(
      newAvailableCard
    );
  }
  // let cuttingPushedCard = await cuttingBoardTodo.create(newCuttingTodoCard);
  delete newFinishingCard["garmentsMade"];
  delete newFinishingCard["dateOfSewing"];
  newFinishingCard.dateOfFinishing = req.body.dateOfFinishing;
  let sewingPushedCard = await FinishingBoard.create(newFinishingCard);
  res.redirect("/sewing-board/availableProducts");
});

module.exports = router;
