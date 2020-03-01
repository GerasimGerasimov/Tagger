import {TFieldBus} from '../fieldbus/TFieldBus'
import {TSlot, TDeviceAnswer} from '../slots/TSlotSet'

import {THosts} from '../devices/THosts';
import {THost} from '../devices/THost';
import {TDevices, TSlotsDataRequest} from '../devices/TDevices';
import { TParameters } from '../devices/TagTypes/TParameters'

export default class Tagger {
    private static Hosts: THosts;
    private static Devices: TDevices;
    public static _initialize (Hosts: THosts, Devices: TDevices) {
        Tagger.Hosts = Hosts;
        Tagger.Devices = Devices; 
    }

    public static async getgetDeviceData(request: Object): Promise<any> {
        const SlotsDataRequest :TSlotsDataRequest  = Tagger.Devices.getSlotsDataRequest(request);
        const host:THost = Tagger.Hosts.getHostByName(SlotsDataRequest.Host);
        const result: any = await Tagger.getSlotsData(SlotsDataRequest, host);
        return result;
    }

    private static async getSlotsData(SlotsDataRequest :TSlotsDataRequest, host:THost): Promise<any>{   
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
        return Tagger.fillRespond(SlotsDataRequest, host);
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