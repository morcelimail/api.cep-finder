let path     = require('path');
let buscaCep = require('busca-cep');
let helper   = require(path.join('..', 'commons', 'helper'));
let schema   = require(path.join('..', 'models', 'schemas', 'cep'));

/** Handle CEP search using viacep.com.br webservice */
class BuscaCepWS {
  constructor() {
    // void
  }

  // ==================================================================================
  //                                 PRIVATE METHODS
  // ==================================================================================
  
  /**
   * Get fields based on CEP schema.
   * @private
   * @param  {Object} raw Raw data
   * @returns {Object}
   */
  _getFieldsBySchema(raw) {
    let result = {};
    for (let key in schema) {
      if (raw.hasOwnProperty(key))
        result[key] = raw[key].toLowerCase();
    }

    return result;
  }

  // ==================================================================================
  //                                  PUBLIC METHODS
  // ==================================================================================

  /**
   * Get CEP data from viacep.com.br
   * @param  {String} cep
   * @returns {Promise}
   */
  get(cep) {
    return new Promise((resolve, reject) => {
      buscaCep(cep)
      .then((result) => {
        let error = result.erro;
        resolve(error ? null : this._getFieldsBySchema(result));
      })
      .catch((error) => {
        reject('Error on try to get CEP by Webservice.');
      });
    });
  }
}

let instance = null;
module.exports = (() => {
    if (! instance)
        instance = new BuscaCepWS();

    return instance;
})();