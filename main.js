/* jshint -W097 */
// jshint strict:false
/*jslint node: true */
"use strict";

// you have to require the utils module and call adapter function
var utils =    require(__dirname + '/lib/utils'); // Get common adapter utils
var adapter = utils.Adapter('paw');
var http = require('http');
var querystring = require('querystring');
var url = require('url');
var fs = require('fs');
var server =  null;



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
    adapter.log.info('stateChange ' + id + ' ' + JSON.stringify(state) + ', ack=' + state.ack);
    if (state.ack) return; // we only need to handle it when ack=false

    var arr_id = id.split('.'); //разбить на массив
    //adapter.log.info(JSON.stringify(arr_id))
    //adapter.log.info(id);
    adapter.log.info(adapter.namespace+'.'+arr_id[2]+'.command.command');
    adapter.log.info(arr_id[4]+"  "+adapter.namespace+'.'+arr_id[2]+'.command.'+find(command, arr_id[4]));

    if(id===adapter.namespace+'.'+arr_id[2]+'.tts.response'){

        for (var i = 0; i < adapter.config.devices.length; i++) {
            var name = adapter.config.devices[i].name;
            var ip = adapter.config.devices[i].ip;
            var port = adapter.config.devices[i].port;
            var time_start = adapter.config.devices[i].time_start;
            var time_end = adapter.config.devices[i].time_end;
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
                    bufer[name].text=[];
                }
                if(bufer[name].start===undefined){
                    bufer[name].start=true;
                }
                bufer[name].text.push(state.val);
                if (bufer[name].start==true) {
                    say_bufer(name);
                }


            }
        }
    }else if (id===adapter.namespace+'.all_device.brightness'||find(subscribe, id)){
        adapter.log.info(id);
        adapter.log.info(JSON.stringify(state));
        for (var i = 0; i < adapter.config.devices.length; i++) {
            var name = adapter.config.devices[i].name;
            var ip = adapter.config.devices[i].ip;
            var port = adapter.config.devices[i].port;

            if(state.val) {
                com_date = {"send": "brightness", "number": state.val};
                getdata(name, ip, port, "/set.xhtml", com_date, function (response, ip) {
                    adapter.log.info("command: " + com_date + " " + ip + " " + response);
                });
            }
        }

    }else if (id===adapter.namespace+'.all_device.tts_response'||find(subscribe, id)){
        adapter.log.info(id);
        adapter.log.info(JSON.stringify(state));
        for (var i = 0; i < adapter.config.devices.length; i++) {
            var name = adapter.config.devices[i].name;
            var ip = adapter.config.devices[i].ip;
            var port = adapter.config.devices[i].port;
            var time_start = adapter.config.devices[i].time_start;
            var time_end = adapter.config.devices[i].time_end;
            var date = new Date();
            if(date.getHours()>=time_start&&date.getHours()<=time_end) { // Проверка времени оповещения

                if(typeof (bufer[name])!=='object'){
                    bufer[name] = {};
                }
                bufer[name].ip = ip;
                bufer[name].port = port;
                bufer[name].name = name;
                if(typeof (bufer[name].text)!=='object'){
                    bufer[name].text=[];
                }
                if(bufer[name].start===undefined){
                    bufer[name].start=true;
                }


                bufer[name].text.push(state.val);
                if (bufer[name].start==true) {
                    say_bufer(name);
                }

            }

        }

    }else if(id===adapter.namespace+'.'+arr_id[2]+'.command.command') {

        for (var i = 0; i < adapter.config.devices.length; i++) {
            var name = adapter.config.devices[i].name;
            var ip = adapter.config.devices[i].ip;
            var port = adapter.config.devices[i].port;
            if (arr_id[2] == name) { //поиск по имени

                adapter.log.info(JSON.stringify(state));
                var com_date = null;
                if(state.val=="lcd_on") com_date = {"send":"lcd_on"};
                if(state.val=="endсall") com_date = {"send":"endсall"};
                if(state.val=="scan") com_date = {"send":"scan"};
                if(state.val=="speech") com_date = {"send":"speech"};
                if(state.val=="restart") com_date = {"send":"server","text":"restart"};
                if(state.val=="kill") com_date = {"send":"server","text":"kill"};
                if(state.val=="home") com_date = {"send":"home"};
                if(state.val=="gong") com_date = {"send":"gong"};
                if(state.val=="sound_noti") com_date = {"send":"sound_noti"};
                if(state.val=="sound_ring") com_date = {"send":"sound_ring"};
                if(state.val=="apps") com_date = {"send":"apps"};
                if(com_date != null){
                    getdata(name,ip,port,"/set.xhtml",com_date,function (response, ip){
                        adapter.log.info("command: "+com_date+" "+ip+" "+response);
                    });
                }
            }
        }

    }else if(arr_id[4]&&id===adapter.namespace+'.'+arr_id[2]+'.command.'+find(command, arr_id[4])) {

        for (var i = 0; i < adapter.config.devices.length; i++) {
            var name = adapter.config.devices[i].name;
            var ip = adapter.config.devices[i].ip;
            var port = adapter.config.devices[i].port;
            if (arr_id[2] == name) { //поиск по имени
                adapter.log.info("------- " + id);
                adapter.log.info(String(state.val).match(","));
                adapter.log.info(state.val);
                state.val = String(state.val);
                var com_date = null;
                if(state.val.match(",")){
                    var com_val =  state.val.replace(",", "^");
                    com_val =  com_val.split('^');
                    if(com_val[0]&&com_val[1]&&arr_id[4]=="alertinput") com_date = {"send":"alertinput","texthead":com_val[0],"text":com_val[1]};
                    if(com_val[0]&&com_val[1]&&arr_id[4]=="alert") com_date = {"send":"alert","texthead":com_val[0],"text":com_val[1]};
                    if(com_val[0]&&com_val[1]&&arr_id[4]=="send_sms") com_date = {"send":"sms","number":com_val[0],"text":com_val[1]};
                    if(com_val[0]&&com_val[1]&&arr_id[4]=="noti") com_date = {"send":"noti","texthead":com_val[0],"text":com_val[1]};
                }else {
                    if (arr_id[4] == "volume"&& state.val) com_date = {"send": "volume","number": state.val};
                    if (arr_id[4] == "openurl") com_date = {"send": "openurl","text": state.val};
                    if (arr_id[4] == "vibrate"&& state.val) com_date = {"send": "vibrate","number": state.val};
                    if (arr_id[4] == "rec"&& state.val) com_date = {"send": "rec", "number": state.val};
                    if (arr_id[4] == "app_start") com_date = {"send": "app_start", "value": state.val};
                    if (arr_id[4] == "call"&& state.val) com_date = {"send": "call", "number": state.val};
                    if (arr_id[4] == "clipboard") com_date = {"send": "clipboard", "text": state.val};
                    if (arr_id[4] == "dial"&& state.val) com_date = {"send": "dial", "number": state.val};
                    if (arr_id[4] == "brightness"&& state.val) com_date = {"send": "brightness", "number": state.val};
                }

                if(com_date){

                    getdata(name,ip,port,"/set.xhtml",{"send":"lcd_on"},function (response, ip){
                        adapter.log.info("command: "+com_date+" "+ip+" "+response);
                    });

                    getdata(name,ip,port,"/set.xhtml",com_date,function (response, ip){
                        adapter.log.info("command: "+com_date+" "+ip+" "+response);
                    });

                }


            }
        }
    }
});

var command = ["alertinput","volume","openurl","vibrate","alert","noti","rec","brightness","app_start","dial","send_sms","call","clipboard"];


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
        setTimeout(say_bufer, num*700+str*70+1000,name);  //подсчет времени для отправки следующего запроса на ttl
        bufer[name].text.shift();
    }else{
        bufer[name].start = true;
    }

}



var res=[];
var x=0;
// Some message was sent to adapter instance over message box. Used by email, pushover, text2speech, ...
adapter.on('message', function (obj) {
    if (typeof obj !== null && obj !== undefined) {
        if (typeof obj == 'object' && obj.message) {
            if (obj.command) {
                var text = obj.command.replace(/\s+/g, ''); //убрать пробелы
                var arr = text.split(','); //разбить на массив
                if (obj.message) {
                    var x = 0;
                    res = [];
                    for (var i = 0; i < adapter.config.devices.length; i++) {
                        var name = adapter.config.devices[i].name;
                        var ip = adapter.config.devices[i].ip;
                        var port = adapter.config.devices[i].port;
                        if (name != '' && ip != '' && port != '') {
                            if (arr == 'all' || find(arr, name) || find(arr, ip)) { //поиск по имени и ip

                                //adapter.log.info("obj.message.html = " + obj.message.html);
                                var set_html = "";
                                if (obj.message.html === undefined || obj.message.html === "set") {
                                    set_html = "/set.xhtml";
                                } else if (obj.message.html === "call") {
                                    set_html = "/call.xhtml";
                                } else if (obj.message.html === "sms") {
                                    set_html = "/sms.xhtml";
                                }

                                getdata(name, ip, port, set_html, obj.message, function (response, ip) {
                                    adapter.log.info(response);
                                    try {
                                        response = JSON.parse(response);
                                        response.ip = ip;
                                    } catch (exception) {
                                        response = 'JSON.parse(response): error ';
                                    }
                                    res[x] = response;
                                    x = x + 1;
                                    if (obj.callback) {
                                        setTimeout(function () {
                                            adapter.sendTo(obj.from, obj.command, res, obj.callback);
                                            //res=[];
                                        }, 2000);
                                    }
                                });

                            }
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

var existingStates = {};
function setValue (id, name, val ) {
    if (existingStates[id]) {
        adapter.setState(id, {val: val, ack: true});
    }
    else {
        adapter.getState(id , function (err, obj) {
            //adapter.log.info(id + '.' + ' obj: ' + obj);
            if (obj === null) {
                adapter.setObjectNotExists(id, {
                    type: 'state',
                    common: {
                        name: name,
                        type: 'mixed',
                        role: 'indicator',
                        read: "true",
                        write: "false"
                    },
                    native: {}
                });
                existingStates[id] = true;
                setValue (id, name, val );
            } else {
                existingStates[id] = true;
                setValue (id, name, val );
            }
        });
    }
}


function setdata (setid, response ) {
    var val;
    for (var key in response) {
        val = response[key];
        setValue (setid + '.' + key, key, val );
    }
}



function set_id (setid, name, val ) {
    adapter.setObjectNotExists(setid+'.'+name, {
        type: 'state',
        common: {
            name: name,
            type: 'mixed',
            role: '',
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
                delete data.sensors.info;
                setdata (name+'.info.sensors', data.sensors );
            }
            if(data.wifi) setdata (name+'.info.wifi', data.wifi );
            if(data.battery) setdata (name+'.info.battery', data.battery );
            if(data.cpu) setdata (name+'.info.cpu', data.cpu );
            if(data.audio_volume.info) setdata (name+'.info.audio_volume.info', data.audio_volume.info );
            if(data.audio_volume) {
                delete data.audio_volume.info;
                setdata (name+'.info.audio_volume', data.audio_volume );
            }
            if(data.memory) setdata (name+'.info.memory', data.memory );
            if(data.info) setdata (name+'.info.info', data.info );
            if(typeof data.gps ==='object') setdata (name+'.info.gps', data.gps );
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

    req.on('error', function( e ) {

        adapter.log.warn(`Device is not responding : ${e.message}`);

        if(path=='/get.xhtml'){

            //find(ignorelist, ip)
            if(!find(ignorelist, ip)){
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
        if (array[i] == value) return value;
    }
    return false;
}

var  upload_file = "sms.xhtml,call.xhtml,set.xhtml,get.xhtml,infosetting.xhtml,info.xhtml"; //файлы которые нужно загрузить с папки 'www' на устройства

function init(){

    adapter.log.info('adapter: '+adapter.namespace);


    for (var i = 0; i < adapter.config.devices.length; i++) {
        var name = adapter.config.devices[i].name;
        var ip = adapter.config.devices[i].ip;
        var port = adapter.config.devices[i].port;

        if(name!=''){
            getdata(name, ip, port, '/settings.xhtml', {  //запись настроек (ip,port,device,namespace )в устройство
                server:adapter.config.server,
                device:name,
                namespace:adapter.namespace,
                port:adapter.config.port}, function (response,ip){
                adapter.log.info('settings.xhtml: '+response+ip);
            });

            getdata(name, ip, port, '/settings.xhtml', {  //загрузка файлов на уст.
                server:adapter.config.server,
                file:upload_file,
                port:adapter.config.port }, function (response,ip){
                adapter.log.info('settings.xhtml: '+response+ip);
            });

            set_id (name+'.tts','response','text'  );

            set_id (name+'.request','alertinput',''  );
            set_id (name+'.request','speech',''  );
            set_id (name+'.request','scan',''  );
            set_id (name+'.request.call','type',''  );
            set_id (name+'.request.call','status',''  );
            set_id (name+'.request.call','number',''  );
            set_id (name+'.request.sms','body',''  );
            set_id (name+'.request.sms','number',''  );

            set_id (name+'.command','command','[speech] or [lcd_on]'  );
            set_id (name+'.command','send_sms','[number],[text]'  );
            set_id (name+'.command','call','[number]'  );
            set_id (name+'.command','app_start','[lcf.clock]'  );
            set_id (name+'.command','vibrate','[time(ms)]'  );
            set_id (name+'.command','rec','[time(ms)]'  );
            set_id (name+'.command','alert','[Внимание!],[Нет связи!!!]' );
            set_id (name+'.command','openurl','[http://ya.ru]'  );
            set_id (name+'.command','clipboard','[Ab123]'  );
            set_id (name+'.command','volume','[0-max]'  );
            set_id (name+'.command','alertinput','[Внимание!],[введите команду]'  );
            set_id (name+'.command','dial','[number]'  );
            set_id (name+'.command','noti','[название увед.],[техт]' );
            set_id (name+'.command','brightness','[1-255]' );

            adapter.subscribeStates(name+'.command.*');
            adapter.subscribeStates(name+'.tts.response');

        }
    }


    set_id ('all_device','brightness',""  );
    set_id ('all_device','tts_response',"text"  );

    adapter.subscribeStates('all_device.*');

}

function time_paw() {
    //adapter.log.info('start: ');

    for (var i = 0; i < adapter.config.devices.length; i++) {
        var name = adapter.config.devices[i].name;
        var ip = adapter.config.devices[i].ip;
        var port = adapter.config.devices[i].port;

        if(name!=''&&ip!=''&&port!=''){

            if(!find(ignorelist, ip)){
                getdata(name,ip,port,'/get.xhtml','');
            }
        }
    }
}

function time_reset_ignore(){

    //adapter.log.warn('ignorelist reset:');
    ignorelist = [];
    for (var i = 0; i < adapter.config.devices.length; i++) {
        var ip = adapter.config.devices[i].ip;
        var ign = adapter.config.devices[i].ign;

        if(ign===true||ign==="true"){

            adapter.log.info('ignorelist:'+ip);
            ignorelist[ignorelist.length] = ip;

        }
    }
}


function restApi(req, res) {
    if (req.method == 'POST') {
        var body = '';
        req.on('data', function (data) {
            body += data;
        });
        req.on('end', function () {
            body = decodeURI(body);
            body = querystring.parse(body);
            adapter.log.info("POST "+JSON.stringify(body));
            //adapter.log.info(body.namespace+'.'+body.device+'.request.'+body.send);
            //adapter.log.info(adapter.namespace+' '+body.namespace);
            if (body.send=="alertinput"||body.send=="scan"||body.send=="speech"){
                adapter.setForeignState(body.namespace+'.'+body.device+'.request.'+body.send, body.res,true );
            }else if (body.send=="call"){
                adapter.setForeignState(body.namespace+'.'+body.device+'.request.'+body.send+".type", body.type,true );
                adapter.setForeignState(body.namespace+'.'+body.device+'.request.'+body.send+".number", body.number,true );
                adapter.setForeignState(body.namespace+'.'+body.device+'.request.'+body.send+".status", body.status,true );
            }else if (body.send=="sms"){
                adapter.setForeignState(body.namespace+'.'+body.device+'.request.'+body.send+".body", body.smsbody,true );
                adapter.setForeignState(body.namespace+'.'+body.device+'.request.'+body.send+".number", body.number,true );
            }else if (body.send=="proximity"){
                adapter.setForeignState(body.namespace+'.'+body.device+'.info.sensors.'+body.send, body.light,true );
            }else if (body.send=="accelerometer"){
                if(body.x){
                    adapter.setForeignState(body.namespace+'.'+body.device+'.info.sensors.'+body.send+"_x", body.x,true );
                }
                if(body.y){
                    adapter.setForeignState(body.namespace+'.'+body.device+'.info.sensors.'+body.send+"_y", body.y,true );
                }
                if(body.z){
                    adapter.setForeignState(body.namespace+'.'+body.device+'.info.sensors.'+body.send+"_z", body.z,true );
                }
            }



        });
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('post received');
    } else {
        var srvUrl = url.parse(decodeURI(req.url));
        adapter.log.info(req.url);
        //adapter.log.info(srvUrl.pathname);
        if(srvUrl.pathname == "/")srvUrl.pathname="/index.html";
        //adapter.log.info(srvUrl.pathname);
        if (fs.existsSync(__dirname +'/www' + srvUrl.pathname)) {
            var html = fs.readFileSync(__dirname +'/www' + srvUrl.pathname);
        } else {
            if (srvUrl.pathname == "/favicon.ico") {
                res.end();
            } else {
                var html = '<html><body>404 Not Found</body>';
            }
        }
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(html);
    }


}




function main() {

    if (!adapter.config.devices.length || !adapter.config.interval||!adapter.config.server||!adapter.config.port) {
        adapter.log.warn('Enter the data ip, port, interval and devices');
        return;
    }

    var ipformat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    if(!adapter.config.server.match(ipformat)) {
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

    if (adapter.config.interval < 5000) adapter.config.interval = 5000;
    setInterval(time_paw, Number(adapter.config.interval));  // интервал обновления данных от уст.
    setInterval(time_reset_ignore, 3600000);

    adapter.log.info('devices: ' + JSON.stringify(adapter.config.devices));
    adapter.log.info('interval: ' + adapter.config.interval);
    adapter.log.info('server: ' + adapter.config.server);
    adapter.log.info('port: ' + adapter.config.port);

    time_reset_ignore();
    init();

    function search_adapter(name,sub) {
        adapter.objects.getObjectView('system', 'instance',
            {startkey: 'system.adapter.'+name+'.', endkey: 'system.adapter.'+name+'.\u9999'},
            function (err, doc) {
                if (doc && doc.rows) {
                    for (var i = 0; i < doc.rows.length; i++) {
                        var id = doc.rows[i].id;
                        var obj = doc.rows[i].value;
                        var arr_sub = id.split('.');
                        adapter.log.info('subscribe: ' + arr_sub[2] + '.' + arr_sub[3] + sub);
                        adapter.subscribeForeignStates(arr_sub[2] + '.' + arr_sub[3] + sub);
                        subscribe[subscribe.length] = arr_sub[2] + '.' + arr_sub[3] + sub;
                    }
                    if (!doc.rows.length) adapter.log.info(name+': No objects found.');
                } else {
                    adapter.log.info(name+': No objects found: ' + err);
                }
            });

    }

    // поиск драйвера и подписка на него.
    if(adapter.config.text2command) search_adapter("text2command",".response");
    if(adapter.config.apiai) search_adapter("apiai",".respons.speech");
    if(adapter.config.hilink)search_adapter("hilink",".last_sms.Content");


}
