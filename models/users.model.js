const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const createHttpError = require("http-errors");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    required: true,
    default: "Customer",
  },
  PhoneNo: {
    type: Number,
    required: true,
    unique: true,
  },
  Address: {
    type: String,
    required: true,
    // unique:true
  },
});

UserSchema.pre("save", async function (next) {
  try {
    if (this.isNew) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(this.password, salt);
      this.password = hashedPassword;
    }
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.methods.isValidPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    next(error);
  }
};

const users = mongoose.model("User", UserSchema);

module.exports = users;
