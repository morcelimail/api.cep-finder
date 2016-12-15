let path     = require('path');
let express  = require('express');
let business = require(path.join('..', '..', 'business', 'api', 'cep'));

let router = express.Router();

// path: /api/cep/get
router.post('/get', (req, res, next) => {
  business.getCEP(req, res);
});

module.exports = router;
