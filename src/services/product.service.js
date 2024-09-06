"use strict"

const { BadRequestError } = require("../core/error.response");
const { product, clothing, electronic, furniture } = require("../models/product.model");
const { insertInventory } = require("../models/repositories/inventory.repo");
const { findAllProducts, findAllDraftsForShop, publishProductByShop, findAllPublishedForShop, searchProductByUser, findProduct, updateProductById } = require("../models/repositories/product.repo");
const { removeUndefinedObject, updateNestedObjectParser } = require("../utils");

class ProductFactory {
  // Factory Pattern
  // static async createProduct(type, payload) {
  //   switch(type){
  //     case "Clothing": 
  //       return new Clothing(payload).createProduct();
  //     case "Electronics":
  //       return new Electronics(payload).createProduct();
  //     case "Furniture":
  //       return new Furniture(payload).createProduct();
  //     default: 
  //       throw new BadRequestError("Invalid Product Type::", type);
  //   }
  // }

  // Strategy Pattern
  static productRegistry = {};
  static registerProductType(type, classRef) {
    this.productRegistry[type] = classRef;
  }
  static async createProduct(type, payload) {
    const productClass = this.productRegistry[type];
    if(!productClass) throw new BadRequestError("Invalid Product Type::", type);
    return await (new productClass(payload)).createProduct();
  }

  // UPDATE
  static async publishProductByShop({ product_shop, product_id }) {
    return await publishProductByShop({product_shop, product_id});
  }
  static async unpublishProductByShop({ product_shop, product_id }) {
    return await publishProductByShop({product_shop, product_id});
  }
  static async updateProduct(type, productId, userId, payload) {
    const productClass = this.productRegistry[type];
    if(!productClass) throw new BadRequestError("Invalid Product Type::", type);
    return new productClass(payload).updateProduct(productId, userId);
  }

  // QUERY //
  static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isDraft: true };
    return await findAllDraftsForShop({ query, limit, skip });
  }
  static async findAllPublishForShop({ product_shop, limit = 50, skip = 0}) {
    const query = { product_shop, isPublished: true };
    return await findAllPublishedForShop({ query, limit, skip });
  }
  static async searchProducts({ keySearch }){
    return await searchProductByUser({ keySearch });
  }
  static async findAllProducts({ limit = 50, sort = 'ctime', page = 1, filter = { isPublished: true } }) {
    return await findAllProducts({ limit, sort, page, filter, select: ["product_name", "product_thumb", "product_price", "product_shop"] });
  }
  static async findProduct({ product_id }) {
    return await findProduct({ product_id, unSelect: ["__v"] });
  }
}

class Product {
  constructor({
    product_name, product_thumb, product_description, product_price, 
    product_quantity, product_type, product_shop, product_attribute
  }) {
    this.product_name = product_name;
    this.product_thumb = product_thumb;
    this.product_description = product_description;
    this.product_price = product_price;
    this.product_quantity = product_quantity;
    this.product_type = product_type;
    this.product_shop = product_shop;
    this.product_attribute = product_attribute;
  }
  async createProduct(product_id) {
    const newProduct =  await product.create({ ...this, _id: product_id }); // Create vào db dưới dạng class dược
    if(newProduct) {
      await insertInventory({
        productId: newProduct._id,
        shopId: this.product_shop,
        stock: this.product_quantity
      })
    }
    return newProduct;
  }

  async updateProduct(productId, userId, objectParams){
    return await updateProductById({
      product_id: productId, 
      shop_id: userId, 
      bodyUpdate: updateNestedObjectParser(objectParams),
      model: product
    });
  }
}

class Clothing extends Product {
  async createProduct(){
    const newClothing = await clothing.create({
      ...this.product_attribute,
      product_shop: this.product_shop
    });
    if(!newClothing) throw new BadRequestError("Create new clothing error");

    const newProduct = await super.createProduct(newClothing._id);
    if(!newProduct) throw new BadRequestError("Create new product error");

    return newProduct;
  }
  async updateProduct(productId, userId) {
    const objectParams = removeUndefinedObject(this, ["_id", "productype", "product_shop"]);
    if(objectParams.product_attribute){
      await updateProductById({
        product_id: productId,
        shop_id: userId,
        bodyUpdate: updateNestedObjectParser(objectParams.product_attribute),
        model: clothing
      });
    }
    const updateProduct = await super.updateProduct(productId, userId, objectParams);
    return updateProduct;
  }
}

class Electronics extends Product {
  async createProduct(){
    const newElectronic = await electronic.create({
      ...this.product_attribute,
      product_shop: this.product_shop
    });
    if(!newElectronic) throw new BadRequestError("Create new electronics error");

    const newProduct = await super.createProduct(newElectronic._id);
    if(!newProduct) throw new BadRequestError("Create new product error");

    return newProduct;
  }
  async updateProduct(productId, userId) {
    const objectParams = removeUndefinedObject(this, ["_id", "productype", "product_shop"]);
    if(objectParams.product_attribute){
      await updateProductById({
        product_id: productId,
        shop_id: userId,
        bodyUpdate: updateNestedObjectParser(objectParams.product_attribute),
        model: clothing
      });
    }
    const updateProduct = await super.updateProduct(productId, userId, objectParams);
    return updateProduct;
  }
}

class Furniture extends Product {
  async createProduct(){
    const newFurniture = await furniture.create({
      ...this.product_attribute,
      product_shop: this.product_shop
    });
    if(!newFurniture) throw new BadRequestError("Create new furniture error");

    const newProduct = await super.createProduct(newFurniture._id);
    if(!newFurniture) throw new BadRequestError("Create new product error");

    return newProduct;
  }
  async updateProduct(productId, userId) {
    const objectParams = removeUndefinedObject(this, ["_id", "productype", "product_shop"]);
    if(objectParams.product_attribute){
      await updateProductById({
        product_id: productId,
        shop_id: userId,
        bodyUpdate: updateNestedObjectParser(objectParams.product_attribute),
        model: clothing
      });
    }
    const updateProduct = await super.updateProduct(productId, userId, objectParams);
    return updateProduct;
  }
}

// Giả sử có 100 sản phẩm, ta có thể viết 1 file riêng chứa object ánh xạ kiểu ("Electronics" -> Electronics)
// Trong ProductFactory require nó rồi chạy for loop gọi registerProductType từng object là được 
ProductFactory.registerProductType("Electronics", Electronics);
ProductFactory.registerProductType("Clothing", Clothing);
ProductFactory.registerProductType("Furniture", Furniture);

module.exports = ProductFactory;