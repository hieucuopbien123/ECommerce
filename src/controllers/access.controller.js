"use strict"

const AccessService = require("../services/access.service");
const { Ok, Created, SuccessResponse } = require("../core/success.response");

class AccessController {
  handleRefreshToken = async (req, res, next) => {
    new SuccessResponse({
      message: "Get token success",
      metadata: await AccessService.handleRefreshToken({
        refreshToken: req.refreshToken, 
        user: req.user, 
        keyStore: req.keyStore
      })
    }).send(res);
  }
  logout = async (req, res, next) => {
    new SuccessResponse({
      message: "Logout success",
      metadata: await AccessService.logout(req.keyStore)
    }).send(res);
  }
  login = async (req, res, next) => {
    new SuccessResponse({
      metadata: await AccessService.login(req.body)
    }).send(res);
  }
  signUp = async (req, res, next) => {
    new Created({
      message: "Register Ok",
      metadata: await AccessService.signUp(req.body),
      options: {
        limit: 10
      }
    }).send(res);
  }
}

module.exports = new AccessController();