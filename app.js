'use strict';

var fs = require('fs')
  , path = require('path')
  , FTPClient = require('ftp')
  , Watcher = require('./watcher').Watcher
  , ftpClient = new FTPClient()
  , cfg;

var watchFiles = function (rules, ftp) {
  rules.forEach(function (data) {
    var pattern = data.cwd + data.pattern;

    console.log('Start watching for %s', pattern);

    new Watcher(pattern, function (event, filepath) {
      console.log('\n%s %s', event, filepath);
      console.time('Upload file');

      ftp.put(filepath, data.remoteDir + path.relative(data.cwd, filepath), function (err) {
        if (err) throw err;

        console.timeEnd('Upload file');
        console.log('File successfully uploaded');
      });
    });
  });
};

ftpClient.on('ready', function () {
  console.log('FTP connection is opened\n');

  watchFiles(cfg.rules, this);
});

ftpClient.on('error', function (err) {
  if (err) throw err;
});

ftpClient.on('end', function () {
  console.log('FTP connection has ended');
});

ftpClient.on('close', function () {
  console.log('FTP connection has closed');
});

fs.readFile(path.resolve(__dirname, './config.json'), function (err, stream) {
  if (err) throw err;

  try {
    cfg = JSON.parse(stream);
    ftpClient.connect(cfg.ftp);
  } catch (e) {
    throw e;
  }
});
