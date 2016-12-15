let path      = require('path');
let mongoose  = require('mongoose');
let ModelBase = require('./base');
let helper    = require(path.join('..', 'commons', 'helper'));
let config    = require(path.join('..', 'config', 'app'));

class Model extends ModelBase {
  constructor(name, fields) {
    super(name, fields);
    super._createModel();
  }

  // ==================================================================================
  //                                 PUBLIC METHODS
  // ==================================================================================
  /**
   * Find a CEP that was updated recently.
   * @param  {Object} where={} 
   * @returns {Promise}
   */
  findCurrent(where={}) {
    where.updatedAt = {
      $gte: helper.dateByDays(-config.mongodb.updateRegistry),
    };

    return super.findOne(where);
  }
}

let instance = null;

module.exports = ((name, fields) => {
  if (! instance)
    instance = new Model(name, fields);

  return instance;
})(
  'cep', 
  require(path.join(__dirname, 'schemas', 'cep'))
);