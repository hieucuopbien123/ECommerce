require("module-alias/register");
require('dotenv').config({ path: require('path').join(__dirname, `../.env.${process.env.NODE_ENV || 'dev'}`)});

const compression = require("compression");
const express = require("express");
const { default: helmet } = require("helmet");
const app = express();
const morgan = require('morgan');
const { env } = require("@/configs");

// Init middleware
app.use(morgan('dev'));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Init db
require('./dbs/init.mongodb');
if(env == 'prod') {
  const { checkOverload } = require("@/helpers/check.connect");
  checkOverload();
}

// Init routes
app.use("/", require("./routes"));

// Test api
app.get("/", (req, res, next) => {
  return res.status(200).json({
    message: "Hello from test"
  });
});

// URL not found
app.use((req, res, next) => {
  const error = new Error("Not Found API");
  error.status = 404;
  next(error);
})

// Handling error
app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
  return res.status(statusCode).json({
    status: "error",
    code: statusCode,
    stack: error.stack,
    message: error.message || "Internal Server Error"
  });
})

module.exports = app;