const env = process.env.NODE_ENV || 'dev';

const dev = {
  env: env,
  app: {
    port: process.env.PORT || 3055
  },
  db: {
    connectionString: process.env.CONNECTION_STRING || ``
  }
}

const prod = {
  env: env,
  app: {
    port: process.env.PORT || 3056
  },
  db: {
    connectionString: process.env.CONNECTION_STRING,
    dbname: process.env.DBNAME || 'shopProd'
  }
}

const config = { dev, prod };

module.exports = config[env];