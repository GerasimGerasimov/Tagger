import fs = require('fs');
import * as utils from './utils/utils';
import {TFieldBus, TSlotSource} from './fieldbus/TFieldBus'
import {TSlotSet} from './slots/TSlotSet'
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
                const Slot:TSlotSet = FieldBus.createReadSlot(DeviceProperties.PositionName, SlotSourceValue);
                console.log(Slot)
                // TODO (:nodes): привязка слотов к нодам в вернее к хостам
                Host.addSlot(Slot);
            } catch (e) {
                console.log(e)
            }
        }
    });
});

//выведу список Хостов и связанных с ними Слотов
Hosts.HostsMap.forEach((Host:THost) => {
    console.log(Host.Name);
    Host.SlotsMap.forEach((item: TSlotSet)=>{
        console.log(item)
    });
});

console.log('THE END');