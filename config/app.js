let helper = require('../commons/helper.js');

let config = {
  development : {
    mongodb : {
      uri : "mongodb://localhost/cep_development",
      updateRegistry : 1, // days,
    },
    redisCache : {
      host: "localhost",
      port: 6379,
      password: "",
      db: 0,
      ttl: 600, // seconds
    },
  },

  test : {
    mongodb : {
      uri : "mongodb://localhost/cep_test",
      updateRegistry : 1, // days,
    },
    redisCache : {
      host: "localhost",
      port: 6379,
      password: "",
      db: 0,
      ttl: 600, // seconds
    },
  },

  production : {
    mongodb : {
      uri : "mongodb://localhost/cep_development",
      updateRegistry : 1, // days,
    },
    redisCache : {
      host: "localhost",
      port: 6379,
      password: "abcdef",
      db: 0,
      ttl: 600, // seconds
    },
  },
};

module.exports = (() => {
  return config[helper.getEnv()];
})();
