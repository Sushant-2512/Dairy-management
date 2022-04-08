const express = require("express");
const createHttpError = require("http-errors");
const mongoose = require("mongoose");
const morgan = require("morgan");
require("dotenv").config();
const session = require("express-session");
const connectflash = require("connect-flash");
const passport = require("passport");
const MongoStore = require("connect-mongo");
const path = require("path");

const app = express();
app.use(morgan("dev"));
app.use(express.static("./public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
console.log(process.env.SESSION_SECRET);
// const MongoStore =  connectMongo(session)
app.use("/pdf", express.static(path.join(__dirname, "pdf")));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      // secure:true
      httpOnly: true,
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI_COM,
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());
require("./utils/passport.auth");

// app.use(connectflash())

app.use("/", require("./routes/index.route"));
app.use("/", require("./routes/auth.route"));
app.use("/", require("./routes/api.route"));
app.use("/Dash", require("./routes/Dash.route"));

app.use((req, res, next) => {
  next(createHttpError.NotFound());
});

app.use((error, req, res, next) => {
  error.status = error.status || 500;
  res.status(error.status);
  console.log(error);
  res.render("error", { error });
});

const port = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URI, {
    dbName: process.env.DB_NAME,
  })
  .then(() => {
    console.log("Database connected");
    app.listen(port, () => console.log(`app listening on port ${port}!`));
  })
  .catch((error) => {
    console.log(error);
  });
