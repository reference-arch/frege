'use strict';
const config      = require('./lib/config.js'),
      log         = require('./lib/log.js'),
      promises    = require('./lib/promises.js'),
      csvGen      = require('./lib/csv_gen.js');
const _           = require('lodash'),
      co          = require('co'),
      koa         = require('koa'),
      route       = require('koa-path')(),
      mongo       = require('koa-mongo'),
      fs          = require('fs'),
      crypto      = require('crypto'),
      zlib        = require('zlib'),
      moment      = require('moment'),
      AWS         = require('aws-sdk');
const app         = module.exports = koa(),
      port        = process.env.PORT || config.port || 3000,
      timeout     = process.env.TIMEOUT || config.timeout || 1800000;

AWS.config.region          = config.s3.region || 'us-west-2';
AWS.config.accessKeyId     = config.s3.accessKey || '';
AWS.config.secretAccessKey = config.s3.secretKey || '';

function getParamArray(self, name, deflt) {
  let value = self.request.query[name];
  if( !_.isUndefined(value) ) {
    if( value == '' ) return deflt;
    if( typeof(value) === 'string' ) {
      return value.split(',');
    } else {
      return value;
    }
  } else {
    return deflt;
  }
}

function query(self, soldToNumbers) {
  return new Promise(function(resolve, reject){
    let customerToTiers = {};
    let store = self.mongo.db('StoreboardCache').collection('Store');
    let storeCursor = store.find(
      {customerNumber: { $in: soldToNumbers }, globalStoreDistributionTier: { $exists: true }},
      {customerNumber:1, globalStoreDistributionTier:1, _id:-1}
    ).stream();
    storeCursor.on('data', function(doc) {
      let tierStr = doc['globalStoreDistributionTier'];
      if( tierStr == null ) return null;
      let tier = null;
      // map GOOD/BETTER/BEST to 1,2,3
      switch(tierStr.toUpperCase()) {
        case "GOOD":   tier = '1'; break;
        case "BETTER": tier = '2'; break;
        case "BEST":   tier = '3'; break;
        default:       tier = null;
      }
      customerToTiers[doc['customerNumber']] = tier;
    });
    storeCursor.on('error', function(err) {
      log.error('customerToTierMap', err);
      reject(err);
    });
    storeCursor.on('end', function() {
      log.info("Retrieved and built customerToTiers");
      if( log.debug() ) {
        log.debug(JSON.stringify(customerToTiers));
      }
      resolve(customerToTiers);
    });
  });
}


// // Do all of the work here. Get the data to generate a CSV and upload it to S3
// function generateReport(self, returnFile, zipped) {
//   return function(callback) { co(function*(){
//     try {
//       // kickoff the mapreduce job that extracts best assignments
//       yield query(self, salesOrgCodes);

//       // run a few helper functions to build ancillary information
//       // let extensions =
//       //   yield Promise.all([
//       //     promises.customerToTierMap(self, soldToNumbers),
//       //     promises.customerToTierCodeMap(self, soldToNumbers),
//       //     promises.soldToToShipToMap(self, soldToNumbers)
//       //   ]);
//       callback(null, body);

//     } catch( err ) {
//       log.error('Error generating report', err);
//       callback(new Error(JSON.stringify({"status":"error", "message": err})));
//     }
//   }); };
// };

app.use(mongo(config.mongoConnect));

// X-Response-Time
app.use(function *(next){
  let start = new Date;
  yield next;
  let ms = new Date - start;
  this.set('X-Response-Time', ms + 'ms');
});

// logger
app.use(function *(next){
  // metrics.increment('golf_report.count', 1);
  // let timer = metrics.createTimer('generate_request')
  let startTime = new Date;
  log.info('START %s %s - %s', this.method, this.url, startTime);
  yield next;
  // timer.stop();
  let endTime = new Date - startTime;
  log.info('END %s %s - %s', this.method, this.url, endTime);

});

// handle any uncaught errors
app.on('error', function(err, ctx){
  log.error('server error', err, ctx);
});

// When the endpoint is hit, return a liveness response
app.use(route('/ping', function*() {
  this.type = 'application/json';
  let uptime = process.uptime();
  this.body = JSON.stringify({"status": "pong", "uptimeSeconds": uptime});
}));

// Start the app server
const server = app.listen(port, function() {
  log.info('App is listening to http://localhost:'+port);
});
server.setTimeout((process.env.TIMEOUT || 1800000), function(){
  log.warn('Timeout');
});
