/* jshint -W097 */
// jshint strict:false
/*jslint node: true */
'use strict';

// you have to require the utils module and call adapter function
const utils = require('@iobroker/adapter-core');
let adapter;
const http = require('http');
// const querystring = require('querystring');
const url = require('url');
const fs = require('fs');
let server = null;

//const ignorelist = [];
//const subscribe = [];
let resArray = [];
const existingStates = {};
const listConnection = [];

const minVersionApp = 33;


function startAdapter(options) {
  options = options || {};
  Object.assign(options, {
    name: 'paw'
  });

  adapter = new utils.Adapter(options);

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

    const arr_id = id.split('.');
    const myIdComm = adapter.namespace + '.' + arr_id[2] + '.comm.';
    const myIdItem = adapter.namespace + '.' + arr_id[2] + '.item.';
    const myIdWidget = adapter.namespace + '.' + arr_id[2] + '.widget.';
    const myIdAll = adapter.namespace + '.all_devices.';

    const name = arr_id[2];
    adapter.log.debug(id);

    if (id.indexOf(myIdComm + 'audio') !== -1) sendPost(name, id, {volume: state.val,type: arr_id[5]});
    if (id.indexOf(myIdComm + 'call.number') !== -1) sendPost(name, id, {call: state.val});
    if (id.indexOf(myIdComm + 'call.end') !== -1) sendPost(name, id, {callEnd: state.val});
    if (id.indexOf(myIdComm + 'display.brightness') !== -1) sendPost(name, id, {brightness: state.val});
    if (id.indexOf(myIdComm + 'display.mode') !== -1) sendPost(name, id, { brightnessMode: state.val});
    if (id.indexOf(myIdComm + 'display.timeOff') !== -1) sendPost(name, id, {timeOff: state.val });
    if (id.indexOf(myIdComm + 'display.toWake') !== -1) sendPost(name, id, { toWake: state.val});
    //    if (id.indexOf(myIdComm + 'display.turnOnOff') !== -1) sendPost(name, id, {turnOnOff: state.val });
    if (id.indexOf(myIdComm + 'other.home') !== -1) sendPost(name, id, {home: state.val});
    if (id.indexOf(myIdComm + 'other.play') !== -1) sendPost(name, id, {play: true});
    if (id.indexOf(myIdComm + 'other.vibrate') !== -1) sendPost(name, id, {vibrate: state.val});
    if (id.indexOf(myIdComm + 'other.openURL') !== -1) sendPost(name, id, {link: state.val});
    if (id.indexOf(myIdComm + 'tts.request') !== -1) sendPost(name, id, {tts: state.val});
    if (id.indexOf(myIdComm + 'tts.stop') !== -1) sendPost(name, id, {ttsStop: state.val});

    if (id.indexOf(myIdItem) !== -1) sendPost(name, id, {item: id.substring(id.indexOf('.item.') + 6).replace(/\./g, '/'),value: state.val}, true);

    if (id.indexOf(myIdAll + 'tts.request') !== -1) sendPostAll(name, id, { tts: state.val });
    if (id.indexOf(myIdWidget) !== -1) sendPost(name, id, { widget: id.substring(id.indexOf('.widget.') + 8).replace(/\./g, "/"), value: state.val    }, true);

  });
  adapter.on('message', function (obj) {
    if (obj !== null && obj !== undefined) {
      if (typeof obj == 'object' && obj.message) {
        if (obj.command === 'info') {
          adapter.log.debug('command : ' + JSON.stringify(obj.command));
          if (obj.message) {
            adapter.log.debug('message : ' + JSON.stringify(obj.message));
            post(obj.message.ip, '8080', '/api/get.json', obj.message, function (res) {
              if (obj.callback) {
                const resObj = parseStringToJson(res);
                if(resObj) resObj.minVersionApp = minVersionApp;
                adapter.sendTo(obj.from, obj.command, resObj, obj.callback);
              }
            });
          }
          return;
        }

        if (obj.command) {
          let comm = obj.command.replace(/\s+/g, ''); //убрать пробелы
          comm = comm.split(','); //разбить на массив
          //        adapter.log.debug('comm : ' + comm);
          if (obj.message) {
            resArray = [];
            for (let i = 0; i < adapter.config.devices.length; i++) {
              const name = adapter.config.devices[i].name;
              const ip = adapter.config.devices[i].ip;

              if (name !== '' && ip !== '') {
                if ((comm == 'all' || find(comm, name) || find(comm, ip)) && listConnection.indexOf(name) != -1) { //поиск по имени и ip
                  //                adapter.log.debug('name : ' + listConnection.indexOf(name));
                  post(ip, '8080', '/api/set.json', obj.message, function (res) {
                    const resObj = parseStringToJson(res);
                    adapter.log.debug('res : ' + JSON.stringify(res));
                    resArray[resArray.length] = resObj ? resObj : res;
                  });
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
} // endStartAdapter

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
  for (let i = 0; i < adapter.config.devices.length; i++) {
    const deviceName = adapter.config.devices[i].name;
    const ip = adapter.config.devices[i].ip;
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
  setdata = JSON.stringify(setdata);
  const options = {
    host: ip,
    port: port,
    path: path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(setdata)
    }
  };
  const req = http.request(options, function (res) {
    res.setEncoding('utf8');
    let buffer = '';
    res.on('data', function (data) {
      buffer = buffer + data;
    });
    res.on('end', function ( /*data*/ ) {
      if (callback) callback(buffer);
    });
  });
  req.on('error', function (e) {
    if (callback) callback(e, ip);
  });
  req.write(setdata);
  req.end();
}

function find(array, value) {
  for (let i = 0; i < array.length; i++) {
    if (array[i] == value) return value;
  }
  return false;
}

function parseStringToJson(str) {
  let res = {};
  try {
    res = JSON.parse(str);
    return res;
  } catch (exception) {
    return false;
  }
}

function addDevice(device, version) {
  if (version && minVersionApp <= version) {
    if (device && listConnection.indexOf(device) === -1) {
      listConnection[listConnection.length] = device;
      setValue(adapter.namespace + '.info.connection', listConnection.join(','));
    }
  }else{
    adapter.log.warn('Update app on device: ' + device);
  }
}

function deleteDevice(device) {
  if (device && listConnection.indexOf(device) === -1) {
    listConnection[listConnection.length] = device;
    setValue(adapter.namespace + '.info.connection', listConnection.join(','));
  }
}

function parseInfo(info, name) {
  if (info) {
    const device = info.info.device;
    const version = info.info.versionCode;
    for (const k in info) {
      if (typeof (info[k]) === 'object' && k !== 'info') {
        const subInfo = info[k];
        for (const i in subInfo) {
          if (subInfo[i]) {
            setValue(adapter.namespace + '.' + device + '.info.' + k + '.' + i, subInfo[i]);
            //            adapter.log.info('parseInfo device : ' + adapter.namespace + '.' + device + '.info.' + k + '.' + i + ' val: ' + subInfo[i]);
          }
        }
      }
    }
    adapter.log.debug('device ' + device + ' : ' + listConnection.indexOf(device));
    addDevice(device, version);
  } else {
    deleteDevice(name);
  }
}

function getDeviceInfo() {
  for (let i = 0; i < adapter.config.devices.length; i++) {
    const ip = adapter.config.devices[i].ip;
    post(ip, 8080, '/api/get.json', {}, function (res, ip) {
      parseInfo(parseStringToJson(res), findDevice(ip));
    });
  }
}

function findDevice(val) {
  for (let i = 0; i < adapter.config.devices.length; i++) {
    if (val === adapter.config.devices[i].name) return adapter.config.devices[i].ip;
    if (val === adapter.config.devices[i].ip) return adapter.config.devices[i].name;
  }
  return false;
}


function initOnlyOne(name) {
  adapter.log.debug('initOnlyOne');
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

  adapter.subscribeStates(name + '.comm.*');
  adapter.subscribeStates(name + '.item.*');
  adapter.subscribeStates(name + '.widget.*');
}

function getObjectItem() {
  const objectItem = {};
  adapter.log.debug('getObjectItem ');
  adapter.log.debug('adapter.instance ' + adapter.instance);

  adapter.objects.getObjectList({
    include_docs: false
  }, function (err, res) {

    if (res && !err) {
      for (let i = 0; i < res.rows.length; i++) {
//        adapter.log.debug('res.rows[i] ' + JSON.stringify(res.rows[i]));
        const idSplit = res.rows[i].id.split('.');
        if (idSplit[0] === 'paw' && idSplit[2] && idSplit[3] === 'item') {
          adapter.getObject(res.rows[i].id, function (err, state) {
            adapter.log.debug('state ' + JSON.stringify(state));
          });
        }
      }
//      adapter.log.debug('objectItem ' + JSON.stringify(res));
    }
  });

}

function init() {

  for (let i = 0; i < adapter.config.devices.length; i++) {
    const name = adapter.config.devices[i].name;
    const ip = adapter.config.devices[i].ip;
    const port = adapter.config.devices[i].port;
    const state = adapter.config.devices[i].state;

    if (name != '' && state) {
      post(ip, port, '/api/settings.json', { //запись настроек (ip,port,device,namespace )в устройство
        ip: "http://" + adapter.config.server,
        namespace: adapter.namespace,
        port: adapter.config.port,
        path: '/api/',
        send: true,
      }, function (res) {
        adapter.log.debug('/api/settings.json: ' + res);
        res = parseStringToJson(res);
        if (res) {
          if (res.status === 'OK') {
            adapter.getForeignObject('system.adapter.' + adapter.namespace, (err, obj) => adapter.setForeignObject(obj._id, obj));
          }
          if (res.status === 'ERROR' && res.device) {
            initOnlyOne(res.device);
            getDeviceInfo();
          }
        }
      });
    }
  }

  setValue(adapter.namespace + '.info.connection', '');
  setValue(adapter.namespace + '.all_devices.tts.request', '');
  setValue(adapter.namespace + '.all_devices.tts.stop', '');
  adapter.subscribeStates(adapter.namespace + '.all_devices.*');

}

function newObject(str) {
  if (str) {
    for (const k in str) {
      let device = str[k].device;
      let version = str[k].versionCode;

      if (typeof (str[k]) === 'object') {
        if (adapter.namespace === str[k].namespace) {
          setValue(device + '.' + str[k].path, str[k].value);
        } else {
          adapter.setForeignState(str[k].namespace + '.' + device + '.' + str[k].path, str[k].value, true);
        }
        adapter.log.debug(JSON.stringify(str[k]));
      }
      adapter.log.debug('version: ' + version);
      addDevice(device, version);
    }
  } else {
    adapter.log.debug('parse_data_error: ' + str);
  }
}

function restApi(req, res) {
  const path = url.parse(decodeURI(req.url));
  adapter.log.debug(path);
  if (req.method == 'POST') {
    const response = 'OK';
    let body = '';
    req.on('data', function (data) {
      body += data;
    });
    req.on('end', function () {
      adapter.log.debug('path: ' + path.pathname + ' POST: ' + body);
      if (path.pathname === '/api/') newObject(parseStringToJson(body));

    });
    res.writeHead(200, {
      'Content-Type': 'text/html'
    });
    res.end(response);
  } else if (req.method === 'GET') {
    if (path.pathname === '/') path.pathname = '/index.html';

    if (fs.existsSync(__dirname + '/www' + path.pathname)) {
      const html = fs.readFileSync(__dirname + '/www' + path.pathname);
      res.writeHead(200, {
        'Content-Type': 'text/html'
      });
      res.end(html);
    } else {
      const html = '<html><body>404 Not Found</body></html>';
      res.writeHead(404, {
        'Content-Type': 'text/html'
      });
      res.end(html);
    }

  }
}


function main() {

//  getObjectItem();

  if (!adapter.config.interval || !adapter.config.server || !adapter.config.port) {
    adapter.log.warn('Enter the data ip, port, interval and devices');
    return;
  }

  const ipformat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

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
  setInterval(getDeviceInfo, Number(adapter.config.interval) * 1000);

  adapter.log.info('devices: ' + JSON.stringify(adapter.config.devices));
  adapter.log.info('interval: ' + adapter.config.interval);
  adapter.log.info('server: ' + adapter.config.server);
  adapter.log.info('port: ' + adapter.config.port);
  adapter.log.info('namespace: ' + adapter.namespace);

  init();
}

if (module.parent) {
  module.exports = startAdapter;
} else {
  // or start the instance directly
  startAdapter();
}
