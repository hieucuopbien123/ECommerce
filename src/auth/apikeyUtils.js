"use strict"

const { HeaderAuth } = require("@/constants/index");
const { findApiKeyById } = require("../services/apikey.service");

const apiKey = async (req, res, next) => {
  try {
    const key = req.headers[HeaderAuth.API_KEY]?.toString();
    if(!key) {
      return res.status(403).json({
        message: "Forbidden Error",
        status: 403,
      })
    }
    const objKey = await findApiKeyById(key);
    if(!objKey) {
      return res.status(403).json({
        message: "Forbidden Error",
        status: 403,
      })
    }
    req.objKey = objKey;
    return next();
  } catch (error) {
    console.log("Error check API key::", error);
  }
}

const checkPermission = (permission) => {
  return (req, res, next) => {
    if(!req.objKey.permissions){
      return res.status(403).json({
        message: "permission denied"
      })
    }
    const validPermission = req.objKey.permissions.includes(permission);
    if(!validPermission){
      return res.status(403).json({
        message: "Permission denied"
      })
    }
    return next();
  }
}

module.exports = {
  apiKey,
  checkPermission
}

