const router = require("express").Router();
const path = require("path");
let NotificationBoard = require("../models/NotificationBoard");

router.get("/", async (req, res) => {
  let data = await NotificationBoard.find({}).sort({ published: -1 }).lean();
  res.render(path.join(__dirname, "../", "/views/notification-board.ejs"), {
    data,
  });
});

router.get("/deleteall", async (req, res) => {
  let data = await NotificationBoard.deleteMany({});
  res.redirect("/notification-board");
});

module.exports = router;
