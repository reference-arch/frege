const _      = require('lodash');
const config = require(process.env.CONFIG || '../config.json');

// setup log config
config.logConfig = {name: "frege",
                    streams: [
                      { level: 'info', stream: process.stdout }
                    ]};

// setup mongo connection config
config.mongoConnect = mongoConnect = {
  slaveOk: false,
  max: 10,
  min: 1,
  timeout: 300000
};

if( !_.isUndefined(config.mongo.user) && config.mongo.user !== '' ) {
  mongoConnect['user'] = encodeURIComponent(config.mongo.user);
}
if( !_.isUndefined(config.mongo.pass) && config.mongo.pass !== '' ) {
  mongoConnect['pass'] = encodeURIComponent(config.mongo.pass);
}

var mongoUrl = null;
var mongoHost = config.mongo.host;
if( !_.contains(mongoHost, ':') && !_.isUndefined(config.mongo.port) && config.mongo.pass !== '' ) {
  // only append an existing port if the hostname doesn't already contain one
  mongoHost = mongoHost + ':' + config.mongo.port;
}
if( !_.isUndefined(mongoConnect['user']) && mongoConnect['user'] !== '' ) {
  mongoUrl = 'mongodb://' + mongoConnect['user'] + ':' + mongoConnect['pass'] + '@' + mongoHost + '/' + config.mongo.db;
}
else {
  mongoUrl = 'mongodb://' + mongoHost + '/' + config.mongo.db;
}
// mongoUrl += '?connectTimeoutMS=120000&socketTimeoutMS=120000&readPreference=primary';
if( process.env.MONGODB_URI ) {
  mongoUrl = process.env.MONGODB_URI;
}
mongoConnect['uri'] = mongoUrl;

module.exports = config;