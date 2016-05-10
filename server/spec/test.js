'use strict';
const config  = require('../lib/config.js');
const app     = require('../app.js'),
      should  = require('should');
const request = require('supertest').agent(app.listen()),
      timeout = process.env.TIMEOUT || config.timeout || 18000;

describe('Get projects list', function(){
  this.timeout(timeout);
  it('returns a success and JSON header', function(done){
      request
        .get('/projects')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(done);
  });
  it('returns a JSON array', function(done){
      request
        .get('/projects')
        .expect(function(res) {
          should(res.body).be.an.Array();
        })
        .end(done);
  });
});
