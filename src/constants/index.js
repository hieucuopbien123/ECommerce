const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER", // Nên quy ước để 00001 hoặc số gì đó chứ k để như này
  EDITOR: "EDITOR",
  ADMIN: "ADMIN"
}

const HeaderAuth = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIZATION: "authorization",
  REFRESH_TOKEN: "refreshtoken"
}

module.exports = {
  RoleShop,
  HeaderAuth
}