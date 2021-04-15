const router = require("express").Router();
const TaskLimit = require("../models/TaskLimit");
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

router.get("/", async (req, res) => {
  let limit = await TaskLimit.findOne({ id: "tasklimitid" });
  res.json(limit);
});

router.get("/set-limit", checkAuth, async (req, res) => {
  res.render(path.join(__dirname, "../", "/views/task-limit"));
});

router.post("/set-limit", checkAuth, async (req, res) => {
  let limit = req.body.limit;
  let DBlimit = await TaskLimit.findOne({ id: "tasklimitid" });
  DBlimit.limit = limit;
  DBlimit.save();
  res.redirect("/");
});

module.exports = router;
