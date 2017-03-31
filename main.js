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
    adapter.log.info('stateChange ' + id + ' ' + JSON.stringify(state));

    var arr_id = id.split('.'); //разбить на массив
    //adapter.log.info(JSON.stringify(arr_id))
    //adapter.log.info(id);
    //adapter.log.info(adapter.namespace+'.'+arr_id[2]+'.tts.response');

    if(id===adapter.namespace+'.'+arr_id[2]+'.tts.response'){

        for (var i = 0; i < adapter.config.devices.length; i++) {
            var name = adapter.config.devices[i].name
            var ip = adapter.config.devices[i].ip
            var port = adapter.config.devices[i].port
            var time_start = adapter.config.devices[i].time_start
            var time_end = adapter.config.devices[i].time_end
            var date = new Date();
            var start = false;
            if(date.getHours()>=time_start&&date.getHours()<=time_end) start=true;  // Проверка времени оповещения
            if (arr_id[2]==name&&start) { //поиск по имени


                if(typeof (bufer[name])!=='object'){
                    bufer[name] = {};
                }
                bufer[name].ip = ip;
                bufer[name].port = port;
                bufer[name].name = name;
                if(typeof (bufer[name].text)!=='object'){
                    bufer[name].text=[]
                }
                if(typeof (bufer[name].start)=='undefined'){
                    bufer[name].start=true
                }


                bufer[name].text.push(state.val);
                if (bufer[name].start==true) {
                    say_bufer(name);
                }


            }
        }
    }else if (id===adapter.namespace+'.all_device.tts_response'||find(subscribe, id)!==-1){
        adapter.log.info(id);
        adapter.log.info(state);
        for (var i = 0; i < adapter.config.devices.length; i++) {
            var name = adapter.config.devices[i].name
            var ip = adapter.config.devices[i].ip
            var port = adapter.config.devices[i].port
            var time_start = adapter.config.devices[i].time_start
            var time_end = adapter.config.devices[i].time_end
            var date = new Date();
            if(date.getHours()>=time_start&&date.getHours()<=time_end) { // Проверка времени оповещения

                if(typeof (bufer[name])!=='object'){
                    bufer[name] = {};
                }
                bufer[name].ip = ip;
                bufer[name].port = port;
                bufer[name].name = name;
                if(typeof (bufer[name].text)!=='object'){
                    bufer[name].text=[]
                }
                if(typeof (bufer[name].start)=='undefined'){
                    bufer[name].start=true
                }


                bufer[name].text.push(state.val);
                if (bufer[name].start==true) {
                    say_bufer(name);
                }

            }

        }

    }
});

var bufer={};

function say_bufer(name){

    if(bufer[name].text.length!==0){
        bufer[name].start = false;

        getdata(name, bufer[name].ip, bufer[name].port, '/set.xhtml',{
            "send":"say",
            "text":bufer[name].text[0]}, function (response, ip) {
            try {
                response = JSON.parse(response);
                response.ip = ip;

            } catch (exception) {
                response = 'JSON.parse(response): error ';
            }
            adapter.log.info(JSON.stringify(response));
        });
        var char = bufer[name].text[0].toString();
        var num= char.length-char.replace(/\d/gm,'').length;
        var str = char.length-num;
        setTimeout(say_bufer, num*700+str*70+1000,name);
        bufer[name].text.shift();
    }else{
        bufer[name].start = true;
    }

}



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
        //adapter.log.info('ok: '+name);
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
var subscribe = [];

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

    if (!adapter.config.devices.length || !adapter.config.interval) {
        adapter.log.warn('No one device configured');
        return;

    }

    //adapter.config.interval = Number(adapter.config.interval);

    if (adapter.config.interval < 5000) adapter.config.interval = 5000;

    setInterval(time_paw, Number(adapter.config.interval));
    setInterval(time_reset_ignore, 600000);

    adapter.log.info('config devices: ' + JSON.stringify(adapter.config.devices));
    adapter.log.info('config: ' + adapter.config.interval);
    adapter.log.info('length: ' + adapter.config.devices.length);

    time_reset_ignore();
    init();
    if(adapter.config.text2command){
        adapter.objects.getObjectView('system', 'instance',
            {startkey: 'system.adapter.text2command.', endkey: 'system.adapter.text2command.\u9999'},
            function (err, doc) {
                if (doc && doc.rows) {
                    for (var i = 0; i < doc.rows.length; i++) {
                        var id = doc.rows[i].id;
                        var obj = doc.rows[i].value;
                        var arr_sub = id.split('.');
                        adapter.log.info('subscribe: ' + arr_sub[2] + '.' + arr_sub[3] + '.response');
                        adapter.subscribeForeignStates(arr_sub[2] + '.' + arr_sub[3] + '.response');
                        subscribe[subscribe.length] = arr_sub[2] + '.' + arr_sub[3] + '.response';
                    }
                    if (!doc.rows.length) adapter.log.info('No objects found.');
                } else {
                    adapter.log.info('No objects found: ' + err);
                }
            });
    }

    if(adapter.config.apiai){

        adapter.objects.getObjectView('system', 'instance',
            {startkey: 'system.adapter.apiai.', endkey: 'system.adapter.apiai.\u9999'},
            function (err, doc) {
                if (doc && doc.rows) {
                    for (var i = 0; i < doc.rows.length; i++) {
                        var id  = doc.rows[i].id;
                        var obj = doc.rows[i].value;
                        var arr_sub = id.split('.');
                        adapter.log.info('subscribe: '+arr_sub[2]+'.'+arr_sub[3]+'.respons.speech');
                        adapter.subscribeForeignStates(arr_sub[2]+'.'+arr_sub[3]+'.respons.speech');
                        subscribe[subscribe.length] = arr_sub[2]+'.'+arr_sub[3]+'.respons.speech';
                    }
                    if (!doc.rows.length) adapter.log.info('No objects found.');
                } else {
                    adapter.log.info('No objects found: ' + err);
                }
            });
    }

    if(adapter.config.hilink){

        adapter.objects.getObjectView('system', 'instance',
            {startkey: 'system.adapter.hilink.', endkey: 'system.adapter.hilink.\u9999'},
            function (err, doc) {
                if (doc && doc.rows) {
                    for (var i = 0; i < doc.rows.length; i++) {
                        var id  = doc.rows[i].id;
                        var obj = doc.rows[i].value;
                        var arr_sub = id.split('.');
                        adapter.log.info('subscribe: '+arr_sub[2]+'.'+arr_sub[3]+'.last_sms.Content');
                        adapter.subscribeForeignStates(arr_sub[2]+'.'+arr_sub[3]+'.last_sms.Content');
                        subscribe[subscribe.length] = arr_sub[2]+'.'+arr_sub[3]+'.last_sms.Content';
                    }
                    if (!doc.rows.length) adapter.log.info('No objects found.');
                } else {
                    adapter.log.info('No objects found: ' + err);
                }
            });
    }

}

