"use strict"

const JWT = require("jsonwebtoken");
const { asyncHandler } = require("../helpers/auth.helper");
const { HeaderAuth } = require("../constants");
const { AuthFailureError, NotFoundError } = require("../core/error.response");
const { findTokenByUserId } = require("../services/keyToken.service");

const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    const accessToken = await JWT.sign(payload, publicKey, {
      expiresIn: "2 days"
    });
    const refreshToken = await JWT.sign(payload, privateKey, {
      expiresIn: "7 days"
    });

    // test
    JWT.verify(accessToken, publicKey, (err, decode) => {
      if(err) {
        console.log("Error verify::", err);
      } else {
        console.log("Decode verify::", decode);
      }
    })

    return { accessToken, refreshToken };
  } catch (error) {
    return null;
  }
};

const authenticate = asyncHandler(async (req, res, next) => {
  const userId = req.headers[HeaderAuth.CLIENT_ID];
  if(!userId) throw new AuthFailureError("Invalid Request");
  const keyStore = await findTokenByUserId(userId);
  if(!keyStore) throw new NotFoundError("Not found keystore");

  if(req.headers[HeaderAuth.REFRESH_TOKEN]){
    const refreshToken = req.headers[HeaderAuth.REFRESH_TOKEN];
    const decodedUser = JWT.verify(refreshToken, keyStore.privateKey);
    req.user = decodedUser;
    req.keyStore = keyStore;
    req.refreshToken = refreshToken;
    if(userId != decodedUser.userId){
      throw new AuthFailureError("Invalid user");
    }
    return next();
  }

  const accessToken = req.headers[HeaderAuth.AUTHORIZATION];
  if(!accessToken) throw new AuthFailureError("Invalid request"); 
  const decodedUser = JWT.verify(accessToken, keyStore.publicKey);
  if(userId !== decodedUser.userId) throw new AuthFailureError("Invalid user");
  req.keyStore = keyStore;
  req.user = decodedUser;
  return next();
});

const verifyJWT = (token, keySecret) => {
  return JWT.verify(token, keySecret);
}

module.exports = {
  createTokenPair,
  authenticate,
  verifyJWT
}