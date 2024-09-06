'use strict'

const mongoose = require("mongoose");
const { countConnect } = require("@/helpers/check.connect");
const { db: { connectionString }, env} = require("@/configs");

class Database {
  constructor(){
    this.connect();
  }

  connect(type = 'mongodb'){
    if(env == 'dev'){
      mongoose.set("debug", true);
      mongoose.set("debug", { color: true });
    }
    mongoose.connect(connectionString, {
      maxPoolSize: 5, // default cũng là 5
    }).then(_ => { console.log("Connected mongodb success pro"); countConnect(); })
      .catch(err => console.log("Error Connect::", this.getDbState(mongoose.connection.readyState)));
  }

  getDbState(connectionState) {
    switch(connectionState){
      case 0: 
        return "disconnected";
      case 1: 
        return "connected";
      case 2:
        return "connecting";
      case 3: 
        return "disconnecting";
      default: 
        return "uninitialized";
    }
  }

  static getInstance(){
    if(!Database.instance){
      Database.instance = new Database();
    }
    return Database.instance;
  }
}

const instanceMongodb = Database.getInstance();
module.exports = instanceMongodb;