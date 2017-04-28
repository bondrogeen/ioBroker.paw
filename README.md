![Logo](admin/paw_big.png)
# ioBroker.paw
=================

[![NPM version](http://img.shields.io/npm/v/iobroker.paw.svg)](https://www.npmjs.com/package/iobroker.paw)
[![Downloads](https://img.shields.io/npm/dm/iobroker.paw.svg)](https://www.npmjs.com/package/iobroker.paw)
[![NPM](https://nodei.co/npm/iobroker.paw.png?downloads=true)](https://nodei.co/npm/iobroker.paw/)

## Установка программы и настройка драйвера.
 
Скачиваем и устанавливает приложение PAW Server for Android. 

https://play.google.com/store/apps/details?id=de.fun2code.android.pawserver 

Открываем приложение PAW Server for Android на устройстве

После инициализации нужно перенести в папку ..paw/html

файлы:


+ call_log.xhtml 
+ get.xhtml
+ set.xhtml
+ sms_read.xhtml
+ settings.xhtml

Достаточно скачать и перенести только фаил " settings.xhtml "  остальные файлы с качаются через драйвер 

и при будущих обновлениях драйвера, будут обновляться сами.

файлы брать тут https://github.com/bondrogeen/iobroker.paw/tree/master/www

Запускаем PAW Server for Android.

Устанавливаем драйвер iobroke.paw c GitHub.

https://github.com/bondrogeen/iobroker.paw

![pic](admin/1.jpg)


Для управление через vis, можно управлять устройством [name_device] изменяя переменную 

***paw.0.[name_device].command.command*** 

+ lcd_on
> активировать экран
+ home
> эмулировать нажатие на кнопку HOME
+ endсall     
> конец связи (положить трубку)
+ scan        
> запустить приложение сканер штрих кода.
+ speech
>активация голоса
+ restart
>перезагрузка paw сервера 
+ kill
>отключить paw сервер 
+ gong
> проигрывает файл ..paw/html/gong.mp3 
+ sound_noti
> проигрывает стандартный звук уведомления
+ sound_ring
> проигрывает стандартный звук звонка


Так же и для остальных  переменных, но только некоторые команды   
требуют второго параметра, который вводиться через запятую.
   

***paw.0.[name_device].command.alert***
> Пример:  Внимание , Нет связи!!!	    
> Предупреждения 

***paw.0.[name_device].command.alertinput*** 
> Пример:   Внимание! , Введите команду	    
> Предупреждения c запросом, ответ сохраниться в переменной  paw.*.[name_device].request.alertinput

***paw.0.[name_device].command.send_sms***
> Пример:  123456789 , Проверка	  
> Отправить смс сообщение на номер [number] , с текстом [text]  
	
***paw.0.[name_device].command.noti***
> Пример: Внимание , Нет ответа от уст.	  
> Уведомление  [название уведомления] , [техт уведомления] 

***paw.0.[name_device].command.app_start***			
> Пример:  lcf.clock	   
> Запуск приложение  

***paw.0.[name_device].command.call***
> Пример: 123456789    
> Позвонить по номеру [number]  

***paw.0.[name_device].command.clipboard***
> Пример:Ab123	   
> Сохранить текст в буфере обмена   

***paw.0.[name_device].command.dial***	
> Пример: 123456789  
> Набрать номер [number] на уст.

***paw.0.[name_device].command.brightness***
> Пример:  255      
> уровень яркости подсветки от 1-255 
	
***paw.0.[name_device].command.openurl***
> Пример: http://ya.ru   
> Открыть url в браузере  

***paw.0.[name_device].command.rec***
> Пример: 1000                                 	
> Включить запись длительностью  [time(ms)]  

***paw.0.[name_device].command.vibrate***
> Пример:  500      
> Включить вибрацию, время в миллисекундах [time(ms)]  

***paw.0.[name_device].command.volume*** 
> Пример: 7    
> Установка громкости на устройстве от 0 до максимального значения,       
> максимальное значение можно посмотреть тут (обычно это 15)   
> paw.*.[name_device].info.audio_volume.info.music_max    



![pic](admin/2.jpg)



## Команды для javascript



```javascript
/*
dev1 - имя устройства, так же можно вводить IP устройства.
Можно указывать несколько устройств через запятую 'dev1,dev3,192.168.1.71' 
all - отправить на все устройства.
*/

//Отправить текст на синтезатор речи. 
sendTo("paw.0",'dev1,dev3',{send:  'say', text:  'проверка'});

// с callback
sendTo("paw.0",'all',{
    send:  'say', 
    text:  'проверка'},function (response){
    log(JSON.stringify(response));
});

//установка времени подсветки экрана в милисек. '-1' - не гасить экран (работает не на всех уст.) 
sendTo("paw.0",'dev1',{send:'screen_off_time',number: '5000'});

//активировать  экран на устройстве.
sendTo("paw.0",'all',{send:'lcd_on'});

//уровень яркости подсветки от 1-255 
sendTo("paw.0",'dev1',{send:'brightness',number: '50'});

//выполнить shell команду (нужен root)  
//"input tap x y" эмулирует нажатие на экран x — координаты по гор. y — координаты по верт.
//"poweroff -f" выключить устройства
//"reboot" перезагрузка устройства
sendTo("paw.0",'all',{send:'exec',text:'input tap 100 100'});

//эмулировать нажатие на кнопку HOME
sendTo("paw.0",'all',{send:'home'});

//запустить приложение, для примера - Tablet Clock указывается "системное название"
sendTo("paw.0",'all',{send:'app_start',value:'lcf.clock'});

sendTo("paw.0",'dev1',{
    send:'app_start',
    value:'lcf.clock'
},function (response){
    log(JSON.stringify(response));
});

// Получить список установленных приложений  "название":"системное название"
sendTo("paw.0",'dev1',{
    send:  'apps'
},function (response){
    log(JSON.stringify(response));
});

//Отправка смс.
sendTo("paw.0",'dev1',{send:  'sms', text:  'проверка', number: '8123456789'});

sendTo("paw.0",'192.168.1.71',{
    send:  'sms', 
    text:  'проверка',
    number: '8123456789'
},function (response){
    log(JSON.stringify(response));
});

/*
Установка громкости от 0 до 15, максимальная громкость устанавливается системой, 
также проверяется чтобы не выходило за пределы установленных значений)
mode=    может быть (STREAM_NOTIFICATION, STREAM_MUSIC ,STREAM_ALARM, 
STREAM_RING, STREAM_SYSTEM, STREAM_VOICE_CALL)  
если не указан то по умолчанию стоит STREAM_MUSIC
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

//Набрать номер.
sendTo("paw.0",'dev1',{send:  'call', number: '0611'});

// с callback
sendTo("paw.0",'192.168.1.71',{
    send:  'call', 
    number: '0611'
},function (response){
    log(JSON.stringify(response));
});

//Позвонить по номеру или выпоннить ussd команду.
sendTo("paw.0",'dev1',{send:  'call', number: '*100#'});

// с callback
sendTo("paw.0",'192.168.1.71',{
    send:  'call', 
    number: '0611'
},function (response){
    log(JSON.stringify(response));
});

//Включает вибрацию number (время в милисекундах)
sendTo("paw.0",'dev1',{send:  'vibrate', number: '1000'});

sendTo("paw.0",'192.168.1.71',{
    send:  'vibrate', 
    number: '100'
},function (response){
    log(JSON.stringify(response));
});

//Отправит уведомления на устройства
sendTo("paw.0",'dev1',{send:  'noti', texthead: 'Внимание',text: 'проверка'});

// с callback
sendTo("paw.0",'192.168.1.71',{
    send:  'noti',
    texthead: 'внимание',
    text: 'проверка'
},function (response){
    log(JSON.stringify(response));
});

//Отправит предупреждение на устройства
sendTo("paw.0",'dev1',{send:  'alert', texthead: 'Внимание',text: 'проверка'});


sendTo("paw.0",'192.168.1.71',{
    send:  'alert',
    texthead: 'внимание',
    text: 'проверка'
},function (response){
    log(JSON.stringify(response));
});


//Откроет браузер по указанному адресу
sendTo("paw.0",'dev1',{send:  'openurl', text: 'http://192.168.1.61:8082'});


sendTo("paw.0",'192.168.1.71',{
    send:  'openurl',
    text: 'http://ya.ru'
},function (response){
    log(JSON.stringify(response));
});

//Завершить звонок (положить трубку)
sendTo("paw.0",'dev1',{send:  'endсall'});

//Отправить  текст в буфер обмена  
sendTo("paw.0",'dev1',{send:  'clipboard',text:'текст'});


//Перезагрузка paw сервера 
sendTo("paw.0",'dev1',{send:  'server',text:'restart'});

//Остановка paw сервера
sendTo("paw.0",'dev1',{send:  'server',text:'kill'});



```



#### 0.0.3
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
