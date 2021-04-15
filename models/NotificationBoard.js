const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const moment = require("moment");

const NotificationBoardSchema = new Schema(
  {
    dept: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 3600,
    },
    published: {
      type: String,
      default: () => moment().format("llll"),
    },
  },
  { strict: false }
);

module.exports = mongoose.model("NotificationBoard", NotificationBoardSchema);
