"use strict"

const redis = require("redis");
const { promisify } = require("util");
const { reservationInventory } = require("../models/repositories/inventory.repo");
const redisClient = redis.createClient();

// promisify chuyển 1 hàm thành promise
const pexpire = promisify(redisClient.pExpire).bind(redisClient);
const setnxAsync = promisify(redisClient.setNX).bind(redisClient);

const accquireLock = async ({ productId, quantity, cartId }) => {
  // Chỉ là lock bình thường để vào db thôi mà, 1 cách implement mutex locking trong nodejs thông qua redis.
  const key = `lock_v2023_${productId}`;
  const retryTimes = 10;
  const expireTime = 3000;

  for (let i = 0; i < retryTimes.length; i++) {
    const result = await setnxAsync(key, expireTime); // Tạo 1 key
    if(result == 1) {
      // Thao tác với iventory
      const isReversation = await reservationInventory({
        productId, quantity, cartId
      });
      await pexpire(key, expireTime); // Luôn set expires time đề phòng trường hợp nó k release về sau sẽ vẫn tự bị xoá
      if(isReversation.modifiedCount) {
        return key;
      }
      return null;
    } else {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
}

const releaseLock = async keyLock => {
  const delAsyncKey = promisify(redisClient.del).bind(redisClient);
  return await delAsyncKey(keyLock);
}

module.exports = {
  accquireLock,
  releaseLock
}
