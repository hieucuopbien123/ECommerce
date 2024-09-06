'use strict'

const mongoose = require("mongoose");
const os = require("os");
const process = require("process");

const _SECONDS = 5000;

const countConnect = () => {
  const numConnection = mongoose.connections.length;
  console.log(`Numer of conenctions::${numConnection}`);
}

const checkOverload = () => {
  const checkOverloadId = setInterval(() => {
    const numConnections = mongoose.connections.length;
    const numCores = os.cpus().length;
    const memoryUsage = process.memoryUsage().rss;
    const maxConnections = numCores * 5; // Giả sử 1 core chỉ chịu được max 5 connection

    console.log(`Active connection::${numConnections}`);
    console.log(`Memory usage:: ${memoryUsage / 1024 / 1024} MB`);

    if(numConnections > maxConnections) {
      console.log("Connection overload detected");
      // send notification
      clearInterval(checkOverloadId);
    }
  }, _SECONDS);
}

module.exports = {
  countConnect,
  checkOverload
}