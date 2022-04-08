const mongoose = require("mongoose");

const MilkmanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  date: {
    type: String,
    required: true,
  },

  milktype: {
    type: String,
  },
  quantity: {
    type: Number,
    required: true,
  },
  SNF: {
    type: Number,
    required: true,
  },
  fat: {
    type: Number,
    required: true,
  },
  rateperlit: {
    type: Number,
    required: true,
  },
});

const milkman = mongoose.model("Milkman", MilkmanSchema);

module.exports = milkman;
