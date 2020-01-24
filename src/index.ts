import fs = require('fs');
import * as utils from './utils/utils';
import {TFieldBus, TSlotSource} from './fieldbus/TFieldBus'
import {TSlot, TSlotSet} from './slots/TSlotSet'
import {TFieldBusModbusRTU} from './fieldbus/TFieldBusModbusRTU'

import {THosts} from './devices/THosts';
import {THost} from './devices/THost';
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

Hosts.HostsMap.forEach((Host:THost, HostName:string) => {
    console.log(HostName, Host);
    const FieldBus:TFieldBus = new TFieldBusModbusRTU();
    Devices.DevicesMap.forEach ((DeviceProperties: TAddressableDevice, DeviceName: string)=>{
        //console.log(HostName, Host);
        //console.log(DeviceName, DeviceProperties);
        FieldBus.Tags  = DeviceProperties.Tags;
        FieldBus.FieldBusAddr = DeviceProperties.FieldBusAddr;
        for (const SlotSourceKey in DeviceProperties.SlotsDescription) {
            try {
                const SlotSourceValue: TSlotSource = DeviceProperties.SlotsDescription[SlotSourceKey];
                const SlotSet:TSlotSet = FieldBus.createReadSlot(DeviceProperties.PositionName, SlotSourceValue);
                console.log(SlotSet)
                Host.addSlotSetToMap(SlotSet);
            } catch (e) {
                console.log(e)
            }
        }
    });
});

//выведу список Хостов и связанных с ними Слотов
Hosts.HostsMap.forEach((Host:THost) => {
    console.log(Host.Name);
    Host.SlotsMap.forEach((item: TSlot)=>{
        console.log(item)
    });
});

//передам СлотСеты реальным хостам используя API /v1/slots/put
Hosts.sendSlotSetsToHosts();

/* TODO (:respond) сделать ответ на запрошенный JSON с параметрами устройства
{
    U1:{
        RAM:{//название слота
            ALL или [Iexc, Uexc]
        }
    }
}
А в ответ:
    {
        status:'OK',
        message:'всё норм',
        U1 {
            'U1:RAM' {//название слота
                Iexc: 100A      //названя и значения параметров
                Uexc: undefined //-----------------------------
            }
        }
    }
*/

const U1_request = {
    U1:{
        'U1:RAM':['Iexc', 'Uexc']
    }
}

//В AddressableDevice находится ссылка на host и
// tags в которых есть RAM, FLASH и т.п.
const AddressableDevice: TAddressableDevice = Devices.getAddressableDeviceByPositionName(U1_request);
const host:THost = Hosts.getHostByName(AddressableDevice.host);
//из запроса выделить название слота 'U1:RAM'
/* TODO (:slot name) перейти на названия 'U1:RAM' см TFieldBusModbusRTU.createReadSlot*/

console.log('THE END');