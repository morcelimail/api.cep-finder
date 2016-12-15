let path         = require('path');
let cacheManager = require('cache-manager');
let redisStore   = require('cache-manager-redis');
let config       = require(path.join('..', 'config', 'app'));

/** Handle all business rules from CEP route. */
class CepCache {
  /**
   * @param  {Object} options
   */
  constructor(options) {
    this._handler = null;

    this._setupCache(options);
  }
  
  // ==================================================================================
  //                                 PRIVATE METHODS
  // ==================================================================================

  /**
   * Setups the cache handler.
   * @private
   * @param  {Object} options
   */
  _setupCache(options) {
    let cacheOptions = {
      store     : redisStore,
      host      : options.host,
      port      : options.port,
      auth_pass : options.password,
      db        : options.db,
      ttl       : options.ttl,
    };

    this._handler = cacheManager.caching(cacheOptions);
  }
  
  /**
   * Get cache by CEP if exists.
   * @private
   * @param  {String} cep
   * @return {Promise}
   */
  _getByCep(cep) {
    return new Promise((resolve, reject) => {
      this._handler.get('cep_'+ cep, (error, result) => {
        if (error)
          return reject('Error on try to get cache by CEP.');

        let json = null;

        try {
          json = JSON.parse(result);
        }
        catch (e) {
          json = null;
        }

        resolve(json);
      });
    });
  }
  
  /**
   * Get cache by Phone Number if exists.
   * @private
   * @param  {String} phoneNumber
   * @return {Promise}
   */
  _getByPhoneNumber(phoneNumber) {
    return new Promise((resolve, reject) => {
      this._handler.get('phone_'+ phoneNumber, (error, result) => {
        if (error)
          return reject('Error on try to get cache by Phone Number.');

        let json = null;

        try {
          json = JSON.parse(result);
        }
        catch (e) {
          json = null;
        }

        resolve(json);
      });
    });
  }
  
  /**
   * Get cache by CEP/Phone Number if exists.
   * @private
   * @param  {String} cep
   * @param  {String} phoneNumber
   * @return {Promise}
   */
  _getByCepOrPhoneNumber(cep, phoneNumber) {
    return new Promise((resolve, reject) => {
      // find by cep.
      this
      ._getByCep(cep)
      .then((cepData) => {
        if (!! cepData)
          return resolve(cepData);
        
        // nothing found, try by phone.
        this
        ._getByPhoneNumber(phoneNumber)
        .then(resolve)
        .catch(reject);
      })
      .catch(reject);
    });
  }
  
  /**
   * Create/Update a CEP by CEP key.
   * @private
   * @param  {Object} data
   * @return {Promise}
   */
  _setByCep(data) {
    return new Promise((resolve, reject) => {
      let key     = 'cep_' + data.cep;
      let val     = JSON.stringify(data);
      let options = { ttl : config.redisCache.ttl };

      // try to set by cep.
      this._handler.set(key, val, options,  (error) => {
        if (error)
          return reject('Error on try to set cache by CEP.');

          resolve();
      });
    });
  }
  
  /**
   * Create/Update a CEP cache by phone key.
   * @private
   * @param  {Object} data
   * @return {Promise}
   */
  _setByPhoneNumber(data) {
    return new Promise((resolve, reject) => {
      let key     = 'phone_' + data.phoneNumber;
      let val     = JSON.stringify(data);
      let options = { ttl : config.redisCache.ttl };

      // try to set by cep.
      this._handler.set(key, val, options,  (error) => {
        if (error)
          return reject('Error on try to set cache by Phone Number.');

          resolve();
      });
    });
  }
  
  /**
   * Create/Update a CEP cache by CEP and phone key.
   * @private
   * @param  {Object} data
   * @return {Promise}
   */
  _setByCepAndPhoneNumber(data) {
    return new Promise((resolve, reject) => {

      // try to set by cep.
      this
      ._setByCep(data)
      .then(() => {

        // try to set by phone.
        this
        ._setByPhoneNumber(data)
        .then(resolve)
        .catch(reject);

      })
      .catch(reject);

      // try to set by cep.
      this._handler.set('cep_' + data.cep, (error) => {
        if (error)
          return reject('Error on try to set cache by CEP.');

        // try to set by phone.
        this._handler.set('phone_' + data.phoneNumber, (error) => {
          if (error)
            return reject('Error on try to set cache by Phone Number.');

          resolve();
        });
      });
    });
  }

  // ==================================================================================
  //                                  PUBLIC METHODS
  // ==================================================================================

  /**
   * Get CEP cache data if exists.
   * @param  {Object} data Allowed keys: "cep", "phoneNumber".
   * @return {Promise}
   */
  get(data) {
    return new Promise((resolve, reject) => {
      data            = data             || {};
      let cep         = data.cep         || null;
      let phoneNumber = data.phoneNumber || null;

      if (! cep && ! phoneNumber)
        return reject('Bad params - CEP or Phone Number must be informed.');

      // find by both.
      if (cep && phoneNumber) {
        return this._getByCepOrPhoneNumber(cep, phoneNumber)
        .then(resolve)
        .catch(reject);
      }

      // find only by cep.
      if (cep) {
        return this._getByCep(cep)
        .then(resolve)
        .catch(reject);
      }

      // find only by phone.
      this._getByPhoneNumber(phoneNumber)
      .then(resolve)
      .catch(reject);
    });
  }

  /**
   * Create/Update a CEP cache.
   * @param  {Object} data
   * @return {Promise}
   */
  set(data) {
    return new Promise((resolve, reject) => {
      data            = data || {};
      let cep         = data.cep;
      let phoneNumber = data.phoneNumber;

      if (! cep && ! phoneNumber)
        return reject('Bad params - CEP or Phone Number must be informed.');

      // set by both.
      if (cep && phoneNumber) {
        return this._setByCepAndPhoneNumber(data)
        .then(resolve)
        .catch(reject);
      }

      // set only by cep.
      if (cep) {
        return this._setByCep(data)
        .then(resolve)
        .catch(reject);
      }

      // set only by phone.
      this._setByPhoneNumber(data)
      .then(resolve)
      .catch(reject);
    });
  }
}

let instance = null;

module.exports = ((options) => {
  if (! instance)
    instance = new CepCache(options);

  return instance;
})(config.redisCache);