const express = require("express");
const router = express.Router();
const path = require("path");
let AvailableProducts = require("../models/AvailableProducts");

//Method = GET
//Route = /available-products
router.get("/", async (req, res) => {
  let fabric = await AvailableProducts.find({ dept: "fabric" }, "-_id -__v")
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();
  let cutting = await AvailableProducts.find({ dept: "cutting" }, "-_id -__v")
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();
  let sewing = await AvailableProducts.find({ dept: "sewing" }, "-_id -__v")
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();
  let finishing = await AvailableProducts.find(
    { dept: "finishing" },
    "-_id -__v"
  )
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();
  res.render(path.join(__dirname, "../", "/views/available-products"), {
    fabric,
    cutting,
    sewing,
    finishing,
  });
});

module.exports = router;
