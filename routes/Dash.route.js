const router = require("express").Router();
const axios = require("axios");
const ejs = require("ejs");
const path = require("path");
const pdf = require("html-pdf");

router.get("/", async (req, res, next) => {
  // res.render("home")
  try {
    if (req.user.role === "Admin") {
      await res.redirect("Dash/admin");
    } else if (req.user.role === "Customer") {
      await res.redirect("Dash/customer");
    } else if (req.user.role === "Milkman") {
      await res.redirect("Dash/milkman");
    }
    // console.log(req.user)
  } catch (error) {
    next(error);
  }
});

router.get("/admin", ensureAuthenticated, async (req, res, next) => {
  try {
    axios
      .all([
        axios.get("http://localhost:3000/api/milkrate/cow"),
        axios.get("http://localhost:3000/api/milkrate/buffalo"),
        axios.get("http://localhost:3000/api/count/milkman"),
        axios.get("http://localhost:3000/api/count/customer"),
        axios.get("http://localhost:3000/api/milkmantrack"),
        axios.get("http://localhost:3000/api/customertrack"),
      ])
      .then(
        axios.spread((obj1, obj2, cmilk, ccus, milkman, customer) => {
          // Both requests are now complete
          // console.log(cmilk.data,ccus.data);
          let gained = milkman.data.reduce(function (pre, cur) {
            return pre + cur.quantity;
          }, 0);
          let selled = customer.data.reduce(function (pre, cur) {
            return pre + cur.quantity;
          }, 0);
          res.render("adminDash", {
            cow: obj1.data,
            buffalo: obj2.data,
            milkmancount: cmilk.data,
            customercount: ccus.data,
            gained,
            selled,
          });
        })
      );
  } catch (error) {
    next(error);
  }
});
router.get("/customer", ensureAuthenticated, async (req, res, next) => {
  try {
    // console.log(req.user)
    axios
      .get("http://localhost:3000/api/customer", {
        params: { name: req.user.name },
      })
      .then(function (response) {
        // console.log(response.data)

        res.render("customerDash", { user: response.data });
      })
      .catch((err) => next(err));
    // res.render('customerDash')

    // res.send("ok")
  } catch (error) {
    next(error);
  }
});
router.get("/milkman", ensureAuthenticated, async (req, res, next) => {
  try {
    // console.log(req.user)
    const name = req.user.name;
    axios
      .get("http://localhost:3000/api/milkman", {
        params: { name: req.user.name },
      })
      .then(function (response) {
        // console.log(response.data)
        res.render("milkmanDash", { user: response.data, name });
      })
      .catch((err) => next(err));
    // res.render('customerDash')

    // res.send("ok")
  } catch (error) {
    next(error);
  }
});

router.get("/admin/snffatratedata", async (req, res, next) => {
  try {
    axios.get("http://localhost:3000/api/snffatrate").then(function (response) {
      // console.log(response.data)
      res.render("snffatratedata", { user: response.data });
      ejs.renderFile(
        path.join(__dirname, "../views/", "snffatpdf.ejs"),
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
                contents: `<div ><h2 style="color:green;">SNF/Fat Rate</h2></div>`,
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
              .toFile("pdf/snffat.pdf", function (err, data) {
                if (err) {
                  console.log(err);
                } else {
                  console.log("File created successfully");
                }
              });
          }
        }
      );
    }).catch;
    //  res.render("home")
  } catch (error) {
    next(error);
  }
});

router.get("/admin/customerdata", async (req, res, next) => {
  try {
    axios
      .get("http://localhost:3000/api/customerdata")
      .then(function (response) {
        // console.log(response.data)
        res.render("customerdata", { user: response.data });
      }).catch;
    //  res.render("home")
  } catch (error) {
    next(error);
  }
});
router.get("/admin/summary", async (req, res, next) => {
  try {
    axios
      .get("http://localhost:3000/api/customerdata")
      .then(function (response) {
        // console.log(response.data)
        res.render("customerdata", { user: response.data });
      }).catch;
    //  res.render("home")
  } catch (error) {
    next(error);
  }
});

router.get("/admin/milkmandata", async (req, res, next) => {
  try {
    axios
      .get("http://localhost:3000/api/milkmandata")
      .then(function (response) {
        // console.log(response.data)
        res.render("milkmandata", { user: response.data });
      }).catch;
    //  res.render("home")
  } catch (error) {
    next(error);
  }
});

router.get("/milkman/snffatratedata", async (req, res, next) => {
  try {
    axios.get("http://localhost:3000/api/snffatrate").then(function (response) {
      //    console.log(response.data)
      res.render("milkmansnffatratedata", { user: response.data });
    }).catch;
    //  res.render("home")
  } catch (error) {
    next(error);
  }
});

router.get("/admin/customertrack", async (req, res, next) => {
  try {
    // console.log(req.user)
    axios
      .get("http://localhost:3000/api/customertrack")
      .then(function (response) {
        // console.log(response.data)
        res.render("customertrack", { user: response.data });
      })
      .catch((err) => next(err));
    // res.render('customerDash')

    // res.send("ok")
  } catch (error) {
    next(error);
  }
});

router.get("/admin/milkmantrack", async (req, res, next) => {
  try {
    // console.log(req.user)
    axios
      .get("http://localhost:3000/api/milkmantrack")
      .then(function (response) {
        // console.log(response.data)
        res.render("milkmantrack", { user: response.data });
      })
      .catch((err) => next(err));
    // res.render('customerDash')

    // res.send("ok")
  } catch (error) {
    next(error);
  }
});
module.exports = router;

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/login");
  }
}
function ensureNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect("back");
  } else {
    next();
  }
}

router.get("/admin/summary2", ensureAuthenticated, async (req, res, next) => {
  try {
    axios
      .all([
        axios.get("http://localhost:3000/api/milkrate/cow"),
        axios.get("http://localhost:3000/api/milkrate/buffalo"),
        axios.get("http://localhost:3000/api/count/milkman"),
        axios.get("http://localhost:3000/api/count/customer"),
        axios.get("http://localhost:3000/api/milkmantrack"),
        axios.get("http://localhost:3000/api/customertrack"),
      ])
      .then(
        axios.spread((obj1, obj2, cmilk, ccus, milkman, customer) => {
          // Both requests are now complete
          console.log(cmilk.data, ccus.data);
          let gained = milkman.data.reduce(function (pre, cur) {
            return pre + cur.quantity;
          }, 0);
          let selled = customer.data.reduce(function (pre, cur) {
            return pre + cur.quantity;
          }, 0);
          res.render("commonheaderadcumi", {
            cow: obj1.data,
            buffalo: obj2.data,
            milkmancount: cmilk.data,
            customercount: ccus.data,
            gained,
            selled,
          });
        })
      );
  } catch (error) {
    next(error);
  }
});

router.get("/admin/entry", ensureAuthenticated, async (req, res, next) => {
  res.render("entry");
});
