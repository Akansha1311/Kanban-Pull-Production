const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const moment = require("moment");

// var currentTime = new Date();
// var currentOffset = currentTime.getTimezoneOffset();
// var ISTOffset = 330; // IST offset UTC +5:30
// var ISTTime = new Date(
//   currentTime.getTime() + (ISTOffset + currentOffset) * 60000
// );

let PerformanceAnalyzeSchema = new Schema(
  {
    customer: {
      type: String,
    },
    supplier: {
      type: String,
    },
    linenumber: {
      type: String,
    },
    stylenumber: {
      type: String,
    },
    colour: {
      type: String,
    },
    size: {
      type: String,
    },
    date: {
      type: String,
    },
    requireddate: {
      type: String,
    },
    quantity: {
      type: String,
    },
    id: {
      type: String,
    },
    startedAt: {
      type: String,
    },
    published: {
      type: String,
      default: () => moment().format("llll"),
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { strict: false }
);

module.exports = mongoose.model("PerformanceAnalyze", PerformanceAnalyzeSchema);
