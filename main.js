"use strict";

// you have to require the utils module and call adapter function
var utils =    require(__dirname + '/lib/utils'); // Get common adapter utils
var adapter = utils.adapter('paw');
var http = require('http');
const querystring = require('querystring');

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

var sms={};


// is called if a subscribed state changes
adapter.on('stateChange', function (id, state) {
    //adapter.log.info('stateChange ' + id + ' ' + JSON.stringify(state));

    var arr_id = id.split('.'); //разбить на массив
    //adapter.log.info(JSON.stringify(arr_id))
    //adapter.log.info(id);
    //adapter.log.info(adapter.namespace+'.'+arr_id[2]+'.tts.response');

    if(id===adapter.namespace+'.'+arr_id[2]+'.tts.response'){

        for (var i = 0; i < adapter.config.devices.length; i++) {
            var name = adapter.config.devices[i].name
            var ip = adapter.config.devices[i].ip
            var port = adapter.config.devices[i].port
            if (arr_id[2]==name&&state.val) { //поиск по имени
                getdata(name, ip, port, '/set.xhtml',{
                    "send":"say",
                    "text":state.val}, function (response, ip) {
                    try {
                        response = JSON.parse(response);
                        response.ip = ip;

                    } catch (exception) {
                        response = 'JSON.parse(response): error ';
                    }
                    adapter.log.info(JSON.stringify(response));
                });
            }
        }
    }else if (id===adapter.namespace+'.all_device.tts_response'){
        adapter.log.info(id);
        adapter.log.info(state);
        for (var i = 0; i < adapter.config.devices.length; i++) {
            var name = adapter.config.devices[i].name
            var ip = adapter.config.devices[i].ip
            var port = adapter.config.devices[i].port
            getdata(name, ip, port, '/set.xhtml',{
                "send":"say",
                "text":state.val}, function (response, ip) {
                try {
                    response = JSON.parse(response);
                    response.ip = ip;

                } catch (exception) {
                    response = 'JSON.parse(response): error ';
                }
                adapter.log.info(JSON.stringify(response));
            });

        }

    }
});




var res=[];
var x=0;
// Some message was sent to adapter instance over message box. Used by email, pushover, text2speech, ...
adapter.on('message', function (obj) {

    if (typeof obj == 'object' && obj.message) {
        if (obj.command) {
            var text = obj.command.replace(/\s+/g,'') //убрать пробелы
            var arr = text.split(','); //разбить на массив
            if (obj.message) {
                var x=0;
                for (var i = 0; i < adapter.config.devices.length; i++){
                    var name = adapter.config.devices[i].name
                    var ip = adapter.config.devices[i].ip
                    var port = adapter.config.devices[i].port
                    if(name!=''&&ip!=''&&port!='') {
                        if(arr=='all'||find(arr, name)!==-1||find(arr, ip)!==-1){ //поиск по имени и ip
                            getdata(name, ip, port, '/set.xhtml', obj.message, function (response,ip){
                                try {
                                    response = JSON.parse(response);
                                    response.ip = ip;

                                } catch (exception) {
                                    response = 'JSON.parse(response): error ';
                                }
                                res[x]=response;
                                x=x+1;
                                if (obj.callback){
                                    setTimeout(function () {
                                        adapter.sendTo(obj.from, obj.command, res, obj.callback);
                                    },2000);

                                }
                                res=[];
                            });
                        }
                    }
                }

            }
        }
    }
});

adapter.on('ready', function () {
    main();
});

function setdata (setid, response ) {
    for (var key in response) {
        var val = response[key];
        //adapter.log.info("key: " + response[key]);
        adapter.setObject(setid+'.'+key, {
            type: 'state',
            common: {
                name: key,
                type: 'mixed',
                role: 'indicator',
                read: "true",
                write: "false"
            },
            native: {}
        });
        adapter.setState(setid+'.' + key, {val: val, ack: true});
    }
}


function set_id (setid, name, val ) {
    adapter.setObject(setid+'.'+name, {
        type: 'state',
        common: {
            name: name,
            type: 'mixed',
            role: 'tts',
            read: "true",
            write: "true"
        },
        native: {}
    });
    adapter.setState(setid+'.'+name, {val: val, ack: true});

}

function parsedata(name,data,path) {

    try {
        data = JSON.parse(data);
    } catch (exception) {
        adapter.log.info('parse_data_error: '+name);
        data = null;
    }

    if (data) {
        adapter.log.info('ok: '+name);
        if(path=='/get.xhtml'){
            if(data.sensors) {
                delete data.sensors.info
                setdata (name+'.sensors', data.sensors );
            }
            if(data.wifi) setdata (name+'.wifi', data.wifi );
            if(data.battery) setdata (name+'.battery', data.battery );
            if(data.cpu) setdata (name+'.cpu', data.cpu );
            if(data.audio_volume.info) setdata (name+'.audio_volume.info', data.audio_volume.info );
            if(data.audio_volume) {
                delete data.audio_volume.info
                setdata (name+'.audio_volume', data.audio_volume );
            }
            if(data.memory) setdata (name+'.memory', data.memory );
            if(data.info) setdata (name+'.info', data.info );
            if(typeof data.gps ==='object') setdata (name+'.gps', data.gps );
        }
    }
}



function getdata(name,ip,port,path,setdata,callback) {

    var setdata = querystring.stringify(setdata);

    var options = {
        host: ip,
        port: port,
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(setdata)
        }
    };

    var req = http.request(options, function(res) {
        res.setEncoding('utf8');
        var buffer = "";
        res.on( "data", function( data ) {
            buffer = buffer + data;
        });
        res.on( "end", function( data ) {
            if(buffer!=''){
                if(path=='/get.xhtml'){
                    parsedata (name,buffer,path);
                }else{
                    callback(buffer,ip);
                }

            }
        });
    });

    req.on('error', (e) => {
        adapter.log.warn(`problem with request: ${e.message}`);
        if(path=='/get.xhtml'){
            find(ignorelist, ip)
            if(find(ignorelist, ip)===-1){
                adapter.log.warn('ignorelist:'+ip);
                ignorelist[ignorelist.length] = ip;
            }
        }else{
            callback(e,ip);
        }


    });

    req.write(setdata);
    req.end();
}

var ignorelist = [];

function find(array, value) {

    for (var i = 0; i < array.length; i++) {
        if (array[i] == value) return i;
    }
    return -1;
}

function time_reset_ignore(){

    //adapter.log.warn('ignorelist reset:');
    ignorelist = [];
    for (var i = 0; i < adapter.config.devices.length; i++) {
        var ip = adapter.config.devices[i].ip
        var ign = adapter.config.devices[i].ign
        if(ign===true||ign==="true"){
            if(find(ignorelist, ip)===-1){
                adapter.log.warn('ignorelist:'+ip);
                ignorelist[ignorelist.length] = ip;
            }
        }
    }
}

function init(){
    for (var i = 0; i < adapter.config.devices.length; i++) {
        var name = adapter.config.devices[i].name
        var ip = adapter.config.devices[i].ip
        var port = adapter.config.devices[i].port

        if(name!=''){
            set_id (name+'.tts','response','text'  );
            adapter.subscribeStates(name+'.tts.response');
        }
    }
    set_id ('all_device','tts_response','text'  );
    adapter.subscribeStates('all_device.tts_response');
}

function time_paw() {
    //adapter.log.info('start: ');

    for (var i = 0; i < adapter.config.devices.length; i++) {
        var name = adapter.config.devices[i].name
        var ip = adapter.config.devices[i].ip
        var port = adapter.config.devices[i].port

        if(name!=''&&ip!=''&&port!=''){

            if(find(ignorelist, ip)===-1){
                getdata(name,ip,port,'/get.xhtml','')
            }
        }
    }
}


function main() {

    if (!adapter.config.devices.length||!adapter.config.interval) {
        adapter.log.warn('No one device configured');
        adapter.stop();

    }

    //adapter.config.interval = Number(adapter.config.interval);

    if (adapter.config.interval < 5000) adapter.config.interval = 5000;

    setInterval(time_paw, Number(adapter.config.interval));
    setInterval(time_reset_ignore, 600000);

    adapter.log.info('config devices: ' +JSON.stringify(adapter.config.devices));
    adapter.log.info('config: ' +adapter.config.interval);
    adapter.log.info('length: ' +adapter.config.devices.length);

    time_reset_ignore();
    init();

    adapter.objects.getObjectView('system', 'instance',
        {startkey: 'system.adapter.paw.', endkey: 'system.adapter.paw.\u9999'},
        function (err, doc) {
            if (doc && doc.rows) {
                for (var i = 0; i < doc.rows.length; i++) {
                    var id  = doc.rows[i].id;
                    var obj = doc.rows[i].value;
                    adapter.log.info('Found ' + id + ': ' + JSON.stringify(obj));
                    //set_id ('all.test','response',JSON.stringify(obj)  );
                }
                if (!doc.rows.length) console.log('No objects found.');
            } else {
                adapter.log.info('No objects found: ' + err);
            }
        });


}


