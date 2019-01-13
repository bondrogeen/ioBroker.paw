/* jshint -W097 */
// jshint strict:false
/*jslint node: true */
'use strict';

// you have to require the utils module and call adapter function
var utils = require(__dirname + '/lib/utils'); // Get common adapter utils
var adapter = utils.Adapter('paw');
var http = require('http');
var querystring = require('querystring');
var url = require('url');
var fs = require('fs');
var server = null;

var ignorelist = [];
var subscribe = [];
var resArray = [];
var existingStates = {};
var listConnection = [];

adapter.on('unload', function (callback) {
  try {
    adapter.log.info('cleaned everything up...');
    callback();
  } catch (e) {
    callback();
  }
});

// is called if a subscribed object changes
adapter.on('objectChange', function (id, obj) {
  // Warning, obj can be null if it was deleted
  adapter.log.info('objectChange ' + id + ' ' + JSON.stringify(obj));
});

// is called if a subscribed state changes
adapter.on('stateChange', function (id, state) {
  //  adapter.log.info('stateChange ' + id + ' ' + JSON.stringify(state) + ', ack=' + state.ack);
  if (state.ack || state.val === '') return; // we only need to handle it when ack=false

  var arr_id = id.split('.');
  var myIdComm = adapter.namespace + '.' + arr_id[2] + '.comm.';
  var myIdItem = adapter.namespace + '.' + arr_id[2] + '.item.';
  var myIdAll = adapter.namespace + '.all_devices.';
  var name = arr_id[2];
  adapter.log.debug(id);

  if (id.indexOf(myIdComm + 'audio') !== -1) sendPost(name, id ,{volume: state.val,type: arr_id[5]})
  if (id.indexOf(myIdComm + 'call.number') !== -1) sendPost(name, id ,{call: state.val});
  if (id.indexOf(myIdComm + 'call.end') !== -1) sendPost(name, id ,{callEnd: state.val});
  if (id.indexOf(myIdComm + 'display.brightness') !== -1) sendPost(name, id ,{brightness: state.val});
  if (id.indexOf(myIdComm + 'display.mode') !== -1) sendPost(name, id ,{brightnessMode: state.val});
  if (id.indexOf(myIdComm + 'display.timeOff') !== -1) sendPost(name, id ,{timeOff: state.val});
  if (id.indexOf(myIdComm + 'display.toWake') !== -1) sendPost(name, id ,{toWake: state.val});
  if (id.indexOf(myIdComm + 'display.turnOnOff') !== -1) sendPost(name, id ,{turnOnOff: state.val});
  if (id.indexOf(myIdComm + 'other.home') !== -1) sendPost(name, id ,{home: state.val});
  if (id.indexOf(myIdComm + 'other.play') !== -1) sendPost(name, id ,{play: true});
  if (id.indexOf(myIdComm + 'other.vibrate') !== -1) sendPost(name, id ,{vibrate: state.val});
  if (id.indexOf(myIdComm + 'other.openURL') !== -1) sendPost(name, id ,{link: state.val});
  if (id.indexOf(myIdComm + 'tts.request') !== -1) sendPost(name, id ,{tts: state.val});
  if (id.indexOf(myIdComm + 'tts.stop') !== -1) sendPost(name, id ,{ttsStop: state.val});

  if (id.indexOf(myIdItem) !== -1) sendPost(name, id ,{item: id.substring(id.indexOf('.item.') + 6).replace(/\./g, "/") ,value: state.val}, true);

  if (id.indexOf(myIdAll + 'tts.request') !== -1) sendPostAll(name, id ,{tts: state.val});
});
adapter.on('message', function (obj) {
  if (typeof obj !== null && obj !== undefined) {
    if (typeof obj == 'object' && obj.message) {

      if (obj.command === 'info') {

        adapter.log.debug('command : ' + JSON.stringify(obj.command));

        if (obj.message) {

          adapter.log.debug('message : ' + JSON.stringify(obj.message));


          post(obj.message.ip, '8080', '/api/get.json', obj.message, function (res) {
            if (obj.callback) {
              var resObj = parseStringToJson(res);
              adapter.sendTo(obj.from, obj.command, resObj, obj.callback);

            }
          })
        }
        return;
      }

      if (obj.command) {
        var comm = obj.command.replace(/\s+/g, ''); //убрать пробелы
        comm = comm.split(','); //разбить на массив
        //        adapter.log.debug('comm : ' + comm);
        if (obj.message) {
          resArray = [];
          for (var i = 0; i < adapter.config.devices.length; i++) {
            var name = adapter.config.devices[i].name;
            var ip = adapter.config.devices[i].ip;

            if (name !== '' && ip !== '') {
              if ((comm == 'all' || find(comm, name) || find(comm, ip)) && listConnection.indexOf(name) != -1) { //поиск по имени и ip
                //                adapter.log.debug('name : ' + listConnection.indexOf(name));
                post(ip, '8080', '/api/set.json', obj.message, function (res) {
                  var resObj = parseStringToJson(res);
                  adapter.log.debug('res : ' + JSON.stringify(res));
                  resArray[resArray.length] = resObj ? resObj : res;
                })
              }
            }
          }
          if (obj.callback) {
            setTimeout(function () {
              adapter.sendTo(obj.from, obj.command, resArray, obj.callback);
              //res=[];
            }, 2000);
          }
        }
      }
    }
  }
});

adapter.on('ready', function () {
  main();
});

function sendPost(name, id, data, isTrue) {
  if (listConnection.indexOf(name) !== -1) {
    post(findDevice(name), '8080', '/api/set.json', data, function (res) {
      adapter.log.debug('res : ' + res);
      res = parseStringToJson(res);
      if (res && res.status === 'OK' && !isTrue) setValue(id, '');
    });
  }
}

function sendPostAll(name, id, data) {
  for (var i = 0; i < adapter.config.devices.length; i++) {
    var deviceName = adapter.config.devices[i].name;
    var ip = adapter.config.devices[i].ip;
    var port = adapter.config.devices[i].port;
    var state = adapter.config.devices[i].state;
    //    adapter.log.info('deviceName: ' + deviceName );
    if (listConnection.indexOf(deviceName) !== -1) {
      post(ip, 8080, '/api/set.json', data, function (res) {
        adapter.log.debug('res : ' + res);
      });
    }
  }
}

function setValue(id, val) {
  if (existingStates[id]) {
    adapter.setState(id, {
      val: val,
      ack: true
    });
  } else {
    adapter.getState(id, function (err, obj) {
//      adapter.log.info(id +  + ' obj: ' + obj);
      if (obj === null) {
        adapter.setObjectNotExists(id, {
          type: 'state',
          common: {
            name: id.split('.')[id.split('.').length - 1],
            type: 'mixed',
            role: 'indicator',
            read: 'true',
            write: 'true'
          },
          native: {}
        });
        existingStates[id] = true;
        setValue(id, val);
      } else {
        existingStates[id] = true;
        setValue(id, val);
      }
    });
  }
}

function post(ip, port, path, setdata, callback) {
  var setdata = JSON.stringify(setdata);
  var options = {
    host: ip,
    port: port,
    path: path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(setdata)
    }
  };
  var req = http.request(options, function (res) {
    res.setEncoding('utf8');
    var buffer = '';
    res.on('data', function (data) {
      buffer = buffer + data;
    });
    res.on('end', function (data) {
      if (callback) callback(buffer);
    });
  });
  req.on('error', function (e) {
    if (callback) callback(e,ip);
  });
  req.write(setdata);
  req.end();
}

function find(array, value) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] == value) return value;
  }
  return false;
}

function parseStringToJson(str) {
  var res = {};
  try {
    res = JSON.parse(str);
    return res;
  } catch (exception) {
    return false;
  }
}

function parseInfo(info, name) {
  if (info) {
    var device = info.info.device;
    for (var k in info) {
      if (typeof (info[k]) === 'object' && k !== 'info') {
        var subInfo = info[k];
        for (var i in subInfo) {
          if (subInfo[i]) {
            setValue(adapter.namespace + '.' + device + '.info.' + k + '.' + i, subInfo[i]);
            //            adapter.log.info('parseInfo device : ' + adapter.namespace + '.' + device + '.info.' + k + '.' + i + ' val: ' + subInfo[i]);
          }
        }
      }
    }
    adapter.log.debug('device ' + device + ' : ' + listConnection.indexOf(device));
    if (device && listConnection.indexOf(device) === -1) {
      listConnection[listConnection.length] = device;
      setValue(adapter.namespace + '.info.connection', listConnection.join(','));
    }
  } else {
    if (name && listConnection.indexOf(name) !== -1) {
      listConnection.splice(listConnection.indexOf(name), 1)
      setValue(adapter.namespace + '.info.connection', listConnection.join(','));
    }
  }
}

function getDeviceInfo() {
  for (var i = 0; i < adapter.config.devices.length; i++) {
    var deviceName = adapter.config.devices[i].name;
    var ip = adapter.config.devices[i].ip;
    var port = adapter.config.devices[i].port;
    var state = adapter.config.devices[i].state;
    if (state) {
      post(ip, 8080, '/api/get.json', {}, function (res, ip) {
        parseInfo(parseStringToJson(res), findDevice(ip));
      });
    }
  }
}

function findDevice(val) {
  for (var i = 0; i < adapter.config.devices.length; i++) {
    if (val === adapter.config.devices[i].name) return adapter.config.devices[i].ip;
    if (val === adapter.config.devices[i].ip) return adapter.config.devices[i].name;
  }
  return false;
}


function initOnlyOne(name){
      setValue(name + '.comm.call.number', '');
      setValue(name + '.comm.call.end', '');
      setValue(name + '.comm.tts.request', '');
      setValue(name + '.comm.tts.stop', '');
      setValue(name + '.comm.display.brightness', '');
      setValue(name + '.comm.display.mode', '');
      setValue(name + '.comm.display.toWake', '');
      setValue(name + '.comm.display.timeOff', '');
      setValue(name + '.comm.other.home', '');
      setValue(name + '.comm.other.openURL', '');
      setValue(name + '.comm.other.vibrate', '');
      setValue(name + '.comm.other.play', '');
      setValue(name + '.comm.audio.ring', '');
      setValue(name + '.comm.audio.music', '');
      setValue(name + '.comm.audio.alarm', '');
      setValue(name + '.comm.audio.notification', '');
      setValue(name + '.comm.audio.system', '');
      setValue(name + '.comm.audio.voice', '');
      setValue(name + '.comm.display.turnOnOff', '');

      adapter.subscribeStates(name + '.comm.*');
      adapter.subscribeStates(name + '.item.*');
}

function getObjectItem() {
  var objectItem = {};
  adapter.log.debug('getObjectItem ');
  adapter.log.debug('adapter.instance ' + adapter.instance);


  adapter.objects.getObjectList({
    include_docs: false
  }, function (err, res) {


    if (res && !err) {
      for (var i = 0; i < res.rows.length; i++) {

        var idSplit = res.rows[i].id.split('.');
        if (idSplit[0] === 'paw' && idSplit[2] && idSplit[3] === 'item') {
          var name = idSplit[2];
          var id = res.rows[i].id.split('.');

          adapter.getObject(res.rows[i].id, function (err, state) {
            adapter.log.debug('state ' + JSON.stringify(state));

          });
        }
      }
      adapter.log.debug('objectItem ' + objectItem);
    }
  });

}
function init() {

  for (var i = 0; i < adapter.config.devices.length; i++) {
    var name = adapter.config.devices[i].name;
    var ip = adapter.config.devices[i].ip;
    var port = adapter.config.devices[i].port;
    var state = adapter.config.devices[i].state;

    if (name != '' && state) {
      post(ip, port, '/api/settings.json', { //запись настроек (ip,port,device,namespace )в устройство
        ip: adapter.config.server,
        device: name,
        namespace: adapter.namespace,
        port: adapter.config.port,
        path: 'api/',
        send: true,
      }, function (res) {
        adapter.log.debug('/api/settings.json: ' + res);
        res = parseStringToJson(res);
        if(res) {

          if(res.status === "OK") {
            adapter.getForeignObject('system.adapter.' + adapter.namespace, (err, obj) => adapter.setForeignObject(obj._id, obj));
          }

          if(res.status === "ERROR" && res.device){
            adapter.log.debug('initOnlyOne');
            initOnlyOne(res.device);
            getDeviceInfo();
          }

          if(res.device && !find(listConnection,res.device)) {
            adapter.log.debug('res: ' + res.status);
            listConnection[listConnection.length] = res.device;
            setValue(adapter.namespace + '.info.connection', listConnection.join(','));
          }
        }
      });
    }
  }
  setValue(adapter.namespace + '.all_devices.tts.request', '');
  setValue(adapter.namespace + '.all_devices.tts.stop', '');
  adapter.subscribeStates(adapter.namespace + '.all_devices.*');

}

function newObject(str) {
  if (str) {
    for (var k in str) {
      if (typeof (str[k]) === 'object') {
        if (adapter.namespace === str[k].namespace) {
          setValue(str[k].device + '.' + str[k].path, str[k].value);
        } else {
          adapter.setForeignState(str[k].namespace + '.' + str[k].device + '.' + str[k].path, str[k].value, true);
        }
        //        adapter.log.info(str[k].device + '.' + str[k].path + ' + ' + str[k].value);
                adapter.log.info(JSON.stringify(str[k]));
      }
    }
  }else{
    adapter.log.debug('parse_data_error: ' + str);
  }
}

function restApi(req, res) {
  var urlStr = req.url;
  var urlObj = url.parse(decodeURI(req.url));
  adapter.log.debug(req.url);
  if (req.method == 'POST') {
    var respons = 'OK';
    var body = '';
    req.on('data', function (data) {
      body += data;
    });
    req.on('end', function () {
      adapter.log.debug('POST ' + body);
      adapter.log.debug('urlStr' + urlStr);
      if(urlStr === '/api/') newObject(parseStringToJson(body));

    });
    res.writeHead(200, {
      'Content-Type': 'text/html'
    });
    res.end(respons);
  } else if (req.method == 'GET') {
    if (urlObj.pathname == '/') urlObj.pathname = '/index.html';

    if (fs.existsSync(__dirname + '/www' + urlObj.pathname)) {
      var html = fs.readFileSync(__dirname + '/www' + urlObj.pathname);
      res.writeHead(200, {
        'Content-Type': 'text/html'
      });
      res.end(html);
    } else {
      var html = '<html><body>404 Not Found</body></html>';
      res.writeHead(404, {
        'Content-Type': 'text/html'
      });
      res.end(html);
    }

  }
}



function main() {

  getObjectItem();

  if (!adapter.config.interval || !adapter.config.server || !adapter.config.port) {
    adapter.log.warn('Enter the data ip, port, interval and devices');
    return;
  }

  var ipformat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  if (!adapter.config.server.match(ipformat)) {
    adapter.log.warn('You have entered an invalid IP address!');
    return;
  }

  if (adapter.config.server.match(ipformat)) {
    adapter.config.port = parseInt(adapter.config.port, 10) || 0;
    if (adapter.config.port) {
      server = require('http').createServer(restApi);

      adapter.getPort(adapter.config.port, function (port) {
        if (port != adapter.config.port && !adapter.config.findNextPort) {
          adapter.log.warn('port ' + adapter.config.port + ' already in use');
        } else {
          server.listen(port);
          adapter.log.info('http server listening on port : ' + port);
        }
      });
    } else {
      adapter.log.info('No port specified');
    }
  }

  if (adapter.config.interval < 5) adapter.config.interval = 5;
  setInterval(getDeviceInfo, Number(adapter.config.interval)  * 1000);

  adapter.log.info('devices: ' + JSON.stringify(adapter.config.devices));
  adapter.log.info('interval: ' + adapter.config.interval);
  adapter.log.info('server: ' + adapter.config.server);
  adapter.log.info('port: ' + adapter.config.port);
  adapter.log.info('namespace: ' + adapter.namespace);

  init();
}
