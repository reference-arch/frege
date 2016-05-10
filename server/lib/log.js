const config   = require('./config.js'),
     bunyan    = require('bunyan');
module.exports = bunyan.createLogger(config.logConfig);
