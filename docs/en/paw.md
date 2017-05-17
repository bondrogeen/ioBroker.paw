![Logo](admin/paw_big.png)
# ioBroker.paw
=================

[![NPM version](http://img.shields.io/npm/v/iobroker.paw.svg)](https://www.npmjs.com/package/iobroker.paw)
[![Downloads](https://img.shields.io/npm/dm/iobroker.paw.svg)](https://www.npmjs.com/package/iobroker.paw)

[![NPM](https://nodei.co/npm/iobroker.paw.png?downloads=true)](https://nodei.co/npm/iobroker.paw/)

[Русский](https://github.com/bondrogeen/iobroker.paw/blob/master/docs/ru/paw.md)

[Deutsch](https://github.com/bondrogeen/iobroker.paw/blob/master/docs/de/paw.md)

## Description
It is an adapter to control Android phones via PAW Application. 
It can speak texts, control volume, send SMS, make calls, vibrate, and much more ...

Tasker and Locale Plug-in support.
PHP plug-in is available too for PAW app.

## Install the program and configure the adapter.
 
Download and install the application PAW Server for Android.

https://play.google.com/store/apps/details?id=de.fun2code.android.pawserver 

Open the PAW Server for Android app on your device

after initialization, you need to transfer it to the ..paw / html folder.

files:

+ settings.xhtml
+ call.xhtml 
+ get.xhtml
+ set.xhtml
+ sms.xhtml


It's enough to download and transfer only the file "settings.xhtml" the other files are downloaded using the adapter

and with future adapter updates, will be updated themselves.

files to take here https://github.com/bondrogeen/iobroker.paw/tree/master/www

Launch PAW Server for Android.

Install the driver iobroke.paw with GitHub.

https://github.com/bondrogeen/iobroker.paw

![pic](admin/1.jpg)


To control via vis, you can control the device [name_device] by changing the variable

***paw.0.[name_device].command.command*** 

+ lcd_on
> activate the screen
+ home
> emulate pressing the HOME button
+ endсall     
> end call 
+ scan        
> launch the barcode scanner application.
+ speech
> voice activation
+ restart
> reboot server paw
+ kill
> disable paw server
+ gong
> plays the file ..paw/html/gong.mp3 
+ sound_noti
> loses the standard notification sound
+ sound_ring
> loses the standard ring tone


It's the same for the other variables, but only some commands
require a second parameter, which is entered through a comma.

***paw.0.[name_device].command.alert***
> Example: Warning, No connection !!!
> Warnings

***paw.0.[name_device].command.alertinput*** 
> Example: Attention! , Enter the command	    
> Warnings with the request, the answer is saved in the variable paw.*.[name_device].request.alertinput

***paw.0.[name_device].command.send_sms***
> Example: 123456789, Test message	  
> Send an SMS message to the number [number], with the text [text]  
	
***paw.0.[name_device].command.noti***
> Example: Attention, No response from the device.	  
> Notification [name of notification], [notification text] 

***paw.0.[name_device].command.app_start***			
> Example: lcf.clock	   
> Launch the application  

***paw.0.[name_device].command.call***
> Example: 123456789   
> Call the number [number]  

***paw.0.[name_device].command.clipboard***
> Example: Ab123
> Save text to the clipboard  

***paw.0.[name_device].command.dial***	
> Example: 123456789
> Dial the number on the device.

***paw.0.[name_device].command.brightness***
> Example: 255
> Backlight brightness level from 1-255
	
***paw.0.[name_device].command.openurl***
> Example: http://google.com
> Open url in browser

***paw.0.[name_device].command.rec***
> Example: 1000
> Enable recording with the duration [time (ms)]

***paw.0.[name_device].command.vibrate***
> Example: 500
> Enable vibration, time in milliseconds [time (ms)]  

***paw.0.[name_device].command.volume*** 
> Example: 7
> Set the volume on the device from 0 to the maximum value,
> The maximum value can be found here (usually 15)
> > paw.*.[name_device].info.audio_volume.info.music_max   
   



![pic](admin/2.jpg)



## Commands for javascript



```javascript
/*
[dev1] - is the name of the device, you can also enter IP devices.
You can specify multiple devices separated by commas 'dev1, dev3, 192.168.1.71'
all - send to all devices.
*/

// send the text to the speech synthesizer.
sendTo("paw.0",'dev1,dev3',{send:  'say', text:  'test text'});

// with callback
sendTo("paw.0",'all',{
    send:  'say', 
    text:  'Check text'},function (response){
    log(JSON.stringify(response));
});

// set the screen backlight time in milliseconds. '-1' - do not quit the screen (does not work on all devices) 
sendTo("paw.0",'dev1',{send:'screen_off_time',number: '5000'});

// activate the screen on the device.
sendTo("paw.0",'all',{send:'lcd_on'});

// backlight brightness level from 1-255
sendTo("paw.0",'dev1',{send:'brightness',number: '50'});

// execute shell command (need root)
// "input tap x y" emulates a click on the screen x - coordinates along the mountains. Y - vertical coordinates.
// "poweroff -f" turn off devices
// "reboot" reboot device
sendTo("paw.0",'all',{send:'exec',text:'input tap 100 100'});

// emulate pressing the HOME button
sendTo("paw.0",'all',{send:'home'});

// run the application, for example - Tablet Clock indicates "system name"
sendTo("paw.0",'all',{send:'app_start',value:'lcf.clock'});

sendTo("paw.0",'dev1',{
    send:'app_start',
    value:'lcf.clock'
},function (response){
    log(JSON.stringify(response));
});

// get the list of installed applications "name": "system name"
sendTo("paw.0",'dev1',{
    send:  'apps'
},function (response){
    log(JSON.stringify(response));
});

// Get the task list from the Tasker application "tasks": [auto, bubble, call, clock]
sendTo("paw.0",'dev1',{
    send:  'tasker'
},function (response){
    log(JSON.stringify(response));
});

// disable battery tracking, translates 0% (need root)
sendTo("paw.0",'dev1',{send:'battery_off'});

// Run the task from the Tasker application. (need root)
sendTo("paw.0",'dev1',{send:'task',text:'auto'});

// send message.
sendTo("paw.0",'dev1',{send:  'sms', text:  'Any text', number: '8123456789'});

sendTo("paw.0",'192.168.1.71',{
    send:  'sms', 
    text:  'Any text',
    number: '8123456789'
},function (response){
    log(JSON.stringify(response));
});

/*
setting the volume from 0 to 15, the maximum volume is set by the system,
also checked to ensure that it does not exceed the set values)
mode = can be(STREAM_NOTIFICATION, STREAM_MUSIC ,STREAM_ALARM, 
STREAM_RING, STREAM_SYSTEM, STREAM_VOICE_CALL)  
If not specified, the default is  STREAM_MUSIC
*/

sendTo("paw.0",'dev1',{send:  'volume', number: '5'});

// with callback
sendTo("paw.0",'192.168.1.71',{
    send:  'volume', 
    number: '10',
    mode: 'STREAM_NOTIFICATION'
},function (response){
    log(JSON.stringify(response));
});

// call to number
sendTo("paw.0",'dev1',{send:  'call', number: '0611'});

// with  callback
sendTo("paw.0",'192.168.1.71',{
    send:  'call', 
    number: '0611'
},function (response){
    log(JSON.stringify(response));
});

// call the number or send ussd command.
sendTo("paw.0",'dev1',{send:  'call', number: '*100#'});

// callback
sendTo("paw.0",'192.168.1.71',{
    send:  'call', 
    number: '0611'
},function (response){
    log(JSON.stringify(response));
});

// enables vibration, [number] (time in milliseconds)
sendTo("paw.0",'dev1',{send:  'vibrate', number: '1000'});

sendTo("paw.0",'192.168.1.71',{
    send:  'vibrate', 
    number: '100'
},function (response){
    log(JSON.stringify(response));
});

// send notifications to devices
sendTo("paw.0",'dev1',{send:  'noti', texthead: 'Attention',text: 'Any text'});

// with callback
sendTo("paw.0",'192.168.1.71',{
    send:  'noti',
    texthead: 'Attention',
    text: 'Any text'
},function (response){
    log(JSON.stringify(response));
});

// send warning to devices.
sendTo("paw.0",'dev1',{send:  'alert', texthead: 'Attention',text: 'Any text'});


sendTo("paw.0",'192.168.1.71',{
    send:  'alert',
    texthead: 'Attention',
    text: 'Any text'
},function (response){
    log(JSON.stringify(response));
});


// open the browser at the specified address
sendTo("paw.0",'dev1',{send:  'openurl', text: 'http://iobroker.net'});


sendTo("paw.0",'192.168.1.71',{
    send:  'openurl',
    text: 'http://ya.ru'
},function (response){
    log(JSON.stringify(response));
});

// end call
sendTo("paw.0",'dev1',{send:  'endсall'});

// send text to the clipboard  
sendTo("paw.0",'dev1',{send:  'clipboard',text:'test or number'});


// restart server paw 
sendTo("paw.0",'dev1',{send:  'server',text:'restart'});

// stop paw the server
sendTo("paw.0",'dev1',{send:  'server',text:'kill'});

// get call log
// [send] Required.
// "now" for today
// "all" all calls,
// "incoming" incoming calls
// "missed" missed calls
// "outgoing" outgoing calls
// "info" only information about the number of calls
// [date] is not a required parameter.
// you can get only for the specified date the request format "01-05-2017"
// You can also just go to the address http://IP:8080/call.xhtml to get the list as a html page
sendTo("paw.0",'dev1',{
    html:'call',
    send:  'incoming',
    date:'01-05-2017'
},function (response){
    log(JSON.stringify(response[0]));
});



```



### 0.0.6 (2017-05-01)

* (bondrogeen) Added call logging

#### 0.0.5
* (bondrogeen) initial release

## License
The MIT License (MIT)

Copyright (c) 2017 bondrogeen <bondrogeen@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
