import fs = require('fs');
import * as utils from './utils/utils';
import {TFieldBus, TSlotSource} from './fieldbus/TFieldBus'
import {TSlot, TSlotSet} from './slots/TSlotSet'
import {TFieldBusModbusRTU} from './fieldbus/TFieldBusModbusRTU'

import {THosts} from './devices/THosts';
import {THost} from './devices/THost';
import TTagsSource from './devices/TTagsSource';
import {TDevices, TAddressableDevice, TSlotsDataRequest } from './devices/TDevices';
import { TParameters } from './devices/TagTypes/TParameters'

import {AppServer, IServer} from "./server/server"

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
        DeviceProperties.FieldBus = FieldBus;//теперь знаю каким протоколом обрабатывается устройство
        FieldBus.Tags  = DeviceProperties.Tags;
        FieldBus.FieldBusAddr = DeviceProperties.FieldBusAddr;
        for (const SlotSourceKey in DeviceProperties.SlotsDescription) {
            try {
                const SlotSourceValue: TSlotSource = DeviceProperties.SlotsDescription[SlotSourceKey];
                const SlotSet:TSlotSet = FieldBus.createReadSlot(DeviceProperties.PositionName, SlotSourceValue);
                Host.addSlotSetToMap(SlotSet);
            } catch (e) {
                console.log(e)
            }
        }
    });
});

/*
//выведу список Хостов и связанных с ними Слотов
Hosts.HostsMap.forEach((Host:THost) => {
    console.log(Host.Name);
    Host.SlotsMap.forEach((item: TSlot)=>{
        console.log(item)
    });
});
*/
//передам СлотСеты реальным хостам используя API /v1/slots/put
(async ()=> {await Hosts.sendSlotSetsToHosts();})();

class TDeviceAnswer {
    status: string;
    duration:number;
    time:any;
    data:Object;
}
async function getSlotsData(request: Object, SlotsDataRequest :TSlotsDataRequest, host:THost): Promise<any>{
    const FieldBus: TFieldBus = SlotsDataRequest.AddressableDevice.FieldBus;
    const PositionName = SlotsDataRequest.PositionName;
    const result: Object = {[PositionName]:{}};
    for (const SlotDataRequest of SlotsDataRequest.SlotDataRequest){
        const slot:TSlot = host.SlotsMap.get(SlotDataRequest.SlotName);
        try {
            await host.getSlotData(slot)//обновляю данные хоста
            FieldBus.checkFolderOfAnswer(slot);
            const RawData: Array<any> = FieldBus.getRawData(slot.msg);
            FieldBus.checkRequiredData(RawData, slot);
            const Tag: TParameters = SlotsDataRequest.AddressableDevice.Tags[SlotDataRequest.SectionName.toLowerCase()]
            const RawDataMap: Map<number, any> = FieldBus.convertRawDataToMap(RawData, slot.slotSet.RegsRange.first);
            Tag.setDataToParameters(RawDataMap);
            const data: Object = Tag.getRequiredParameters(SlotDataRequest.Request);
            const DeviceAnswer: TDeviceAnswer = {
                status:'OK',
                duration:slot.duration,
                time:slot.time || null,
                data,
            }
            result[PositionName][SlotDataRequest.SlotName] = DeviceAnswer;
        } catch (e) {
            result[PositionName][SlotDataRequest.SlotName] = {
                'status':'Error',
                'msg': e.message
            };
        }
        
    }
    return result;
}

async function getgetDeviceData(request: Object): Promise<any> {
    const SlotsDataRequest :TSlotsDataRequest  = Devices.getSlotsDataRequest(request);
    const host:THost = Hosts.getHostByName(SlotsDataRequest.Host);
    const result: any = await getSlotsData(request, SlotsDataRequest, host);
    return result;
}

/*
const U1_request = {
    U1:{
        'RAM':['MCDT','Iexc', 'Uexc','Ustat'],
        'FLASH':'ALL',
    }
}
*/
//setInterval(()=>{getgetDeviceData(U1_request);}, 1000);

const Server: IServer = new AppServer(5004, getgetDeviceData);
console.log('Tagger Service started');
Server.serve();