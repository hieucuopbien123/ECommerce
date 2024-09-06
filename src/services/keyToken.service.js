"use strict"

const keytokenModel = require("../models/keytoken.model");
const { Types } = require("mongoose");

class KeyTokenService {
  static createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
    // lv0
    // const token = await keytokenModel.create({
    //   user: userId,
    //   publicKey,
    //   privateKey
    // });

    // lv1
    const filter = { user: userId }, update = {
      publicKey, privateKey, refreshTokenUsed: [], refreshToken
    }, options = { upsert: true, new: true };
    const tokens = await keytokenModel.findOneAndUpdate(filter, update, options);
    return tokens ? tokens.publicKey : null;
  }

  static findTokenByUserId = async (userId) => {
    return await keytokenModel.findOne({user: new Types.ObjectId(userId)});
    // Phải đúng kiểu ObjectId
  }

  static removeKeyById = async (id) => {
    return await keytokenModel.deleteOne(id);
  }

  static findByRefreshTokenUsed = async(refreshToken) => {
    return await keytokenModel.findOne({ refreshTokensUsed: refreshToken }).lean();
  }

  static findByRefreshToken = async(refreshToken) => {
    return await keytokenModel.findOne({ refreshToken: refreshToken }).lean();
  }

  static deleteKeyById = async (userId) => {
    return await keytokenModel.deleteOne({ user: new Types.ObjectId(userId)});
  }
}

module.exports = KeyTokenService;