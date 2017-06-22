![Logo](https://raw.githubusercontent.com/bondrogeen/iobroker.paw/master/admin/paw_big.png)
# ioBroker.paw
=================

[![NPM version](http://img.shields.io/npm/v/iobroker.paw.svg)](https://www.npmjs.com/package/iobroker.paw)
[![Downloads](https://img.shields.io/npm/dm/iobroker.paw.svg)](https://www.npmjs.com/package/iobroker.paw)

[![NPM](https://nodei.co/npm/iobroker.paw.png?downloads=true)](https://nodei.co/npm/iobroker.paw/)

## Описание
Это драйвер для управления Android- устройством через приложение PAW server.
Он может проговаривать текст, управлять громкостю, отправлять SMS, совершать звонки, и многое другое ...

Tasker and Locale Plug-in support.
PHP plug-in is available too for PAW app.

## Установка программы и настройка драйвера.
 
Скачиваем и устанавливает приложение PAW Server for Android. 

https://play.google.com/store/apps/details?id=de.fun2code.android.pawserver 

Открываем приложение PAW Server for Android на устройстве

После инициализации нужно перенести в папку ..paw/html

файлы:


+ call.xhtml 
+ get.xhtml
+ set.xhtml
+ sms.xhtml
+ settings.xhtml

Достаточно скачать и перенести только фаил " settings.xhtml "  остальные файлы с качаются через драйвер 

и при будущих обновлениях драйвера, будут обновляться сами.

файлы брать тут https://github.com/bondrogeen/iobroker.paw/tree/master/www

Запускаем PAW Server for Android.

Устанавливаем драйвер iobroke.paw c GitHub.

https://github.com/bondrogeen/iobroker.paw

![pic](https://raw.githubusercontent.com/bondrogeen/iobroker.paw/master/docs/ru/img/1.jpg)

Начало и конец - это время работы оповещение через синтезатор речи.   

Например, все сообщения с 7ч до 23ч которые будут отправлены на    

синтезатор речи (ttl), а в остальное время будут игнорироваться.  

Это правило распространяется только на изменения этих переменных  

***paw.0.[name_device].tts.response*** (для конкретного устройства)   

или  
  
***paw.0.all_device.tts_response*** (для всех устройств)   

При отправки через javascript это правило не действует.  

Также предусмотрено для ttl буфер , все сообщения поступающие на синтезатор будут сказаны.
   
То есть если у вас стоит на 10-00 отправка на ttl оповещение (времени или погоды) и в это
    
время поступает какое-то сообщение (хоть 10шт ) , то все сообщения будут сказаны.    

игнор - если не нужно получать основную информацию от устройства. 


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



![pic](https://raw.githubusercontent.com/bondrogeen/iobroker.paw/master/docs/ru/img/2.jpg)



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

//отключить отслеживание батареи, переводит 0% (нужен root)
sendTo("paw.0",'dev1',{send:'battery_off'});

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

// Получить список задач из приложения Tasker "tasks": [auto, bubble, call, clock]
sendTo("paw.0",'dev1',{
    send:  'tasker'
},function (response){
    log(JSON.stringify(response));
});

// Запустите задачу из приложения Tasker.
// [text] = имя задачи
// [value] (не обязательно) = параметр передастся переменной %par1 
// можно передавать несколько значений разделяя ",,"
// например  value: ' test1 ,, test2 ,, test[n] ' будут переданы  %par1, %par2 %par[n]  и т.д.
sendTo("paw.0",'dev2',{
    send:  'task',
    text:'test',
    value:'value_test'
},function (response){
    log(JSON.stringify(response[0]));
});

Error status:
NotInstalled: no Tasker package could be found on the device
NoPermission: calling app does not have the needed Android permission (see above)
NotEnabled: Tasker is disabled by the user.
AccessBlocked: external access is blocked in the user preferences. You can show the user the relevant preference with e.g. startActivity( TaskerIntent.getExternalAccessPrefsIntent() )
NoReceiver: nothing is listening for TaskerIntents. Probably a Tasker bug.


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
sendTo("paw.0",'dev1',{send:  'dial', number: '0611'});

// с callback
sendTo("paw.0",'192.168.1.71',{
    send:  'dial', 
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

// Отправит уведомления на устройства
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

// Отправить  текст в буфер обмена  
sendTo("paw.0",'dev1',{send:  'clipboard',text:'текст'});


// Перезагрузка paw сервера 
sendTo("paw.0",'dev1',{send:  'server',text:'restart'});

// Остановка paw сервера
sendTo("paw.0",'dev1',{send:  'server',text:'kill'});


// получить журнал вызовов 
// [send] обязательный параметр.
// "now" за сегодняшний день
// "all" все вызовы, 
// "incoming" входящие вызовы
// "missed" пропущенные вызовы
// "outgoing" исходящие вызовы  
// "info" только информация о количеству вызовов 
// [date] - не обязательный параметр.
// можно получить только за указанный день формат запроса " 01-05-2017 "
// также можно просто перейти по адресу http://IP:8080/call.xhtml для получения списка виде html страницы
sendTo("paw.0",'dev1',{
    html:'call',
    send:  'incoming',
    date:'01-05-2017'
},function (response){
    log(JSON.stringify(response[0]));
});


// получить сообщения 
// [send] обязательный параметр.
// "now" за сегодняшний день
// "all" все сообщения, 
// "incoming" входящие сообщения
// "outgoing" исходящие  сообщения
// "info" только информация о количестве всех сообщений 
// [date] - не обязательный параметр.
// можно получить только за указанный день формат запроса " 01-05-2017 "
// также можно просто перейти по адресу http://IP:8080/sms.xhtml для получения списка виде html страницы
sendTo("paw.0",'dev1',{
    html:'sms',
    send:  'incoming',
    date:'01-05-2017'
},function (response){
    log(JSON.stringify(response[0]));
});

// Вывод текстовой информации в отдельном окне
//text: "Default text",   - Текст        
//textsize:"50",  - размер шрифта  [5 - 300] 50 (По умолчанию )
//textcolor:"000000",   - цвет текста [HEX]  000000 (По умолчанию )
//color:"ffffff",   - цвет фона [HEX]  ffffff (По умолчанию )
//orientation:"0",  - ориентация   - 0, 90, 180, 270,   (По умолчанию : текущая ориентация  )
//font:"NORMAL"  -  font  BOLD_ITALIC, BOLD, ITALIC,   NORMAL (По умолчанию )

sendTo("paw.0",'dev1',{
    send:  'informer', 
    text: "Default text",    
    textsize:"50",  //Необязательный параметр
    textcolor:"ff0000",  //Необязательный параметр
    color:"ff00ff",//Необязательный параметр
    orientation:"180",//Необязательный параметр
    font:"NORMAL"  //Необязательный параметр
    
},function (response){
    log(JSON.stringify(response[0]));
});

```



### 0.0.8 (2017-05-07)

* (bondrogeen) мелкие правки

### 0.0.7 (2017-05-03)

* (bondrogeen) добавил чтения сообщений 

### 0.0.6 (2017-05-01)

* (bondrogeen) добавил получение журнала вызовов


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
