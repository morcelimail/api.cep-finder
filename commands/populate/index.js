let path     = require('path');
let fs       = require('fs');
let readline = require('readline');
let mongoose = require('mongoose');
let async    = require('async');
let config   = require(path.join('..', '..', 'config', 'app'));
let model    = require(path.join('..', '..', 'models', 'cep'));
let schema   = require(path.join('..', '..', 'models', 'schemas', 'cep'));
let helper   = require(path.join('..', '..', 'commons', 'helper'));

// ===========================================================================================
//                                          PROPERTIES
// ===========================================================================================

let isFirst     = true;
let basePath    = path.join(__dirname, 'base.txt');
let concurrency = 5;
let total       = 0;
let lines       = 0;
let interval    = null;
let queue       = async.queue((data, callback) => {
  total++;

  model
  .upsert({ cep: data.cep }, data)
  .then(() => {
    callback();
  })
  .catch(callback);
}, concurrency);

// ===========================================================================================
//                                          METHODS
// ===========================================================================================

function showStep(step, msg) {
  console.log('=====================================');
  console.log('[' + step + ']', msg);
  console.log('=====================================');
};

function connectDB(uri) {
  return new Promise((resolve, reject) => {
    mongoose.connect(uri);

    mongoose.connection.on('connected', resolve); 

    mongoose.connection.on('error', (error) => {  
      reject('MongoDB connection error.');
    });
  });
}

function createLineObj(line) {
  let lineArray = line.split(';');
  let result    = {
    cep         : lineArray[0],
    site        : lineArray[1].toLowerCase(),
    cidade      : lineArray[2].toLowerCase(),
    uf          : lineArray[3].toLowerCase(),
    cepBase     : parseInt(lineArray[4], 10),
    segmentacao : lineArray[5].toLowerCase(),
    area        : lineArray[6].toLowerCase(),
    cepStatus   : parseInt(lineArray[7], 10),
    updatedAt   : helper.dateByDays(-1),
  };
  
  return result;
}

function getLines(path) {
  return new Promise((resolve, reject) => {
    let lineReader = readline.createInterface({
      input: fs.createReadStream(path),
    });

    lineReader.on('line', (line) => {
      // skip the first line.
      if (isFirst) {
        isFirst = false;
        return;
      }

      let lineObj = createLineObj(line);

      if (! lineObj)
        return;

      lines++;

      queue.push(lineObj, (error) => {
        if(error)
          console.log('error:', error);
      });
    });

    lineReader.on('close', () => {
      resolve();
    });
  });
}

function startDebugInterval() {
    interval = setInterval(() => {
      let percent = ((total * 100) / lines).toFixed(2);
      console.log('progress:', total, 'of', lines, '(' + percent + '%)');

      if (total >= lines)
        finishApplication();
      
    }, 2000);
}

function finishApplication() {
  clearInterval(interval);
  showStep(4, 'Success! (exit in 5 seconds)');

  setTimeout(() => {
    process.exit();
  }, 5000);
}

// ===========================================================================================
//                                            RUN
// ===========================================================================================

showStep(1, 'Trying to connect on MongoDB...');

connectDB(config.mongodb.uri)
.then( () => {

  showStep(2, 'Trying to get registry lines...');

  getLines(basePath)
  .then(() => {

    showStep(3, 'Waiting for lines to finish...');

    startDebugInterval();

  })
  .catch((error) => {
    console.log('Fail on try to get lines - ' + error);
  });
})
.catch((error) => {
  console.log('Fail on try to connect on MongoDB - ' + error);
});