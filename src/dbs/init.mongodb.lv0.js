'use strict'

const mongoose = require("mongoose");

const { db: { connectionString }, env} = require("@/configs");

mongoose.connect(connectionString).then(_ => console.log("Connected mongodb success"))
  .catch(err => console.log("Error Connect!"));

// dev
if(env == 'dev'){
  mongoose.set("debug", true);
  mongoose.set("debug", { color: true });
}

module.exports = mongoose;
