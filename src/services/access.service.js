"use strict"

const shopModel = require("@/models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("node:crypto");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const { RoleShop } = require("../constants");
const { ConflictRequestError, BadRequestError, AuthFailureError, ForbiddenRequestError } = require("../core/error.response");
const _ = require("lodash");

const KeyTokenService = require("./keyToken.service");
const { findShopByEmail } = require("./shop.service");
const keytokenModel = require("../models/keytoken.model");

// Do service dùng nhiều nên dùng static luôn và k cần khai báo với new. Nó là singleton 
class AccessService {
  static handleRefreshToken = async({refreshToken, user, keyStore}) => {
    const { userId, email } = user;
    if(keyStore.refreshTokensUsed.includes(refreshToken)){
      await KeyTokenService.deleteKeyById(userId)
      throw new ForbiddenRequestError("Something is wrong! Pls relogin");
    }
    if(keyStore.refreshToken != refreshToken) throw new AuthFailureError("Shop is not registered");
    const foundShop = await findShopByEmail({ email: email });
    if(!foundShop) throw new AuthFailureError("Shop not registered");

    const tokens = await createTokenPair({ userId, email }, keyStore.publicKey, keyStore.privateKey);
    await keytokenModel.updateOne(
      {
        user: userId
      },
      {
        $set: {
          refreshToken: tokens.refreshToken
        },
        $addToSet: {
          refreshTokensUsed: refreshToken
        }
      }
    );
    return {
      user: { userId, email },
      tokens
    }
  }

  static logout = async(keyStore) => {
    const delKey = await KeyTokenService.removeKeyById(keyStore.id);
    return delKey;
  }

  static login = async({ email, password }) => {
    const foundShop = await findShopByEmail({ email });
    if(!foundShop) throw new BadRequestError("Shop not registerd");

    const match = bcrypt.compare(password, foundShop.password);
    if(!match) throw new AuthFailureError("Authentication error");

    const publicKey = crypto.randomBytes(64).toString("hex");
    const privateKey = crypto.randomBytes(64).toString("hex");
    const tokens = await createTokenPair({ userId: foundShop._id, email }, publicKey, privateKey);
    await KeyTokenService.createKeyToken({
      userId: foundShop._id,
      refreshToken: tokens.refreshToken,
      privateKey, publicKey
    });
    return {
      shop: getInfoData({ fields: ["_id", "name", "email"], object: foundShop}),
      tokens
    }
  }

  static signUp = async ({ name, email, password }) => {
    const holderShop = await shopModel.findOne({ email }).lean();
    if(holderShop) {
      throw new ConflictRequestError("Error signup: Email is already in use");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newShop = await shopModel.create({
      name, email, password: passwordHash, roles: [RoleShop.SHOP]
    });

    if(newShop) {
      // Thật ra chia ra public và private chỉ là để 1 cái cho accesstoken và 1 cái refreshtoken chú chả qh gì
      const publicKey = crypto.randomBytes(64).toString("hex");
      const privateKey = crypto.randomBytes(64).toString("hex");
      const tokens = await createTokenPair({ userId: newShop._id, email }, publicKey, privateKey);
      if(tokens == null){
        throw new BadRquestError("Error signup: Cannot create accesstoken");
      }
      
      const keyStore = await KeyTokenService.createKeyToken({
        userId: newShop._id,
        refreshToken: tokens.refreshToken,
        publicKey,
        privateKey
      })
      if(!keyStore){
        throw new BadRequestError("Error signup: Cannot create key");
      }

      return {
        shop: getInfoData({ fields: ["_id", "name", "email"], object: newShop}),
        tokens
      }
    }
    throw new BadRequestError("Error signup: Cannot create new shop");
  }
}

module.exports = AccessService;