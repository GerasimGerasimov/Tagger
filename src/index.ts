import fs = require('fs');
import * as utils from './utils/utils';
import * as device from './devices/ModelDevice'
import {THosts, THost} from './devices/THosts';
import TTagsSource from './devices/TTagsSource';
import {TDevices, TAddressableDevice} from './devices/TDevices';
const Hosts: THosts = new THosts();
const TagsSource: TTagsSource = new TTagsSource();
const Devices: TDevices = new TDevices(TagsSource);
//имя слота будет состоять из позиции устройства и названия слота из JSON
//например U1RAM
console.log(Devices);
//нужна функция которая просканирует Hosts
//для каждого Hosts вытащит параметры хоста и протокола
//создаст класс соответсвующий протоколу (он будет переваривать данные в протокол и обратно)
//Для данного Hosts просканировать Devices и у тех которые сслаются на Host
//вытащить SlotsDescription из которой
//1. вытащить параметры связи
//2. найдёт соответствие в Tags
//3. вытащит нужные теги из Tags
// 

class TFieldBus {

}

class TFieldBusModbusRTU implements TFieldBus {

}

Hosts.HostsMap.forEach((Host:THost, HostName:string) => {
    console.log(HostName, Host);
    Devices.DevicesMap.forEach ((DevicePropertyes: TAddressableDevice, DeviceName: string)=>{
        console.log(HostName, Host);
        console.log(DeviceName, DevicePropertyes);
    });
});
