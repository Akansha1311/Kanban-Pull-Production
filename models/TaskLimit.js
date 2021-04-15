const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let TaskLimitSchema = new Schema({
  limit: {
    type: Number,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("TaskLimit", TaskLimitSchema);
