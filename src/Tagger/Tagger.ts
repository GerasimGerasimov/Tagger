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

    /*WS
    {
        "cmd": "getInfo",
        "ClientID": "IGoG4Q"
    }
    */
    public static getDevicesInfo(request: Object): any {
        return Tagger.Devices.getDevicesInfo();
    }

    /*WS
    {
        "cmd": "getValues",
        "ClientID": "zeD4vg",
        "payload": {
                   "U1":{
                   "RAM":["Uexc","Ustat","PWR"]
                  }
        }
      }
    */
    public static getDeviceData(request: Object): any {
        try {
            const SlotsDataRequest :TSlotsDataRequest  = Tagger.Devices.getSlotsDataRequest(request);
            const host:THost = Tagger.Hosts.getHostByName(SlotsDataRequest.Host);
            const result: any = Tagger.fillRespond(SlotsDataRequest, host);
            return result;
        } catch (e) {
            return ErrorMessage(e.message)
        }
    }

    /*WS
    {
        "cmd": "setValue",
        "ClientID": "zeD4vg",
        "payload": {
                    "U1":{
                        "RAM":{
                            "PWR": 0
                        }
                    }
        }
    }
    */
    public static async writeDeviceParameter(request: Object): Promise <string | Error> {
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
            const respond = await Tagger.waitWriteSlotTakeRespond(Slot, tag, FieldBus);
            const result = await Tagger.deleteWritingSlot(Slot, tag)
            console.log(result);
            return `${tag} has been changed to ${value}`;
        } catch (e) {
            throw new Error(e.message)
        }
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
    private static getHostBySlotID(ID:string): THost {
        //найти к какому Хосту относится Слот
        var Host: THost = undefined;
        for (const host of Tagger.Hosts.HostsMap.values()) {
            if (host.SlotsMap.has(ID)) {
                Host = host;
                break;
            }
        }
        return Host;
    }

    private static async waitWriteSlotTakeRespond(Slot:TSlot, tag: string, FieldBus:TFieldBus): Promise<any | IErrorMessage> {
        return new Promise((resolve, reject)=>{

            Slot.onFulfilled = function () {
                FieldBus.checkHeaderOfAnswer(Slot);
                resolve({
                    tag,
                    msg:`Tag ${tag} has been written`
                })
            }

            Slot.onRejected = function () {
                resolve ({
                    status: 'Error',
                    msg:`Tag ${tag} hasn't been written`
                })
            }
        })
    }

    private static async deleteWritingSlot(Slot:TSlot, tag: string): Promise<any | IErrorMessage> {
        return new Promise((resolve, reject)=>{

            const ID: string = Slot.slotSet.ID;
            Slot.onFulfilled = async function () {
                //найти к какому Хосту относится Слот
                var Host: THost = Tagger.getHostBySlotID(ID)
                var result: any;
                if (Host !== undefined) {
                    result = await Host.deleteSlotFromHost(ID)
                    Host.deleteSlotFromMap(ID)
                }
                const {status} = result;
                if (status === "OK") {
                    resolve({
                    msg:`Slot ${ID} has been deleted`
                })} else {
                    reject ({
                        msg: `Slot ${ID} hasn't been deleted`
                    })
                }
            }

            Slot.onRejected = function () {
                reject ({
                    msg: `SLot ${ID} hasn't been deleted`
                })
            }
        })
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