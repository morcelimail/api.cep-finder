let express  = require('express');
let router = express.Router();

// path: /debug
router.get('/', (req, res, next) => {
  res.render('debug');
});

module.exports = router;
