import fs = require('fs');
import {TFieldBus, TSlotSource} from './fieldbus/TFieldBus'
import {TSlot, TSlotSet, TDeviceAnswer} from './slots/TSlotSet'
import {TFieldBusModbusRTU} from './fieldbus/TFieldBusModbusRTU'

import {THosts} from './devices/THosts';
import {THost} from './devices/THost';
import TTagsSource from './devices/TTagsSource';
import {TDevices, TAddressableDevice, TSlotsDataRequest, TSlotDataRequest } from './devices/TDevices';
import { TParameters } from './devices/TagTypes/TParameters'

import {AppServer, IServer} from "./server/server"

const Hosts: THosts = new THosts();
const TagsSource: TTagsSource = new TTagsSource();
const Devices: TDevices = new TDevices(TagsSource);

Hosts.HostsMap.forEach((Host:THost) => {
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

//передам СлотСеты реальным хостам используя API /v1/slots/put
(async ()=> {await Hosts.sendSlotSetsToHosts();})();

async function getSlotsData(SlotsDataRequest :TSlotsDataRequest, host:THost): Promise<any>{   
    const slots: Array <TSlot> = SlotsDataRequest.SlotDataRequest.map((SlotDataRequest) => {
        return host.SlotsMap.get(SlotDataRequest.SlotName);
    })
    try {
        await host.getRequiredSlotsData(slots)//обновляю данные хоста
    } catch (e) {
        return {
            'status':'Error',
            'msg': e.message
        };
    }
    return fillRespond(SlotsDataRequest, host);
}

function fillRespond(SlotsDataRequest :TSlotsDataRequest, host:THost): any {
    const FieldBus: TFieldBus = SlotsDataRequest.AddressableDevice.FieldBus;
    const PositionName = SlotsDataRequest.PositionName;
    const result: Object = {[PositionName]:{}};
    for (const SlotDataRequest of SlotsDataRequest.SlotDataRequest){
        const slot:TSlot = host.SlotsMap.get(SlotDataRequest.SlotName);
        const Tag: TParameters = SlotsDataRequest.AddressableDevice.Tags[SlotDataRequest.SectionName.toLowerCase()]
        try {
            FieldBus.checkHeaderOfAnswer(slot);
            const RawData: Array<any> = FieldBus.getRawData(slot.msg);
            FieldBus.checkRequiredData(RawData, slot);
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
    const result: any = await getSlotsData(SlotsDataRequest, host);
    return result;
}

/*
const U1_request = {
    U1:{
        RAM:'ALL',
        FLASH:'ALL',
        CD:'ALL'
    }
}
setInterval(()=>{getgetDeviceData(U1_request);}, 1000);
*/

const Server: IServer = new AppServer(5004, getgetDeviceData);
console.log('Tagger Service started');
Server.serve();