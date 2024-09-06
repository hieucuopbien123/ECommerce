"use strict"

const _ = require("lodash");
const { Types } = require("mongoose");

const convertToObjectIdMongoDb = id => new Types.ObjectId(id);

const getInfoData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields);
}

const getSelectData = (select = []) => {
  return Object.fromEntries(select.map(item => [item, 1]));
}

const getUnselectData = (select = []) => {
  return Object.fromEntries(select.map(item => [item, 0]));
}

const removeUndefinedObject = (obj, arr = []) => {
  Object.keys(obj).forEach(k => {
    if(obj[k] == null) { 
      // a == null trả về true nếu a là undefined hoặc null, trừ khi dùng === mới check chuẩn kiểu
      delete obj[k];
    }
  });
  if(arr != []){
    Object.keys(obj).forEach(k => {
      if(arr.includes(k)) { 
        delete obj[k];
      }
    })
  }
  return obj;
}

const updateNestedObjectParser = obj => {
  const final = {};
  Object.keys(obj).forEach(k => {
    if(typeof obj[k] === "object" && !Array.isArray(obj[k])) {
      const response = updateNestedObjectParser(obj[k]);
      Object.keys(response).forEach(a => {
        final[`${k}.${a}`] = response[a];
      })
    } else {
      final[k] = obj[k];
    }
  });
  return final;
}

module.exports = {
  getInfoData,
  getSelectData,
  getUnselectData,
  removeUndefinedObject,
  updateNestedObjectParser,
  convertToObjectIdMongoDb
}
