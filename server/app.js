'use strict';
const config      = require('./lib/config.js'),
      log         = require('./lib/log.js');
const _           = require('lodash'),
      co          = require('co'),
      koa         = require('koa'),
      parse       = require('co-body'),
      route       = require('koa-path')(),
      mongo       = require('koa-mongo');
const app         = module.exports = koa(),
      port        = process.env.PORT || config.port || 3100,
      timeout     = process.env.TIMEOUT || config.timeout || 18000;


function getNextSequenceValue(self){
  return self.mongo.collection('counters').findAndModify(
    { _id: "projects" },
    [],
    { $inc: { seq:1 } },
    { new: true }
  );
}

function saveProject(self) {
  return new Promise(function(resolve, reject){
    co(function*(){
      try {
        let data = yield parse.json(self, {});
        let incId = yield getNextSequenceValue(self);
        let id = 1;
        if( incId && incId.value && incId.value.seq ) {
          id = incId.value.seq;
        } else {
          let countersCol = self.mongo.collection('counters');
          yield countersCol.save({ _id: "projects", seq:1 });
        }
        let project = {
          _id: id,
          name: data['name'],
          url_html: data['url_html'],
          description: data['description'],
          tags: data['tags']
        }
        let projectsCol = self.mongo.collection('projects');
        projectsCol.save(project, {}, function(error, success) {
          if( error ) {
            log.error('server error', err, ctx);
            reject(response);
          } else {
            project.id = project['_id'];
            delete project['_id'];
            resolve(project);
          }
        });
      } catch( err ) {
        log.error('Error generating report', err);
        callback(new Error(JSON.stringify({"status":"error", "message": err})));
      }
    });
  });
}

function deleteProject(self, id) {
  return new Promise(function(resolve, reject){
    let projectsCol = self.mongo.db('RefArch').collection('projects');
    projectsCol.remove({_id: id}, {justOne: true}, function(error, success) {
      if( error ) {
        log.error('server error', err, ctx);
        reject(response);
      } else {
        resolve('ok');
      }
    });
  });
}

function listProjects(self) {
  return new Promise(function(resolve, reject){
    let projects = [];
    let projectsCol = self.mongo.collection('projects');
    let projectsCursor = projectsCol.find({}).stream();
    projectsCursor.on('data', function(doc) {
      doc.id = doc['_id'];
      delete doc['_id'];
      projects.push(doc);
    });
    projectsCursor.on('error', function(err) {
      log.error('projects', err);
      reject(err);
    });
    projectsCursor.on('end', function() {
      if( log.debug() ) {
        log.debug("Retrieved projects");
        log.debug(JSON.stringify(projects));
      }
      resolve(projects);
    });
  });
}

app.use(mongo(config.mongoConnect));

// X-Response-Time
app.use(function *(next){
  let start = new Date;
  yield next;
  let ms = new Date - start;
  this.set('X-Response-Time', ms + 'ms');
});

// log response times
if( log.debug() ) {
  app.use(function *(next){
    let startTime = new Date;
    log.debug('START %s %s - %s', this.method, this.url, startTime);
    yield next;
    let endTime = new Date - startTime;
    log.debug('END %s %s - %s', this.method, this.url, endTime);
  });
};

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

// Get a list of projects, or create a new one
app.use(route('/projects', function*() {
  this.type = 'application/json';
  switch( this.method ) {
  case 'GET':
    return this.body = yield listProjects(this);
  case 'POST':
    return this.body = yield saveProject(this);
  default:
    return this.throw(400, 'Invalid method ' + this.method);
  }
}));

app.use(route('/projects/:id', function*() {
  this.type = 'application/json';
  let id = parseInt(this.params.id);
  switch( this.method ) {
  case 'DELETE':
    return this.body = yield deleteProject(this, id);
  default:
    return this.throw(400, 'Invalid method ' + this.method);
  }
}));

// Start the app server
const server = app.listen(port, function() {
  log.info('App is listening to http://localhost:'+port);
});
server.setTimeout((process.env.TIMEOUT || 18000), function(){
  log.warn('Timeout');
});
