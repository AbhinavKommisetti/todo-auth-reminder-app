const mongoose = require("mongoose");

const TodoSchema = new mongoose.Schema({
  userId: String,
  text: String,

  status: {
    type: String,
    enum: ["In Progress", "Completed"],
    default: "In Progress"
  },

  dueDate: Date,
  reminderTime: Date

}, { timestamps: true });

module.exports = mongoose.model("Todo", TodoSchema);