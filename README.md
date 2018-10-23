![Logo](admin/paw_big.png)
# ioBroker.paw
=================

[![NPM version](http://img.shields.io/npm/v/iobroker.paw.svg)](https://www.npmjs.com/package/iobroker.paw)
[![Downloads](https://img.shields.io/npm/dm/iobroker.paw.svg)](https://www.npmjs.com/package/iobroker.paw)

[![NPM](https://nodei.co/npm/iobroker.paw.png?downloads=true)](https://nodei.co/npm/iobroker.paw/)

[Русский](https://github.com/bondrogeen/iobroker.paw/blob/master/docs/ru/paw.md)

[Deutsch](https://github.com/bondrogeen/iobroker.paw/blob/master/docs/de/paw.md)

## Description
It is an adapter to control Android devices. 
It can speak texts, control volume, send SMS, make calls, vibrate, and much more ...

Tasker and Locale Plug-in support.
PHP plug-in is available too for PAW app.

## Install the program and configure the adapter.
 
Download and install the application PAW Android.

https://play.google.com/store/apps/details?id=de.fun2code.android.pawserver 



***paw.0.[name_device].tts.response*** (one device)   

or 
  
***paw.0.all_device.tts_response*** (all device)   


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
   


## Commands for javascript

```javascript


// [dev1] - is the name of the device, you can also enter IP devices.
// You can specify multiple devices separated by commas 'dev1, dev3, 192.168.1.71'
// all - send to all devices.


// send the text to the speech synthesizer.
sendTo("paw.0",'dev1,dev3',{tts:  'Hello World'});

// with callback
sendTo("paw.0",'all',{
    tts:  'Hello World'},function (response){
    log(JSON.stringify(response));
});

// set the screen backlight time in seconds. '0' - do not quit the screen (does not work on all devices) 
sendTo("paw.0",'dev1',{timeOff: '60'});

// activate the screen on the device.
sendTo("paw.0",'all',{turnOnOff:'true'});

// backlight brightness level from 4-100
sendTo("paw.0",'dev1',{brightness: '50'});

// execute shell command (need root)
// "input tap x y" emulates a click on the screen x - coordinates along the mountains. Y - vertical coordinates.
// "poweroff -f" turn off devices
// "reboot" reboot device
sendTo("paw.0",'all',{exec:'input tap 100 100'});

// Exit to home screen. Emulate pressing the HOME button.
sendTo("paw.0",'all',{home:'true'});

// disable battery tracking, translates 0% (need root)
sendTo("paw.0",'dev1',{send:'battery_off'});

// run the application. You can enter a title name 'ru.codedevice.iobrokerpawii' or package name 'ioBroker.PAW II'
sendTo("paw.0",'all',{startApp:'lcf.clock'});

// get the list of installed applications.
sendTo("paw.0",'dev1',{
    apps:  'installed'  // or apps: 'all'  - get all applications
},function (response){
    log(JSON.stringify(response));
});

// Get the task list from the Tasker application "tasks": [auto, bubble, call, clock]
sendTo("paw.0",'dev1',{
    send:  'tasker'
},function (response){
    log(JSON.stringify(response));
});

// Run the task from the Tasker application.
// [text] = name task
// [value] (Optional) = parameter will be passed to the variable %par1 
// You can pass multiple values ​​separating ",,"
// eg  value: ' test1 ,, test2 ,, test[n] ' will be transferred  %par1, %par2 %par[n]  etc.
sendTo("paw.0",'dev2',{
    send:  'task',
    text:'test',
    value:'value_test'
},function (response){
    log(JSON.stringify(response[0]));
});

//Error status:
//NotInstalled: no Tasker package could be found on the device
//NoPermission: calling app does not have the needed Android permission (see above)
//NotEnabled: Tasker is disabled by the user.
//AccessBlocked: external access is blocked in the user preferences. You can show the user the relevant preference with e.g. startActivity( TaskerIntent.getExternalAccessPrefsIntent() )
//NoReceiver: nothing is listening for TaskerIntents. Probably a Tasker bug.

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
sendTo("paw.0",'dev1',{volume: 5});

// call to number
sendTo("paw.0",'192.168.1.71',{call: '0611'});

// play default sound notifications
sendTo("paw.0",'all',{play: true});

// call the number or send ussd command.
sendTo("paw.0",'dev1',{call: '*100#'});

// enables vibration, [number] (time in milliseconds)
sendTo("paw.0",'dev1',{vibrate: '1000'});

// send notifications to devices
sendTo("paw.0",'all',{
    noti:  'Any text', // text notifications
    title: 'Title',    //optional (default: Title)
    info: 'Any text',  //optional (default: '')
    vibrate:false,     //optional (default: false)
    sound:false,       //optional (default: false)
    light:true,        //optional (default: false)
    id:2               //optional (default, id++)
},function(res){
     log(JSON.stringify(res));
});

// send alert dialog to devices.
sendTo("paw.0",'all',{
    alert:  'Any text', // text notifications
    id:'alert1',        // id alert, need to respone. respone = {"id":"alert1","state":"Maybe"}
    title: 'Title',     //optional (default: Title)
    positive: 'Yes',    //optional (default: '')
    neutral: 'Maybe',   //optional (default: '')
    negative: 'No' ,    //optional (default: '')
    sound:true          //optional (default: false)
},function(res){
     log(JSON.stringify(res));
});

// open the browser at the specified address
sendTo("paw.0",'dev1',{link: 'http://iobroker.net'});

// end call
sendTo("paw.0",'dev1',{callEnd: 'true'});

// restart server paw 
sendTo("paw.0",'dev1',{reboot: 'restart'});

```


#### 0.2.0
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
