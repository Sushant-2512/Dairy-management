const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema({
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
  rateperlit: {
    type: Number,
    required: true,
  },
});

const customer = mongoose.model("Customer", CustomerSchema);

module.exports = customer;
