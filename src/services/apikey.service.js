"use strict"

const apikeyModel = require("../models/apikey.model");
const crypto = require("crypto");

const findApiKeyById = async (key) => {
  // Uncomment to get api key
  // const newKey = await apikeyModel.create({ key: crypto.randomBytes(64).toString("hex"), permissions: ["0000"], status: true});
  // console.log(newKey);

  const objKey = await apikeyModel.findOne({ key }).lean();
  return objKey;
};

module.exports = {
  findApiKeyById,
};