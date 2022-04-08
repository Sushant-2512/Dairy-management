const mongoose = require("mongoose");

const BuffaloMilkRateSchema = new mongoose.Schema({
  todaymilkratebuffalo: {
    type: Number,
    required: true,
  },
});

const buffalomilkrate = mongoose.model(
  "Buffalomilkrate",
  BuffaloMilkRateSchema
);

module.exports = buffalomilkrate;
