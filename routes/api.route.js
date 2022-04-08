const Customer = require("../models/customer.model");
const Milkman = require("../models/milkman.model");
const CowMilkRate = require("../models/milkrate.model");
const BuffaloMilkRate = require("../models/buffalomilkrate.model");
const SNFFatRate = require("../models/snffat.model");
const User = require("../models/users.model");
const axios = require("axios");
const ejs = require("ejs");
const path = require("path");
const pdf = require("html-pdf");

const router = require("express").Router();

router.get("/api/count/milkman", async (req, res, next) => {
  try {
    const count = await User.find({ role: "Milkman" });

    // console.log(milkman)
    if (count) res.send(count);
    //  console.log(req.body)
  } catch (error) {
    next(error);
  }
});
router.get("/api/count/customer", async (req, res, next) => {
  try {
    const count = await User.find({ role: "Customer" });

    // console.log(milkman)
    if (count) res.send(count);
    //  console.log(req.body)
  } catch (error) {
    next(error);
  }
});

router.get("/api/milkman", async (req, res, next) => {
  try {
    if (!req.query) throw new Error("Please enter valid information");
    const name = req.query.name;

    const milkman = await Milkman.find({ name }).sort({ date: 1 });

    console.log(milkman);
    if (milkman) res.send(milkman);
    //  console.log(req.body)
  } catch (error) {
    next(error);
  }
});

router.post("/api/milkman", async (req, res, next) => {
  try {
    if (!req.body) throw new Error("Please enter valid information");

    const milkman = new Milkman({
      name: req.body.name,
      date: req.body.date,
      milktype: req.body.type,
      quantity: req.body.quantity,
      SNF: req.body.SNF,
      fat: req.body.fat,
      rateperlit: req.body.rateperlit,
    });
    const milkmans = await milkman.save();

    console.log(req.body);
    if (milkmans) res.redirect("/Dash/admin");
    //  res.render("home")
  } catch (error) {
    next(error);
  }
});

router.post("/api/milkman/search", async (req, res, next) => {
  try {
    const sdate = req.body.sdate;
    const edate = req.body.edate;
    const name = req.user.name;
    // console.log(edate);
    // console.log(sdate);

    axios
      .get("http://localhost:3000/api/milkman/search", {
        params: {
          sdate,
          edate,
          name,
        },
      })
      .then(function (response) {
        // console.log(response.data)

        let total = response.data.reduce(function (pre, cur) {
          return pre + cur.rateperlit * cur.quantity;
        }, 0);
        let quantity = response.data.reduce(function (pre, cur) {
          return pre + cur.quantity;
        }, 0);
        if (edate == "" || sdate == "") {
          total = 0;
          quantity = 0;
          response.data = [];
        }
        res.render("milkmanDashtotal", {
          user: response.data,
          name,
          total,
          quantity,
        });
        ejs.renderFile(
          path.join(__dirname, "../views/", "milkmanpdf.ejs"),
          { user: response.data, total, quantity },
          (err, data) => {
            if (err) {
              console.log(err);
            } else {
              let options = {
                height: "11.25in",
                width: "8.5in",
                format: "A4", // allowed units: A3, A4, A5, Legal, Letter, Tabloid
                orientation: "portrait",
                border: {
                  top: "0.5", // default is 0, units: mm, cm, in, px
                  right: "0.5in",
                  bottom: "0.5in",
                  left: "0.5in",
                },
                header: {
                  height: "20mm",
                  contents: `<div ><h2 style="color:green;">Milkman Invoice</h2></div>`,
                },
                footer: {
                  height: "10mm",
                  contents: {
                    first: "1",
                    2: "2", // Any page number is working. 1-based index
                    default:
                      '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
                    last: "Last Page",
                  },
                },
              };
              pdf
                .create(data, options)
                .toFile("pdf/milkman.pdf", function (err, data) {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log("File created successfully");
                  }
                });
            }
          }
        );
      })
      .catch((err) => next(err));
  } catch (error) {
    next(error);
  }
});
router.get("/api/milkman/search", async (req, res, next) => {
  try {
    //    console.log(req.query.date)
    const sdate = req.query.sdate;
    const edate = req.query.edate;
    const name = req.query.name;

    if (edate == "" || sdate == "") {
      const milkman = await Milkman.find({ name }).sort({ date: 1 });

      // console.log(milkman)
      if (milkman) res.send(milkman);
      // res.redirect("/Dash/admin/milkmantrack")
    }
    const milkman = await Milkman.find({
      $and: [
        { $and: [{ date: { $gte: sdate } }, { date: { $lte: edate } }] },
        { name },
      ],
    }).sort({ date: 1 });

    console.log(milkman);
    if (milkman) res.send(milkman);
  } catch (error) {
    next(error);
  }
});
router.get("/api/milkman/delete", async (req, res, next) => {
  try {
    if (!req.query.id) throw new Error("Please enter valid information");
    const id = req.query.id;

    Milkman.findByIdAndDelete(id)
      .then((data) => {
        console.log(data);
        if (data) {
          //   SNFFatRate.deleteOne({ "_id" : ObjectId("id") })
          res.redirect("/Dash/admin/milkmantrack");
        }
        //   res.send({messege : "User Deleted successfully"})
      })
      .catch((err) => {
        next(err);
      });
    // const snffatrates = await snffatrate.save()

    //  res.render("home")
  } catch (error) {
    next(error);
  }
});

router.get("/api/customer", async (req, res, next) => {
  try {
    if (!req.query) throw new Error("Please enter valid information");

    const name = req.query.name;
    const customer = await Customer.find({ name }).sort({ date: 1 });

    console.log(customer);
    if (customer) res.send(customer);

    //  console.log(req.body)
  } catch (error) {
    next(error);
  }
});

router.post("/api/customer", async (req, res, next) => {
  try {
    if (!req.body) throw new Error("Please enter valid information");

    const customer = new Customer({
      name: req.body.name,
      date: req.body.date,
      milktype: req.body.type,
      quantity: req.body.quantity,
      rateperlit: req.body.rateperlit,
    });
    const customers = await customer.save();
    console.log(customers);
    if (customers) res.redirect("/Dash/admin");
    console.log(req.body);
    //  res.render("home")
  } catch (error) {
    next(error);
  }
});

router.get("/api/customer/delete", async (req, res, next) => {
  try {
    if (!req.query.id) throw new Error("Please enter valid information");
    const id = req.query.id;

    Customer.findByIdAndDelete(id)
      .then((data) => {
        console.log(data);
        if (data) {
          //   SNFFatRate.deleteOne({ "_id" : ObjectId("id") })
          res.redirect("/Dash/admin/customertrack");
        }
        //   res.send({messege : "User Deleted successfully"})
      })
      .catch((err) => {
        next(err);
      });
    // const snffatrates = await snffatrate.save()

    //  res.render("home")
  } catch (error) {
    next(error);
  }
});

router.post("/api/customer/search", async (req, res, next) => {
  try {
    const sdate = req.body.sdate;
    const edate = req.body.edate;
    const name = req.user.name;
    // console.log(edate);
    // console.log(sdate);

    axios
      .get("http://localhost:3000/api/customer/search", {
        params: {
          sdate,
          edate,
          name,
        },
      })
      .then(function (response) {
        // console.log(response.data)

        let total = response.data.reduce(function (pre, cur) {
          return pre + cur.rateperlit * cur.quantity;
        }, 0);
        let quantity = response.data.reduce(function (pre, cur) {
          return pre + cur.quantity;
        }, 0);
        if (edate == "" || sdate == "") {
          total = 0;
          quantity = 0;
          response.data = [];
        }
        res.render("customerDashtotal", {
          user: response.data,
          name,
          total,
          quantity,
        });
        ejs.renderFile(
          path.join(__dirname, "../views/", "customerpdf.ejs"),
          { user: response.data, total, quantity, sdate, edate },
          (err, data) => {
            if (err) {
              console.log(err);
            } else {
              let options = {
                height: "11.25in",
                width: "8.5in",
                format: "A4", // allowed units: A3, A4, A5, Legal, Letter, Tabloid
                orientation: "portrait",
                border: {
                  top: "0.5", // default is 0, units: mm, cm, in, px
                  right: "0.5in",
                  bottom: "0.5in",
                  left: "0.5in",
                },
                header: {
                  height: "20mm",
                  contents: `<div ><h2 style="color:green;">Customer Invoice</h2></div>`,
                },
                footer: {
                  height: "10mm",
                  contents: {
                    first: "1",
                    2: "2", // Any page number is working. 1-based index
                    default:
                      '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
                    last: "Last Page",
                  },
                },
              };
              pdf
                .create(data, options)
                .toFile("pdf/customer.pdf", function (err, data) {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log("File created successfully");
                  }
                });
            }
          }
        );
      })
      .catch((err) => next(err));
  } catch (error) {
    next(error);
  }
});

router.get("/api/customer/search", async (req, res, next) => {
  try {
    //    console.log(req.query.date)
    const sdate = req.query.sdate;
    const edate = req.query.edate;
    const name = req.query.name;

    if (edate == "" || sdate == "") {
      const customer = await Customer.find({ name }).sort({ date: 1 });

      // console.log(customer)
      if (customer) res.send(customer);
      // res.redirect("/Dash/admin/customertrack")
    }
    const customer = await Customer.find({
      $and: [
        { $and: [{ date: { $gte: sdate } }, { date: { $lte: edate } }] },
        { name },
      ],
    }).sort({ date: 1 });

    console.log(customer);
    if (customer) res.send(customer);
  } catch (error) {
    next(error);
  }
});

router.get("/api/customertrack", async (req, res, next) => {
  try {
    const customer = await Customer.find();

    console.log(customer);
    if (customer) res.send(customer);

    //  console.log(req.body)
  } catch (error) {
    next(error);
  }
});

router.post("/api/customertrack/search", async (req, res, next) => {
  try {
    const name = req.body.name;
    const sdate = req.body.sdate;
    const edate = req.body.edate;
    // console.log(sdate,edate)

    axios
      .get("http://localhost:3000/api/customertrack/search", {
        params: {
          sdate,
          edate,
          name,
        },
      })
      .then(function (response) {
        // console.log(response.data)

        let total = response.data.reduce(function (pre, cur) {
          return pre + cur.rateperlit * cur.quantity;
        }, 0);
        let quantity = response.data.reduce(function (pre, cur) {
          return pre + cur.quantity;
        }, 0);
        if (name == "" && sdate == "" && edate == "") {
          total = 0;
          quantity = 0;
          response.data = [];
        }
        res.render("customertracktotal", {
          user: response.data,
          total,
          quantity,
        });
        ejs.renderFile(
          path.join(__dirname, "../views/", "customertrackpdf.ejs"),
          { user: response.data, total, quantity },
          (err, data) => {
            if (err) {
              console.log(err);
            } else {
              let options = {
                height: "11.25in",
                width: "8.5in",
                format: "A4", // allowed units: A3, A4, A5, Legal, Letter, Tabloid
                orientation: "portrait",
                border: {
                  top: "0.5", // default is 0, units: mm, cm, in, px
                  right: "0.5in",
                  bottom: "0.5in",
                  left: "0.5in",
                },
                header: {
                  height: "20mm",
                  contents: `<div ><h2 style="color:green;">Customer Track Invoice</h2></div>`,
                },
                footer: {
                  height: "10mm",
                  contents: {
                    first: "1",
                    2: "2", // Any page number is working. 1-based index
                    default:
                      '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
                    last: "Last Page",
                  },
                },
              };
              pdf
                .create(data, options)
                .toFile("pdf/customertrack.pdf", function (err, data) {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log("File created successfully");
                  }
                });
            }
          }
        );
      })
      .catch((err) => next(err));

    //  console.log(req.body)
    //  console.log(req.query)
  } catch (error) {
    next(error);
  }
});

router.get("/api/customertrack/search", async (req, res, next) => {
  try {
    //    console.log(req.query.name)
    const sdate = req.query.sdate;
    const edate = req.query.edate;
    const name = req.query.name;

    if (name == "" && sdate == "" && edate == "") {
      const customer = await Customer.find({}).sort({ date: 1 });

      // console.log(customer)
      if (customer) res.send(customer);
      // res.redirect("/Dash/admin/customertrack")
    } else if (name == "" && sdate != "" && edate != "") {
      const customer = await Customer.find({
        $and: [{ date: { $gte: sdate } }, { date: { $lte: edate } }],
      }).sort({ date: 1 });
      // console.log(customer)
      if (customer) res.send(customer);
    } else if (name != "" && (sdate == "" || edate == "")) {
      const customer = await Customer.find({ name }).sort({ date: 1 });
      // console.log(customer)
      if (customer) res.send(customer);
    } else {
      const customer = await Customer.find({
        $and: [
          { $and: [{ date: { $gte: sdate } }, { date: { $lte: edate } }] },
          { name },
        ],
      }).sort({ date: 1 });
      // console.log(customer)
      if (customer) res.send(customer);
    }

    //  console.log(req.body)
    //  console.log(req.query)
  } catch (error) {
    next(error);
  }
});

router.get("/api/milkmantrack", async (req, res, next) => {
  try {
    const milkman = await Milkman.find();

    console.log(milkman);
    if (milkman) res.send(milkman);

    //  console.log(req.body)
  } catch (error) {
    next(error);
  }
});
router.post("/api/milkmantrack/search", async (req, res, next) => {
  try {
    const name = req.body.name;
    const sdate = req.body.sdate;
    const edate = req.body.edate;

    axios
      .get("http://localhost:3000/api/milkmantrack/search", {
        params: {
          sdate,
          edate,
          name,
        },
      })
      .then(function (response) {
        // console.log(response.data)
        let total = response.data.reduce(function (pre, cur) {
          return pre + cur.rateperlit * cur.quantity;
        }, 0);
        let quantity = response.data.reduce(function (pre, cur) {
          return pre + cur.quantity;
        }, 0);
        // console.log(total);
        if (name == "" && sdate == "" && edate == "") {
          total = 0;
          quantity = 0;
          response.data = [];
        }

        res.render("milkmantracktotal", {
          user: response.data,
          total: total,
          quantity,
        });

        ejs.renderFile(
          path.join(__dirname, "../views/", "milkmantrackpdf.ejs"),
          { user: response.data, total, quantity },
          (err, data) => {
            if (err) {
              console.log(err);
            } else {
              let options = {
                height: "11.25in",
                width: "8.5in",
                format: "A4", // allowed units: A3, A4, A5, Legal, Letter, Tabloid
                orientation: "portrait",
                border: {
                  top: "0.5", // default is 0, units: mm, cm, in, px
                  right: "0.5in",
                  bottom: "0.5in",
                  left: "0.5in",
                },
                header: {
                  height: "20mm",
                  contents: `<div ><h2 style="color:green;">Milkman Track Invoice</h2></div>`,
                },
                footer: {
                  height: "10mm",
                  contents: {
                    first: "1",
                    2: "2", // Any page number is working. 1-based index
                    default:
                      '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
                    last: "Last Page",
                  },
                },
              };
              pdf
                .create(data, options)
                .toFile("pdf/milkmantrack.pdf", function (err, data) {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log("File created successfully");
                  }
                });
            }
          }
        );
      })
      .catch((err) => next(err));

    //  console.log(req.body)
    //  console.log(req.query)
  } catch (error) {
    next(error);
  }
});
router.get("/api/milkmantrack/search", async (req, res, next) => {
  try {
    //    console.log(req.query.name)
    const sdate = req.query.sdate;
    const edate = req.query.edate;
    const name = req.query.name;

    if (name == "" && sdate == "" && edate == "") {
      const milkman = await Milkman.find({}).sort({ date: 1 });

      // console.log(milkman)
      if (milkman) res.send(milkman);
      // res.redirect("/Dash/admin/milkmantrack")
    } else if (name == "" && sdate != "" && edate != "") {
      const milkman = await Milkman.find({
        $and: [{ date: { $gte: sdate } }, { date: { $lte: edate } }],
      }).sort({ date: 1 });
      // console.log(milkman)
      if (milkman) res.send(milkman);
    } else if (name != "" && (sdate == "" || edate == "")) {
      const milkman = await Milkman.find({ name }).sort({ date: 1 });
      // console.log(milkman)
      if (milkman) res.send(milkman);
    } else {
      const milkman = await Milkman.find({
        $and: [
          { $and: [{ date: { $gte: sdate } }, { date: { $lte: edate } }] },
          { name },
        ],
      }).sort({ date: 1 });
      // console.log(milkman)
      if (milkman) res.send(milkman);
    }
  } catch (error) {
    next(error);
  }
});

router.post("/api/milkrate/cow", async (req, res, next) => {
  try {
    if (!req.body) throw new Error("Please enter valid information");

    const milkrate = new CowMilkRate({
      todaymilkratecow: req.body.todaymilkratecow,
    });
    const milkrates = await milkrate.save();

    //  console.log(req.body)
    if (milkrates) res.redirect("/Dash/admin");
    //  res.render("home")
  } catch (error) {
    next(error);
  }
});

router.get("/api/milkrate/cow", async (req, res, next) => {
  try {
    if (!req.body) throw new Error("Please enter valid information");

    const cowmilkrate = await CowMilkRate.find();
    // const snffatrates = await snffatrate.save()

    console.log(cowmilkrate);
    if (cowmilkrate) res.send(cowmilkrate);
    //  res.render("home")
  } catch (error) {
    next(error);
  }
});

router.post("/api/milkrate/buffalo", async (req, res, next) => {
  try {
    if (!req.body) throw new Error("Please enter valid information");

    const milkrate = new BuffaloMilkRate({
      todaymilkratebuffalo: req.body.todaymilkratebuffalo,
    });
    const milkrates = await milkrate.save();

    //  console.log(req.body)
    if (milkrates) res.redirect("/Dash/admin");
    //  res.render("home")
  } catch (error) {
    next(error);
  }
});
router.get("/api/milkrate/buffalo", async (req, res, next) => {
  try {
    if (!req.body) throw new Error("Please enter valid information");

    const buffalomilkrate = await BuffaloMilkRate.find();
    // const snffatrates = await snffatrate.save()

    console.log(buffalomilkrate);
    if (buffalomilkrate) res.send(buffalomilkrate);
    //  res.render("home")
  } catch (error) {
    next(error);
  }
});

router.post("/api/milkrateUpdate/cow", async (req, res, next) => {
  try {
    if (!req.body) throw new Error("Please enter valid information");
    console.log(req.body.todaymilkratecow);

    const milkrate = await CowMilkRate.findByIdAndUpdate(process.env.COwID, {
      $set: { todaymilkratecow: parseInt(req.body.todaymilkratecow) },
    });
    // const milkrates = await milkrate.save()

    //  console.log(req.body)
    if (milkrate) res.redirect("/Dash/admin");
    //  res.render("home")
  } catch (error) {
    next(error);
  }
});

router.post("/api/milkrateUpdate/buffalo", async (req, res, next) => {
  try {
    if (!req.body) throw new Error("Please enter valid information");

    const milkrate = await BuffaloMilkRate.findByIdAndUpdate(
      process.env.BUFFALOID,
      { $set: { todaymilkratebuffalo: req.body.todaymilkratebuffalo } }
    );
    // const milkrates = await milkrate.save()

    //  console.log(req.body)
    if (milkrate) res.redirect("/Dash/admin");
    //  res.render("home")
  } catch (error) {
    next(error);
  }
});

router.get("/api/snffatrate", async (req, res, next) => {
  try {
    if (!req.body) throw new Error("Please enter valid information");

    const snffatrates = await SNFFatRate.find();
    // const snffatrates = await snffatrate.save()

    console.log(snffatrates);
    if (snffatrates) res.send(snffatrates);
    //  res.render("home")
  } catch (error) {
    next(error);
  }
});

router.post("/api/snffatrate", async (req, res, next) => {
  try {
    if (!req.body) throw new Error("Please enter valid information");

    const snffatrate = new SNFFatRate({
      // todaymilkrate : req.body.todaymilkrate,
      SNF: req.body.SNF,
      fat: req.body.fat,
      snffatmilkrate: req.body.snffatmilkrate,
    });
    const snffatrates = await snffatrate.save();

    //  console.log(req.body)
    if (snffatrates) res.redirect("/Dash/admin");
    //  res.render("home")
  } catch (error) {
    next(error);
  }
});

router.get("/api/snffatrate/delete", async (req, res, next) => {
  try {
    if (!req.query.id) throw new Error("Please enter valid information");
    const id = req.query.id;

    SNFFatRate.findByIdAndDelete(id)
      .then((data) => {
        console.log(data);
        if (data) {
          //   SNFFatRate.deleteOne({ "_id" : ObjectId("id") })
          res.redirect("/Dash/admin/snffatratedata");
        }
        //   res.send({messege : "User Deleted successfully"})
      })
      .catch((err) => {
        next(err);
      });
    // const snffatrates = await snffatrate.save()

    //  res.render("home")
  } catch (error) {
    next(error);
  }
});

router.get("/api/customerdata", async (req, res, next) => {
  try {
    if (!req.body) throw new Error("Please enter valid information");

    const customerdata = await User.find({ role: "Customer" }).sort({
      name: 1,
    });
    // const snffatrates = await snffatrate.save()

    console.log(customerdata);
    if (customerdata) res.send(customerdata);
    //  res.render("home")
  } catch (error) {
    next(error);
  }
});

router.get("/api/customerdata/delete", async (req, res, next) => {
  try {
    if (!req.query.id) throw new Error("Please enter valid information");
    const id = req.query.id;

    User.findByIdAndDelete(id)
      .then((data) => {
        console.log(data);
        if (data) {
          //   SNFFatRate.deleteOne({ "_id" : ObjectId("id") })
          res.redirect("/Dash/admin/customerdata");
        }
        //   res.send({messege : "User Deleted successfully"})
      })
      .catch((err) => {
        next(err);
      });
    // const snffatrates = await snffatrate.save()

    //  res.render("home")
  } catch (error) {
    next(error);
  }
});

router.post("/api/customerdata/search", async (req, res, next) => {
  try {
    const name = req.body.name;

    axios
      .get("http://localhost:3000/api/customerdata/search", {
        params: {
          name,
        },
      })
      .then(function (response) {
        // console.log(response.data)

        // console.log(total);

        res.render("customerdata", { user: response.data });
        ejs.renderFile(
          path.join(__dirname, "../views/", "customerdatapdf.ejs"),
          { user: response.data },
          (err, data) => {
            if (err) {
              console.log(err);
            } else {
              let options = {
                height: "11.25in",
                width: "8.5in",
                format: "A4", // allowed units: A3, A4, A5, Legal, Letter, Tabloid
                orientation: "portrait",
                border: {
                  top: "0.5", // default is 0, units: mm, cm, in, px
                  right: "0.5in",
                  bottom: "0.5in",
                  left: "0.5in",
                },
                header: {
                  height: "20mm",
                  contents: `<div ><h2 style="color:green;">Customer Data</h2></div>`,
                },
                footer: {
                  height: "10mm",
                  contents: {
                    first: "1",
                    2: "2", // Any page number is working. 1-based index
                    default:
                      '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
                    last: "Last Page",
                  },
                },
              };
              pdf
                .create(data, options)
                .toFile("pdf/customerdata.pdf", function (err, data) {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log("File created successfully");
                  }
                });
            }
          }
        );
      })
      .catch((err) => next(err));

    //  console.log(req.body)
    //  console.log(req.query)
  } catch (error) {
    next(error);
  }
});
router.get("/api/customerdata/search", async (req, res, next) => {
  try {
    const name = req.query.name;

    if (name == "") {
      const customer = await User.find({ role: "Customer" }).sort({ name: 1 });

      // console.log(customer)
      if (customer) res.send(customer);
      // res.redirect("/Dash/admin/customertrack")
    } else {
      const customer = await User.find({
        $and: [{ name }, { role: "Customer" }],
      }).sort({ name: 1 });
      // console.log(customer)
      if (customer) res.send(customer);
    }
  } catch (error) {
    next(error);
  }
});

router.get("/api/milkmandata", async (req, res, next) => {
  try {
    if (!req.body) throw new Error("Please enter valid information");

    const milkmandata = await User.find({ role: "Milkman" }).sort({ name: 1 });
    // const snffatrates = await snffatrate.save()

    console.log(milkmandata);
    if (milkmandata) res.send(milkmandata);
    //  res.render("home")
  } catch (error) {
    next(error);
  }
});

router.get("/api/milkmandata/delete", async (req, res, next) => {
  try {
    if (!req.query.id) throw new Error("Please enter valid information");
    const id = req.query.id;

    User.findByIdAndDelete(id)
      .then((data) => {
        console.log(data);
        if (data) {
          //   SNFFatRate.deleteOne({ "_id" : ObjectId("id") })
          res.redirect("/Dash/admin/milkmandata");
        }
        //   res.send({messege : "User Deleted successfully"})
      })
      .catch((err) => {
        next(err);
      });
    // const snffatrates = await snffatrate.save()

    //  res.render("home")
  } catch (error) {
    next(error);
  }
});

router.post("/api/milkmandata/search", async (req, res, next) => {
  try {
    const name = req.body.name;

    axios
      .get("http://localhost:3000/api/milkmandata/search", {
        params: {
          name,
        },
      })
      .then(function (response) {
        // console.log(response.data)

        // console.log(total);

        res.render("milkmandata", { user: response.data });

        ejs.renderFile(
          path.join(__dirname, "../views/", "milkmandatapdf.ejs"),
          { user: response.data },
          (err, data) => {
            if (err) {
              console.log(err);
            } else {
              let options = {
                height: "11.25in",
                width: "8.5in",
                format: "A4", // allowed units: A3, A4, A5, Legal, Letter, Tabloid
                orientation: "portrait",
                border: {
                  top: "0.5", // default is 0, units: mm, cm, in, px
                  right: "0.5in",
                  bottom: "0.5in",
                  left: "0.5in",
                },
                header: {
                  height: "20mm",
                  contents: `<div ><h2 style="color:green;">Customer Data</h2></div>`,
                },
                footer: {
                  height: "10mm",
                  contents: {
                    first: "1",
                    2: "2", // Any page number is working. 1-based index
                    default:
                      '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
                    last: "Last Page",
                  },
                },
              };
              pdf
                .create(data, options)
                .toFile("pdf/milkmandata.pdf", function (err, data) {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log("File created successfully");
                  }
                });
            }
          }
        );
      })
      .catch((err) => next(err));

    //  console.log(req.body)
    //  console.log(req.query)
  } catch (error) {
    next(error);
  }
});
router.get("/api/milkmandata/search", async (req, res, next) => {
  try {
    const name = req.query.name;

    if (name == "") {
      const milkman = await User.find({ role: "Milkman" }).sort({ name: 1 });

      // console.log(milkman)
      if (milkman) res.send(milkman);
      // res.redirect("/Dash/admin/milkmantrack")
    } else {
      const milkman = await User.find({
        $and: [{ name }, { role: "Milkman" }],
      }).sort({ name: 1 });
      // console.log(milkman)
      if (milkman) res.send(milkman);
    }
  } catch (error) {
    next(error);
  }
});
module.exports = router;
