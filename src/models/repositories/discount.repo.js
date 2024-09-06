"use strict"

const { getSelectData, getUnselectData } = require("../../utils");
const discountModel = require("../discount.model");

const findAllDiscountCodesSelect = async({
  limit = 50, page = 1, sort = "ctime", filter, select, model
}) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1};
  const products = await model.find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean(); // Dùng lean để bỏ các trường thừa
  return products;
};

const findAllDiscountCodesUnselect = async({
  limit = 50, page = 1, sort = "ctime", filter, unselect, model
}) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1};
  const products = await model.find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getUnselectData(unselect))
    .lean();
  return products;
};

const checkDiscountExists = async ({ filter }) => {
  console.log(await discountModel.findOne(filter).lean());
  return await discountModel.findOne(filter).lean();
}

module.exports = {
  findAllDiscountCodesSelect,
  findAllDiscountCodesUnselect,
  checkDiscountExists
}