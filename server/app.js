'use strict';
const config      = require('./lib/config.js'),
      log         = require('./lib/log.js');
const _           = require('lodash'),
      co          = require('co'),
      request     = require('request'),
      parse       = require('co-body'),
      koa         = require('koa'),
      cors        = require('koa-cors'),
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
      let data;
      try {
        data = yield parse.json(self, {});
      } catch( err ) {
        log.error('Error generating report', err);
        reject(new Error(JSON.stringify({"status":"error", "cause":"Malformed JSON", "message": err})));
        return;
      }
      try {
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
          html_url: data['html_url'],
          description: data['description'],
          github_id: parseInt(data['github_id']),
          tags: data['tags']
        }
        let projectsCol = self.mongo.collection('projects');

        // self.mongo.collection('counters').findAndModify(
        //   { github_id: project.github_id },
        //   [],
        //   project,
        //   { upsert: true },
        //   function(error, success) {
        //  console.dir(success);
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
        reject(new Error(JSON.stringify({"status":"error", "message": err})));
      }
    });
  });
}

function deleteProject(self, id) {
  return new Promise(function(resolve, reject){
    let projectsCol = self.mongo.collection('projects');
    projectsCol.remove({_id: id}, {justOne: true}, function(error, success) {
      if( error ) {
        log.error('server error', error, self);
        reject(response);
      } else {
        resolve('ok');
      }
    });
  });
}

function listProjects(self, query) {
  return new Promise(function(resolve, reject){
    if( !query ) { query = {}; }
    let projects = [];
    let projectsCol = self.mongo.collection('projects');
    let projectsCursor = projectsCol.find(query).stream();
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

function getGitHubProjects(self) {
  return new Promise(function(resolve, reject){
    let tk = process.env.GITHUB_TOKEN;
    let pw = 'x-oauth-basic';
    // let since = 0;
    // console.log('https://'+tk+':'+pw+'@api.github.com/user/repos?per_page=100&since='+since);
    let options = {
      url: 'https://'+tk+':'+pw+'@api.github.com/user/repos',
      headers: {
        'User-Agent': 'frege'
      }
    }
    request.get(options, function(error, response, body){
      if( error ) {
        log.error('github', error);
        return reject(new Error(JSON.stringify({"status":"error", "message": error})));
      }
      if( response.statusCode == 200 ) {
        resolve(JSON.parse(body));
      } else {
        let message = 'Unexpected status code from GitHub ' + response.statusCode;
        log.error(message);
        reject(new Error(JSON.stringify({"status":"error", "message": message})));
      }
    })
  });
}

// only list out github projects that don't exist in the database
function getNewGitHubProjects(self) {
  return new Promise(function(resolve, reject){
    co(function*(){
      try {
        let githubProjects = yield getGitHubProjects(self);
        let mongoProjects = yield listProjects(self, {});
        // return github projects that don't exist in the mongo set
        resolve( _.differenceWith(githubProjects, mongoProjects, function(arrVal, othVal){
          return arrVal['id'] == othVal['github_id'];
        }) );
      } catch( err ) {
        log.error('Error generating projects list', err);
        callback(new Error(JSON.stringify({"status":"error", "message": err})));
      }
    });
  });
}


app.use(mongo(config.mongoConnect));
app.use(cors());

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

// TODO: handle any uncaught errors properly
app.on('error', function(err, ctx){
  log.error('server error', err, ctx);
  // this.throw(500, 'Invalid method ' + err);
  // this.body = err;
  // this.statusCode = 500;
});

// When the endpoint is hit, return a liveness response
app.use(route('/ping', function*() {
  this.type = 'application/json';
  let uptime = process.uptime();
  this.body = JSON.stringify({"status": "pong", "uptimeSeconds": uptime});
}));

// Get a list of projects, or create a new one
app.use(route('/github', function*() {
  this.type = 'application/json';
  switch( this.method ) {
  case 'GET':
    if( this.query['find'] === 'all' ) {
      return this.body = yield getGitHubProjects(this);
    } else {
      return this.body = yield getNewGitHubProjects(this);
    }
  default:
    return this.throw(400, 'Invalid method ' + this.method);
  }
}));

// Get a list of projects, or create a new one
app.use(route('/projects', function*() {
  this.type = 'application/json';
  switch( this.method ) {
  case 'GET':
    let query = {};
    let rq = this.request.query || {};
    if( rq['tags'] ) { query['tags'] = rq['tags'] };
    return this.body = yield listProjects(this, query);
  case 'POST':
    return this.body = yield saveProject(this);
  default:
    return this.throw(400, 'Invalid method ' + this.method);
  }
}));

// Get a list of projects, or create a new one
app.use(route('/projects/search', function*() {
  this.type = 'application/json';
  switch( this.method ) {
  case 'GET':
    return this.body = yield listProjects(this, query);
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
