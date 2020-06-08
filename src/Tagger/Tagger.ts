import {TFieldBus, TSlotSource} from '../fieldbus/TFieldBus'
import {TSlot, TDeviceAnswer, TSlotSet} from '../slots/TSlotSet'

import {THosts} from '../client/THosts';
import {THost} from '../client/THost';
import {TDevices, TSlotsDataRequest} from '../devices/TDevices';
import { TParameters } from '../devices/TagTypes/TParameters'
import {ErrorMessage, IErrorMessage} from '../utils/errors'

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

    /*Записать новые значения выбранным параметрам
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
    private static async waitValueHasWritten(Slot:TSlot, tag: string): Promise<any | IErrorMessage> {
        return new Promise((resolve, reject)=>{
            Slot.onFulfilled = async function () {
                console.log(Slot);
                //найти к какому Хосту относится Слот
                var Host: THost = undefined;
                for (const host of Tagger.Hosts.HostsMap.values()) {
                    if (host.SlotsMap.has(Slot.slotSet.ID)) {
                        Host = host;
                        break;
                    }
                }
                var result: any;
                if (Host !== undefined) {
                    result = await Host.deleteSlotFromHost(Slot.slotSet.ID)
                    console.log('onFulfilled:',result)
                    Host.deleteSlotFromMap(Slot.slotSet.ID)
                    
                }
                const {status, time, ID} = result;
                if (status === "OK") {
                    resolve({
                    tag,
                    msg:`Tag ${tag} has written`
                })} else {
                    reject ({
                        msg: `Tag ${tag} hasn't written`
                    })
                }
            }

            Slot.onRejected = function () {
                console.log('onRejected:',Slot);
                reject ({
                    msg: `Tag ${tag} hasn't written`
                })
            }
        })
    }

    public static async writeDeviceParameter(request: Object): Promise <any | Error> {
        try {
            //1) выделить что и куда передавать
            const device:  TSlotsDataRequest = Tagger.Devices.getSlotsDataRequest(request);
            const {host, FieldBus, FieldBusAddr, PositionName} = device.AddressableDevice;
            const {SectionName, Request} = device.SlotDataRequest[0];
            device.AddressableDevice.isSection(SectionName);
            //из Request достать параметр который надо поменять.
            //Это объект отбъектов, но интересует только один параметров
            //так как сейчас я обрабатываю ввод клавиатуры, а это один изменённый параметр
            //TODO потом подумаю как обрабатывать несколько параметров, 
            //     самый тупой подход - это одна команда записи на один параметр
            const {key: tag, value} = Tagger.getKeyAndValueOnce(Request);
            const values: Map<string, any> = new Map();
            values.set(tag, value);
            device.AddressableDevice.isTag(SectionName, tag);
            //2) Создать запрос для размещения в слот
            const SlotSourceKey: string = `${PositionName}:${SectionName}`;
            const SlotSource: TSlotSource = device.AddressableDevice.SlotsDescription[SlotSourceKey];
            const SlotSet:TSlotSet = FieldBus.createWriteSlot(PositionName, SlotSource, values);
            const Host:THost = Tagger.Hosts.getHostByName(host);
            const Slot:TSlot = Host.addSlotSetToMap(SlotSet);
            await Host.setSlotToHost(Slot);
            const result = await Tagger.waitValueHasWritten(Slot, tag)
            return (result)
        } catch (e) {
            throw new Error(e.message)
        }
    }

    private static getKeyAndValueOnce(req: any): {key: string; value: any;} {
        var key: string = '';
        var value: any = 0;
        for (key in req) {
            value = req[key]
            break;
        }
        return {key, value}
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