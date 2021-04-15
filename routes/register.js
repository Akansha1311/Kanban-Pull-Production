const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const shortid = require("shortid");
const User = require("../models/User");

router.post("/", async (req, res) => {
  let hashedPassword = bcrypt.hashSync(req.body.password, 10);
  let newUser = {
    email: req.body.email,
    password: hashedPassword,
    id: shortid.generate(),
  };
  let user = await User.create(newUser);
  if (user) {
    res.send("success");
  } else {
    res.send("error");
  }
});

module.exports = router;
