const mongoose = require("mongoose");

const CowMilkRateSchema = new mongoose.Schema({
  todaymilkratecow: {
    type: Number,
    required: true,
  },
});

const milkrate = mongoose.model("Cowmilkrate", CowMilkRateSchema);

module.exports = milkrate;
