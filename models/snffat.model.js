const mongoose = require("mongoose");
const SNFFatRateSchema = new mongoose.Schema({
  SNF: {
    type: Number,
    required: true,
  },
  fat: {
    type: Number,
    required: true,
  },
  snffatmilkrate: {
    type: Number,
    required: true,
  },
});

const snffatrate = mongoose.model("SNFFatrate", SNFFatRateSchema);

module.exports = snffatrate;
