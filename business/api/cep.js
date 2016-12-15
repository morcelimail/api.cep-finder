let path     = require('path');
let _        = require('lodash');
let config   = require(path.join('..', '..', 'config', 'app'));
let cache    = require(path.join('..', '..', 'cache', 'cep'));
let modelCep = require(path.join('..', '..', 'models', 'cep'));
let buscaCep = require(path.join('..', '..', 'webservices', 'buscaCep'));
let helper   = require(path.join('..', '..', 'commons', 'helper'));

/** Handle all business rules from CEP route. */
class CepBusiness {
  constructor() {
    // void
  }

  // ==================================================================================
  //                                 PRIVATE METHODS
  // ==================================================================================

  /**
   * Get where data based on raw data.
   * @private
   * @param  {Object} data
   * @returns {Object}
   */
  _getWhere(data) {
    let where = {};
    data      = data || {};

    if (data.cep)
      where.cep = data.cep;
    if (data.phoneNumber)
      where.phoneNumber = data.phoneNumber;

    return where;
  }

  /**
   * Update All source using the follow order: 1) Database, 2) Cache.
   * @private
   * @param  {Object} data
   * @returns {Promise}
   */
  _updateAllSources(data) {
    return new Promise((resolve, reject) => {
      let where = this._getWhere(data);

      modelCep.upsert(where, data).then((upsertData) => {
        cache
        .set(upsertData)
        .then(resolve)
        .catch(reject);
      })
      .catch(reject);
    });
  }

  /**
   * Search existing data on cache service.
   * @private
   * @param  {String} cep
   * @param  {String} phoneNumber
   * @param  {Object} res Express response handler;
   */
  _searchOnCache(cep, phoneNumber, res) {
    let where = this._getWhere({
      cep         : cep, 
      phoneNumber : phoneNumber,
    });

    cache
    .get(where)
    .then((cacheData) => {
      // not found, try to find on db.
      if (! cacheData)
        return this._searchOnDatabase(cep, phoneNumber, res);

      helper.ok(res, {
        ok   : true,
        data : cacheData,
      });
    })
    .catch((error) => {
      helper.internalError(res, {
        ok      : false,
        message : error,
      });
    });
  }

  /**
   * Search existing data on database.
   * @private
   * @param  {String} cep
   * @param  {String} phoneNumber
   * @param  {Object} res Express response handler;
   */
  _searchOnDatabase(cep, phoneNumber, res) {
    let where = this._getWhere({
      cep         : cep, 
      phoneNumber : phoneNumber,
    });

    modelCep
    .findCurrent(where)
    .then((dbData) => {

      // not found.
      if (! dbData) {

        // try to find on webservice (if cep contains some value).
        if (!! cep)
          return this._searchOnWebservice(cep, res);

        return helper.ok(res, {
          ok   : true,
          data : null,
        });
      }

      // update the cache using the database data.
      cache.set(dbData).then(() => {
        helper.ok(res, {
          ok   : true,
          data : dbData,
        });
      })
      .catch((error) => {
        helper.internalError(res, {
          ok      : false,
          message : error,
        });
      });

    })
    .catch((error) => {
      helper.internalError(res, {
        ok      : false,
        message : error,
      });
    });
  }

  /**
   * Search using webservice drivers.
   * @param  {String} cep
   * @param  {Object} res Express response handler;
   */
  _searchOnWebservice(cep, res) { 
    buscaCep.get(cep)
    .then((wsData) => {
      // not found
      if (! wsData) {
        return helper.ok(res, {
          ok   : true,
          data : null,
        });
      }
      
      if(wsData.cep)
        wsData.cep = helper.onlyNumbers(wsData.cep);

      this._updateAllSources(wsData)
      .then(() => {
        helper.ok(res, {
          ok   : true,
          data : wsData,
        });
      })
      .catch((error) => {
        helper.internalError(res, {
          ok      : false,
          message : error,
        });
      })

    })
    .catch((error) => {
      helper.internalError(res, {
        ok      : false,
        message : error,
      });
    });
  }

  // ==================================================================================
  //                                 PUBLIC METHODS
  // ==================================================================================

  /**
   * get CEP using the following order: 1) Cache, 2) Database, 3) Webservices.
   * @param  {Object} req Default request handler from express.
   * @param  {Object} res Default response handler from express.
   */
  getCEP(req, res) {
    let cep = req.body.cep                 || null;
    let phoneNumber = req.body.phoneNumber || null;

    // check if some param was sent.
    if (! cep && ! phoneNumber) {
      return helper.badRequest(res, {
        ok      : false,
        message : 'CEP or Phone Number must be provided.',
      });
    }

    // check if cep is ok.
    if (!! cep && ! helper.checkCEP(cep)) {
      return helper.badRequest(res, {
        ok      : false,
        message : 'CEP bad format (e.g.: "00000000").',
      });
    }

    // check if phone is ok.
    if (!! phoneNumber && ! helper.checkPhone(phoneNumber)) {
      return helper.badRequest(res, {
        ok      : false,
        message : 'Phone Number bad format (e.g.: "0000000000").',
      });
    }

    return this._searchOnCache(cep, phoneNumber, res);
  }
}

let instance = null;

module.exports = (() => {
  if (! instance)
    instance = new CepBusiness();

  return instance;
})();
