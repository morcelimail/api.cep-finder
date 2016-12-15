let _ = require('lodash');

/** Store all common methods for API usage. */
class Helper {
  constructor() {
    // void
  }

  /**
   * Extract all alphanumeric characters.
   * @param  {String} txt
   * @return {String}
   */
  onlyNumbers(txt) {
    return txt.replace(/[^0-9.]/g, "");
  }

  /**
   * Get Node Environment.
   * @return {String} Default: "development"
   */
  getEnv () {
    return process.env.NODE_ENV || "development";
  }

  /**
   * Check the phone number format ("0000000000" or "00000000000").
   * @param  {String} phone
   * @return {Boolean}
   */
  checkPhone(phone) {
    return _.isString(phone) && phone.length >= 10 && phone.length <= 11 && phone.match("[0-9]+");
  }

  /**
   * Check the CEP format ("00000000").
   * @param  {String} cep
   * @return {Boolean}
   */
  checkCEP(cep) {
    return _.isString(cep) && cep.length === 8 && cep.match("[0-9]+");
  }

  
  /**
   * Generate a personal JSON response for express.
   * @param  {Object} res Default response object from express.
   * @param  {Object} data Response body.
   * @param  {Number} statusCode
   */
  response(res, data, statusCode) {
    res.status(statusCode || 200);
    res.json(data || {});
  }

  /**
   * Generate the response to HTTP status code 200.
   * @param  {Object} res Default response object from express.
   * @param  {Object} data Response body.
   */
  ok(res, data) {
    this.response(res, data, 200);
  }

  /**
   * Generate the response to HTTP status code 400.
   * @param  {Object} res Default response object from express.
   * @param  {Object} data Response body.
   */
  badRequest(res, data) {
    this.response(res, data, 400);
  }

  /**
   * Generate the response to HTTP status code 401.
   * @param  {Object} res Default response object from express.
   * @param  {Object} data Response body.
   */
  unauthorized(res, data) {
    this.response(res, data, 401);
  }

  /**
   * Generate the response to HTTP status code 403.
   * @param  {Object} res Default response object from express.
   * @param  {Object} data Response body.
   */
  forbidden(res, data) {
    this.response(res, data, 403);
  }

  /**
   * Generate the response to HTTP status code 404.
   * @param  {Object} res Default response object from express.
   * @param  {Object} data Response body.
   */
  notFound(res, data) {
    this.response(res, data, 404);
  }

  /**
   * Generate the response to HTTP status code 500.
   * @param  {Object} res Default response object from express.
   * @param  {Object} data Response body.
   */
  internalError(res, data) {
    this.response(res, data, 500);
  }

  /**
   * Make a Date Object that advances or retreats N days.
   * @param  {Number} days Number of days (To retreat use a negative number e.g.: -1).
   */
  dateByDays(days) {
    let now = new Date();
    now.setDate(now.getDate() + days);

    return now;
  }
}

let instance = null;

module.exports = (() => {
  if (! instance)
    instance = new Helper();

  return instance;
})();
