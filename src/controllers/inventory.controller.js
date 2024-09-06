
"use strict"

const InventoryService = require("../services/inventory.service");
const { SuccessResponse } = require("../core/success.response");

class InventoryController {
  addStock = async (req, res, next) => {
    new SuccessResponse({
      messsage: "Add stock success",
      metadata: await InventoryService.addStockToInventory(req.body)
    }).send(res);
  }
}

module.exports = new InventoryController();