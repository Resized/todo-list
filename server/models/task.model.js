// task model
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    done: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: "date", updatedAt: false }, versionKey: false }
);

module.exports = mongoose.model("Task", taskSchema);
