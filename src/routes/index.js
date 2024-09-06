"use strict"

const express = require("express");
const { apiKey, checkPermission } = require("../auth/apikeyUtils");
const router = express.Router();

// APIKey
router.use(apiKey);
// Giả sử permission 0000 là chung và phải có mới vào được api v1
router.use(checkPermission("0000")); 

router.use("/v1/api/checkout", require("./checkout"));
router.use("/v1/api/discount", require("./discount"));
router.use("/v1/api/cart", require("./cart"));
router.use("/v1/api/inventory", require("./inventory"));
router.use("/v1/api/product", require("./product"));
router.use("/v1/api", require("./access"));

module.exports = router;
