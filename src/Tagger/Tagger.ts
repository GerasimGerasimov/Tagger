import {TFieldBus} from '../fieldbus/TFieldBus'
import {TSlot, TDeviceAnswer} from '../slots/TSlotSet'

import {THosts} from '../client/THosts';
import {THost} from '../client/THost';
import {TDevices, TSlotsDataRequest} from '../devices/TDevices';
import { TParameters } from '../devices/TagTypes/TParameters'
import {ErrorMessage} from '../utils/errors'

export default class Tagger {
    private static Hosts: THosts;
    private static Devices: TDevices;
    public static _initialize (Hosts: THosts, Devices: TDevices) {
        Tagger.Hosts = Hosts;
        Tagger.Devices = Devices; 
    }

    public static getDeviceData(request: Object): any {
        try {
            const SlotsDataRequest :TSlotsDataRequest  = Tagger.Devices.getSlotsDataRequest(request);
            const host:THost = Tagger.Hosts.getHostByName(SlotsDataRequest.Host);
            const result: any = Tagger.fillRespond(SlotsDataRequest, host);
            return {
                status:'OK',
                time: new Date().toISOString(),
                data: result }
        } catch (e) {
            return ErrorMessage(e.message)
        }
    }
  
    public static getDevicesInfo(request: Object): any {
        return Tagger.Devices.getDevicesInfo();
    }

    /*TODO записать новые значения выбранным параметрам
    1) Передаю объект с указанием:
        {
        "U1":{  - Устройства
            "RAM":[ - Сектора памяти
                "DIN.0(C1_AC)=1", - Имени параметра и его новое значение
                "Iexc=100",
                "Fz=0.98"
            ]
        }
    */
    public static setDeviceParameter(request: Object): any | Error {
        //1) выделить что и куда передавать
        const device:  TSlotsDataRequest = Tagger.Devices.getSlotsDataRequest(request);
        const {host, FieldBusAddr, PositionName} = device.AddressableDevice;
        const {SectionName, Request} = device.SlotDataRequest[0];
        device.AddressableDevice.isSection(SectionName);
        //из Request достать параметр который надо поменять.
        //Это объект отбъектов, но интересует только один параметров
        //так как сейчас я обрабатываю ввод клавиатуры, а это один изменённый параметр
        //TODO потом подумаю как обрабатывать несколько параметров, 
        //     самый тупой подход - это одна команда записи на один параметр
        var {tag, value} = Tagger.getTagAndValue(Request);
        device.AddressableDevice.isTag(SectionName, tag)
    
        const respond = {
            host,
            PositionName,
            SectionName,
            FieldBusAddr,
            tag,
            value
        }
        return respond;
    }
    
    private static getTagAndValue(req: any): {tag: string; value: any;} {
        var tag: string = '';
        var value: any = 0;
        for (tag in Request) {
            value = Request[tag]
            break;
        }
        return {tag, value}
    }

    private static fillRespond(SlotsDataRequest :TSlotsDataRequest, host:THost): any {
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
}