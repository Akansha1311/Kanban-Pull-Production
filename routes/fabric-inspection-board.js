const express = require("express");
const router = express.Router();
const path = require("path");
const moment = require("moment");
const shortid = require("shortid");
const KanbanCard = require("../models/KanbanCard");
const FabricInspectionBoardInProgress = require("../models/FabricInspectionBoardInProgress");
const FabricInspectionBoardCompleted = require("../models/FabricInspectionBoardCompleted");
let PerformanceAnalyze = require("../models/PerformanceAnalyze");
let NotificationBoard = require("../models/NotificationBoard");
let FabircInspectionAvailableProducts = require("../models/FabricInspectionAvailableProducts");
const FabricInspectionAvailableProducts = require("../models/FabricInspectionAvailableProducts");
let cuttingBoardTodo = require("../models/cuttingBoardTodo");

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
//Route = /fabric-inspection-board
router.get("/", async (req, res) => {
  let Kanbandata = await KanbanCard.find({}, "-_id -__v").lean().limit(5);
  let inProgressData = await FabricInspectionBoardInProgress.find(
    {},
    "-_id -__v"
  ).lean();
  let completedData = await FabricInspectionBoardCompleted.find({}, "-_id -__v")
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();
  res.render(path.join(__dirname, "../", "/views/fabric-inspection-board"), {
    data: Kanbandata,
    inProgress: inProgressData,
    completed: completedData,
  });
});

router.get("/availableProducts", async (req, res) => {
  let data = await FabricInspectionAvailableProducts.find({}, "-_id -__v")
    .sort({ createdAt: -1 })
    .lean();
  res.render(
    path.join(__dirname, "../", "/views/fabricInspectionAvailableProducts"),
    {
      data,
      moment,
    }
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
  let data = await FabircInspectionAvailableProducts.find(obj, "-_id -__v")
    .sort({ createdAt: -1 })
    .lean();
  res.render(
    path.join(__dirname, "../", "/views/fabricInspectionAvailableProducts.ejs"),
    {
      data,
      moment,
    }
  );
});

router.get("/:id", checkAuth, async (req, res) => {
  let id = req.params.id;
  let deletedCard = await KanbanCard.findOneAndDelete({ id: id }).lean();
  let newInProgressCard = {};
  Object.keys(deletedCard).forEach(function (prop) {
    if (prop != "_id" || prop != "__v")
      newInProgressCard[prop] = deletedCard[prop];
  });
  let inProgressCard = await FabricInspectionBoardInProgress.create(
    newInProgressCard
  );
  res.redirect("/fabric-inspection-board");
});

router.get("/completed/:id", checkAuth, async (req, res) => {
  let id = req.params.id;
  let deletedCard = await FabricInspectionBoardInProgress.findOneAndDelete({
    id: id,
  }).lean();
  let newCompletedCard = {};
  Object.keys(deletedCard).forEach(function (prop) {
    if (prop != "_id" || prop != "__v")
      newCompletedCard[prop] = deletedCard[prop];
  });
  let completedCard = await FabricInspectionBoardCompleted.create(
    newCompletedCard
  );
  let AvailableProduct = await FabircInspectionAvailableProducts.create(
    newCompletedCard
  );
  // let cuttingCard = await cuttingBoardTodo.create(newCompletedCard);
  // newCompletedCard.dept = "fabric";
  // let availableCard = await AvailableProducts.create(newCompletedCard);
  // delete newCompletedCard._id;

  let notificationData = {
    dept: "One task completed by Fabric Inspection Department",
  };
  let notifiction = await NotificationBoard.create(notificationData);
  newCompletedCard.dept = "fabric";
  let performance = await PerformanceAnalyze.create(newCompletedCard);
  res.redirect("/fabric-inspection-board");
});

router.get("/delete/:id", async (req, res) => {
  let id = req.params.id;
  let deletedCard = await FabricInspectionAvailableProducts.findOneAndDelete({
    id: id,
  });
  res.redirect("/fabric-inspection-board/availableProducts");
});

router.post("/start/:id", checkAuth, async (req, res) => {
  let id = req.params.id;
  let formLength = req.body["length"];
  let deletedCard = await FabricInspectionAvailableProducts.findOneAndDelete({
    id: id,
  }).lean();
  let newAvailableCard = {};
  let newCuttingTodoCard = {};
  Object.keys(deletedCard).forEach(function (prop) {
    if (prop != "_id" || prop != "__v")
      newCuttingTodoCard[prop] = deletedCard[prop];
    newAvailableCard[prop] = deletedCard[prop];
  });
  delete newAvailableCard["_id"];
  delete newAvailableCard["__v"];
  delete newCuttingTodoCard["_id"];
  delete newCuttingTodoCard["__v"];
  newCuttingTodoCard.id = shortid.generate();
  newAvailableCard["length"] = deletedCard["length"] - formLength;
  newCuttingTodoCard["length"] = Number(formLength);

  if (newAvailableCard["length"] > 0) {
    let availbePushedCard = await FabricInspectionAvailableProducts.create(
      newAvailableCard
    );
  }
  newCuttingTodoCard.dateOfCutting = req.body.dateOfCutting;
  let cuttingPushedCard = await cuttingBoardTodo.create(newCuttingTodoCard);
  res.redirect("/fabric-inspection-board/availableProducts");
});

module.exports = router;
