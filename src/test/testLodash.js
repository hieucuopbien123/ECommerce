const _ = require("lodash");

const newShop = {
  name: 'Shopdev1',
  email: 'shopdev5@gmail.com',
  password: '$2b$10$eRmPuD7SSBxhTa3r5YSDuuqO.NTPW.lb2ZAAzh/Wxu2sGxnkG9Zmy',
  status: 'inactive',
  verified: false,
  roles: [ 'SHOP' ],
  __v: 0
}

console.log(_.pick(newShop, ["name"]));