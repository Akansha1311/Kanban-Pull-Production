const express = require("express");
const router = express.Router();
const path = require("path");
const SewingBoard = require("../models/SewingBoardCompleted");
let FinishingAvailableProducts = require("../models/FinishingAvailableProducts");
let FinishingBoard = require("../models/FinishingBoard");
let FinishingBoardInProgress = require("../models/FinishingBoardInProgress");
let FinishingBoardCompleted = require("../models/FinishingBoardCompleted");
let PerformanceAnalyze = require("../models/PerformanceAnalyze");
let NotificationBoard = require("../models/NotificationBoard");
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

router.get("/", async (req, res) => {
  let data = await FinishingBoard.find({}, "-_id -__v -startedAt").lean();
  let inProgress = await FinishingBoardInProgress.find({}, "-_id -__v").lean();
  let completed = await FinishingBoardCompleted.find({}, "-_id -__v")
    .sort({ dateOfFinishing: 1 })
    .limit(5)
    .lean();
  res.render(path.join(__dirname, "../", "/views/finishing-board"), {
    data,
    inProgress,
    completed,
  });
});

router.get("/availableProducts", async (req, res) => {
  let data = await FinishingAvailableProducts.find({}, "-_id -__v")
    .lean()
    .sort({ dateOfFinishing: 1 });
  res.render(
    path.join(__dirname, "../", "/views/finishing-board-available-products"),
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
  let data = await FinishingAvailableProducts.find(obj, "-_id -__v")
    .sort({ dateOfFinishing: 1 })
    .lean();
  res.render(
    path.join(
      __dirname,
      "../",
      "/views/finishing-board-available-products.ejs"
    ),
    {
      data,
      moment,
    }
  );
});

router.get("/edit/:id", async (req, res) => {
  let id = req.params.id;
  let currentCard = await FinishingBoardInProgress.findOne(
    {
      id: id,
    },
    "-_id -__v"
  ).lean();
  res.render(path.join(__dirname, "../", "/views/edit-finishing-card.ejs"), {
    data: currentCard,
  });
});

router.post("/edit/:id", async (req, res) => {
  let id = req.params.id;
  let deletedCard = await FinishingBoardInProgress.findOneAndDelete({
    id: id,
  }).lean();
  let newCompletedCard = {};
  Object.keys(req.body).forEach(function (prop) {
    newCompletedCard[prop] = req.body[prop];
  });
  delete newCompletedCard["createdAt"];
  newCompletedCard.finishedGarments = req.body.finishedGarments;
  delete newCompletedCard["Number of Garments"];
  let availableCard = await FinishingAvailableProducts.create(newCompletedCard);
  let completdCard = await FinishingBoardCompleted.create(newCompletedCard);
  let notificationData = {
    dept: "One task Completed By Cutting Department",
  };
  let notification = await NotificationBoard.create(notificationData);
  newCompletedCard.dept = "finishing";
  let performanceCard = await PerformanceAnalyze.create(newCompletedCard);
  res.redirect("/finishing-board");
});

router.get("/:id", checkAuth, async (req, res) => {
  let id = req.params.id;
  let deletedCard = await FinishingBoard.findOneAndDelete({ id: id }).lean();
  let newInprogressCard = {};
  Object.keys(deletedCard).forEach(function (prop) {
    if (prop != "_id" || prop != "__v") {
      newInprogressCard[prop] = deletedCard[prop];
    }
  });
  delete newInprogressCard.startedAt;
  let inProgressCard = await FinishingBoardInProgress.create(newInprogressCard);
  res.redirect("/finishing-board");
});

router.get("/completed/:id", checkAuth, async (req, res) => {
  let id = req.params.id;
  let deletedCard = await FinishingBoardInProgress.findOneAndDelete({
    id: id,
  }).lean();
  let newCompletedCard = {};
  Object.keys(deletedCard).forEach(function (prop) {
    if (prop != "_id" || prop != "__v") {
      newCompletedCard[prop] = deletedCard[prop];
    }
  });
  newCompletedCard.dept = "finishing";
  let availableCard = await FinishingAvailableProducts.create(newCompletedCard);
  let completedCard = await FinishingBoardCompleted.create(newCompletedCard);
  newCompletedCard.dept = "finishing";
  delete newCompletedCard._id;

  let performance = await PerformanceAnalyze.create(newCompletedCard);
  let notificationData = {
    dept: "One task completed by Finishing Department",
  };
  let notifiction = await NotificationBoard.create(notificationData);
  res.redirect("/finishing-board");
});

module.exports = router;
