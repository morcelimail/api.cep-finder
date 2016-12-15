let mongoose = require('mongoose');

class ModelBase {
  constructor(name, fields) {
    this.name   = name;
    this.fields = fields;
    this.model  = null;
  }

  // ==================================================================================
  //                                 PRIVATE METHODS
  // ==================================================================================
  /**
   * Used to create the model handler (inheritance)
   */
  _createModel() {
    this.model  = mongoose.model(this.name,  this.fields);
  }

  // ==================================================================================
  //                                 PUBLIC METHODS
  // ==================================================================================
  /**
   * Find one row from model.
   * @param  {Object} where
   * @returns {Promise}
   */
  findOne(where) {
    return new Promise((resolve, reject) => {
      this.model.findOne(where, (error, result) =>{
        return error ? reject(error) : resolve(result);
      });
    });
  }

  /**
   * Find multiple rows from model.
   * @param  {Object} where
   * @returns {Promise}
   */
  find(where) {
    return new Promise((resolve, reject) => {
      this.model.find(where, (error, result) =>{
        return error ? reject(error) : resolve(result);
      });
    });
  }

  /**
   * Get all rows from model.
   * @returns {Promise}
   */
  findAll() {
    return this.find({});
  }

  /**
   * Create a new model row.
   * @param  {Object} data
   * @returns {Promise}
   */
  create(data) {
    return new Promise((resolve, reject) => {
      let newRegistry = model.create(data);
      
      newRegistry.save((error, result) =>{
        return error ? reject(error) : resolve(result);
      });
    });
  }

  /**
   * Update/create a row (update if alreday exists).
   * @param  {Object} data
   * @returns {Promise}
   */
  upsert(where, data, options = {}) {
    options.upsert              = true;
    options.new                 = true;
    options.setDefaultsOnInsert = true;
    data                        = data || {};
    data.updatedAt              = data.updatedAt || new Date();
        
    return new Promise((resolve, reject) => {
      this.model.findOneAndUpdate(where, data, options, (error, result) =>{
        return error ? reject(error) : resolve(result);
      });
    });
  }

  /**
   * Remove a model row.
   * @param  {Object} where
   * @returns {Promise}
   */
  remove(where) {
    return new Promise((resolve, reject) => {
      this.model.remove(where, (error, result) =>{
        return error ? reject(error) : resolve(result);
      });
    });
  }

  /**
   * @param  {Object} where Update conditions.
   * @param  {Object} data Update data.
   * @param  {Object} options={} Options flags.
   * @returns {Promise}
   */
  update(where, data, options = {}) {
    return new Promise((resolve, reject) => {
      this.model.update(where, data, options, (error, result) =>{
        return error ? reject(error) : resolve(result);
      });
    });
  }
}

module.exports = ModelBase;