'use strict';
const config  = require('../lib/config.js');
const app     = require('../app.js'),
      co      = require('co'),
      should  = require('should');
const request = require('supertest').agent(app.listen()),
      timeout = process.env.TIMEOUT || config.timeout || 1800000;

describe('Grab data from account team', function(){
  this.timeout(timeout);
  it('returns a JSON success after the run', function(done){
      request
        .head('/')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(done);
  });
});
