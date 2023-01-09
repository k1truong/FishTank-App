var express = require("express");
const bodyParser = require("body-parser");
var app = express();
//Storing user's logging info
var Login_info = [];
//pushing changes
//Storing businesses' info
var Business_info = [];
// const Web3 = require("web3");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("src"));
app.use(express.static("../FishTank-contract/build/contracts"));
app.set("view engine", "ejs");

//login page
app.get("/", function (req, res) {
  //storing user info- we need to find a better space to store this i guess, mysql maybe? I'll
  //store it as a list of dictionary for now
  console.log("hello");
  res.render("index");
});

//InvestorORBusiness page
app.get("/InvestorORBusiness", function (req, res) {
  res.render("InvestorORBusiness", {
    nameofCustomer: Login_info[Login_info.length - 1].name,
  });
});

//Investor Page
app.get("/InvestorPage", function (req, res) {
  res.render("InvestorPage", {'business_info': Business_info });
});

//Business Page
app.get("/BusinessPage", function (req, res) {
  res.render("BusinessPage");
});

//Business Landing Page
app.get("/BusinessLandingPage", function (req, res) {
  res.render("BusinessLandingPage", { business_info: Business_info });
});

//post request to store the name, email, and password of the user
app.post("/", function (req, res) {
  const userInfo = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  };
  Login_info.push(userInfo);
  console.log(Login_info);
  res.redirect("InvestorORBusiness");
});

//Post request from BusinessPage
app.post("/BusinessPage", function (req, res) {
  const bizInfo = {
    name: req.body.nameofB,
    industry: req.body.nameofIndustry,
    funding_asked: req.body.fundingAmt,
    addr: req.body.addrofB,
  };
  Business_info.push(bizInfo);
  console.log(Business_info);
});

app.listen(3001, function () {
  console.log("app listening on port 3001!");
});
