const mongoose = require("mongoose");

// Nháp
function newConnection(uri) {
  const db = mongoose.createConnection(uri, {
    useNewUrlParser: true,
  });
  db.on("error", function(err) {
    console.log(`Mongoose connection ${this.name} ${JSON.stringify(err)}`);
    db.close().catch(() => console.log(`Mongodb failed to connect ${this.name}`));
  });
  db.on('connected', function () {
    mongoose.set('debug', function(col, method, query, doc) {
      console.log(`Mongoodb Debug:: ${this.conn.name}::${col}.${method}(${JSON.stringify(query)},${JSON.stringify(doc)}`);
    })
    console.log(`Mongodb:: connected ${this.name}`);
  });
  db.on('disconnected', function () {
    console.log(`Mongodb:: disconnected ${this.name} ${JSON.stringify(err)}`);
  });
  return db;
}

const studentDB = newConnection(process.env.MONGODB_STUDENT_URI);
const productDB = newConnection(process.env.MONGODB_PRODUCT_URI);

module.exports = {
  studentDB,
  productDB,
}