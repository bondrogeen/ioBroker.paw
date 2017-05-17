![Logo](https://raw.githubusercontent.com/bondrogeen/iobroker.paw/master/admin/paw_big.png)
# ioBroker.paw
=================

[![NPM version](http://img.shields.io/npm/v/iobroker.paw.svg)](https://www.npmjs.com/package/iobroker.paw)
[![Downloads](https://img.shields.io/npm/dm/iobroker.paw.svg)](https://www.npmjs.com/package/iobroker.paw)

[![NPM](https://nodei.co/npm/iobroker.paw.png?downloads=true)](https://nodei.co/npm/iobroker.paw/)

## Beschreibung
Es ist ein Adapter, um Android-Handys über PAW-Anwendung zu steuern.
Es kann Texte sprechen, Lautstärke kontrollieren, SMS senden, Anrufe tätigen, vibrieren und vieles mehr ...

## Die Installation und Einstellungen.
 
Herunterladen und Ausführen PAW Server für Android.

https://play.google.com/store/apps/details?id=de.fun2code.android.pawserver 

Öffnen Sie die Anwendung PAW Server auf ihrem Android Gerät
   
Starten PAW Server und wieder stoppen.  Sie müssen nach ..paw/html ordner
   
folgende Dateien verschieben:


+ call.xhtml 
+ get.xhtml
+ set.xhtml
+ sms.xhtml
+ settings.xhtml

Eigentlich sollte nur "settings.xhtml" reichen, da die andere    
 
Dateien werden automatisch Heruntergeladen und in der    
  
Zukunft werden selbst aktualisiert.   

Dateien gibst Hier: https://github.com/bondrogeen/iobroker.paw/tree/master/www

Starten wir PAW Server für Android erneut.

Installieren Sie den Adapter iobroke.paw vom GitHub.

https://github.com/bondrogeen/iobroker.paw

![pic](https://raw.githubusercontent.com/bondrogeen/iobroker.paw/master/docs/de/img/1.jpg)


Zur Steuerung über vis, kann Das Gerät [name_device] über varianle gesteuert werden.

***paw.0.[name_device].command.command*** 

+ lcd_on
> aktiviren Bildschirm
+ home
> emulieren die HOME-Taste
+ endсall     
> Enden Verbindung (Auflegen)
+ scan        
> ausführen ein Barcode-Scanner Anwendung.
+ speech
> Sprachaktivierung
+ restart
> paw server neustarten 
+ kill
> paw server stoppen 
+ gong
> Wiedergabe vom mp3 Datei ..paw/html/gong.mp3 
+ sound_noti
> Wiedergabe vom Standard Notifizierungston
+ sound_ring
> Wiedergabe vom Standart-Klingelton


Varieablen die Brauchen einen zweiten Parametr, 

die durch Komma getrennt eingegeben werden.
   

***paw.0.[name_device].command.alert***
> Beispeil: Achtung, keine Verbindung!!!
> Warnugen

***paw.0.[name_device].command.alertinput*** 
> Beispiel: Achtung! , Befehl Eingabe
> Warnung mit Anforderung, antwort wird in der variable gespeichert paw.*.[name_device].request.alertinput

***paw.0.[name_device].command.send_sms***
> Beispiel: 123456789 , Überprüfen
> Senden eiene SMS an die Nummer [number] , mit dem Text [text]
	
***paw.0.[name_device].command.noti***
> Beispiel: Achtung, keine Antwort vom Gerät.
> Mitteilung [Name der Mitteilung] , [text Nachricht]

***paw.0.[name_device].command.app_start***			
> Beispiel: lcf.clock
> Ausführen ein Anwendung

***paw.0.[name_device].command.call***
> Beispiel: 123456789
> Wehlen  [number]

***paw.0.[name_device].command.clipboard***
> Beispiel:Ab123
> Text wird in die Zwieschenablage gespeichert   

***paw.0.[name_device].command.dial***	
> Beispiel: 123456789
> Anrufen Nummer [number].

***paw.0.[name_device].command.brightness***
> Beispiel: 255     
> Helligkeitspegel von 1 bis 255 
	
***paw.0.[name_device].command.openurl***
> Beispiel: http://google.de
> URL öffnen im Browser 

***paw.0.[name_device].command.rec***
Beispiel: 1000
> Starten eine Aufnahme, dauer [time(ms)]  

***paw.0.[name_device].command.vibrate***
> Beispiel: 500
> Aktivieren Vibrationszeit in Millisekunden [time(ms)] 

***paw.0.[name_device].command.volume*** 
> Beispiel: 7
> Lautstärkeeinstellung auf der Gerät vom 0 bis auf einen Maximalwert,
> Maximalwert kann hier ermittelt werden (in der Regel 15)   
> paw.*.[name_device].info.audio_volume.info.music_max    




## Команды для javascript



```javascript
/*
dev1 - Name des Geräts, oder die IP vom Gerät eingeben.
Sie können durch Komma getrennt werde um mehrere Geräte spezifizieren " dev1, dev3, 192.168.1.71 "
all - an alle Geräte gesendet.
*/

// Sende eine SMS an Sprachsynthesizer.
sendTo("paw.0",'dev1,dev3',{send:  'say', text:  'testtext'});

// ein Rückruf
sendTo("paw.0",'all',{
    send:  'say', 
    text:  'testtext'},function (response){
    log(JSON.stringify(response));
});

//Einstellen der Hintergrundbeleuchtung Zeit millisekunden. ‚-1‘ - löschen nicht auf den Bildschirm (nicht auf allen Geräten funktionieren)
sendTo("paw.0",'dev1',{send:'screen_off_time',number: '5000'});

// aktivieren vom Bildschirm auf dem Gerät.
sendTo("paw.0",'all',{send:'lcd_on'});

//Helligkeitspegel von 1 bis 255 
sendTo("paw.0",'dev1',{send:'brightness',number: '50'});

// Shell-Befehl auszuführen (erfordert root)
// „Eingangsabgriff x y“ emuliert den Bildschirm gedrückt x - Koordinaten des Horizontal. y - Koordinate Vertikal.
// „poweroff -f“ das Gerät ausschalten
// "reboot" neu zu starten
sendTo("paw.0",'all',{send:'exec',text:'input tap 100 100'});

// emulieren die HOME-Taste drücken
sendTo("paw.0",'all',{send:'home'});

// die Anwendung ausführen, zum Beispiel - Tablet Clock zeigt „Systemname“
sendTo("paw.0",'all',{send:'app_start',value:'lcf.clock'});

sendTo("paw.0",'dev1',{
    send:'app_start',
    value:'lcf.clock'
},function (response){
    log(JSON.stringify(response));
});

// die Liste der installierten Anwendungen Get „name“: „Systemname“
sendTo("paw.0",'dev1',{
    send:  'apps'
},function (response){
    log(JSON.stringify(response));
});

// Holen Sie sich die Aufgabenliste aus der Tasker-Anwendung "tasks": [auto, bubble, call, clock]
sendTo("paw.0",'dev1',{
    send:  'tasker'
},function (response){
    log(JSON.stringify(response));
});

// Führen Sie die Aufgabe aus der Tasker-Anwendung aus. (need root)
sendTo("paw.0",'dev1',{send:'task',text:'auto'});

// SMS senden.
sendTo("paw.0",'dev1',{send:  'sms', text:  'testtext', number: '8123456789'});

sendTo("paw.0",'192.168.1.71',{
    send:  'sms', 
    text:  'проверка',
    number: '8123456789'
},function (response){
    log(JSON.stringify(response));
});

// disable Batterieüberwachung, 0% Transfer (erfordert root)
sendTo("paw.0",'dev1',{send:'battery_off'});

/*
Einstellen der Lautstärke von 0 bis 15, wird das maximale Volumen durch das System festgelegt,
auch geprüft, die nicht über angegebenen Werten geht)
mode = kann (STREAM_NOTIFICATION, STREAM_MUSIC, STREAM_ALARM,
STREAM_RING, STREAM_SYSTEM, STREAM_VOICE_CALL)
Wenn nicht anders angegeben, ist der Standard STREAM_MUSIC
*/

sendTo("paw.0",'dev1',{send:  'volume', number: '5'});

// с callback
sendTo("paw.0",'192.168.1.71',{
    send:  'volume', 
    number: '10',
    mode: 'STREAM_NOTIFICATION'
},function (response){
    log(JSON.stringify(response));
});

// Wehlen
sendTo("paw.0",'dev1',{send:  'call', number: '0611'});

// с callback
sendTo("paw.0",'192.168.1.71',{
    send:  'call', 
    number: '0611'
},function (response){
    log(JSON.stringify(response));
});

// rufen Sie eine Nummer oder ausführen ussd Befehl.
sendTo("paw.0",'dev1',{send:  'call', number: '*100#'});

// с callback
sendTo("paw.0",'192.168.1.71',{
    send:  'call', 
    number: '0611'
},function (response){
    log(JSON.stringify(response));
});

// Aktiviert die Vibrationszeit (Zeit in Millisekunden)
sendTo("paw.0",'dev1',{send:  'vibrate', number: '1000'});

sendTo("paw.0",'192.168.1.71',{
    send:  'vibrate', 
    number: '100'
},function (response){
    log(JSON.stringify(response));
});

// Benachrichtigung auf dem Gerät senden
sendTo("paw.0",'dev1',{send:  'noti', texthead: 'Achtung',text: 'testtext'});

// с callback
sendTo("paw.0",'192.168.1.71',{
    send:  'noti',
    texthead: 'Achtung',
    text: 'testtext'
},function (response){
    log(JSON.stringify(response));
});

// eine Warnung an das Gerät senden
sendTo("paw.0",'dev1',{send:  'alert', texthead: 'Achtung',text: 'testtext'});


sendTo("paw.0",'192.168.1.71',{
    send:  'alert',
    texthead: 'Achtung',
    text: 'testtext'
},function (response){
    log(JSON.stringify(response));
});


// Browser öffnen an die angegebene Adresse
sendTo("paw.0",'dev1',{send:  'openurl', text: 'http://192.168.1.61:8082'});


sendTo("paw.0",'192.168.1.71',{
    send:  'openurl',
    text: 'http://ya.ru'
},function (response){
    log(JSON.stringify(response));
});

// Anruf beenden (auflegen)
sendTo("paw.0",'dev1',{send:  'endсall'});

// Text in die Zwischenablage senden
sendTo("paw.0",'dev1',{send:  'clipboard',text:'текст'});


// PAW Server neu starten
sendTo("paw.0",'dev1',{send:  'server',text:'restart'});

// PAW Server stoppen
sendTo("paw.0",'dev1',{send:  'server',text:'kill'});

// erhalten das Anrufprotokoll 
// [send]  einen erforderlichen Parameter.
// "now" für heute
// "all" werden alle Anrufe
// "incoming" eingehende Anrufe
// "missed" verpasste Anrufe
// "outgoing" abgehende Gespräche
// "info" nur über die Anzahl der Anrufe
// [Date] - ein optionaler Parameter.
// kann nur das Anforderungsformat nach diesem Datum wird 01-05-2017
// Sie können auch auf die Adresse gehen Sie einfach http://IP:8080/call.xhtml für eine Liste als HTML-Seiten
sendTo("paw.0",'dev1',{
    html:'call',
    send:  'incoming',
    date:'01-05-2017'
},function (response){
    log(JSON.stringify(response[0]));
});



```



### 0.0.6 (2017-05-01)

* (bondrogeen) wobei ein Anrufprotokoll empfängt

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
