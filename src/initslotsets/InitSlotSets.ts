import {THost} from '../client/THost';
import {THosts} from '../client/THosts';
import {TDevices, TAddressableDevice} from '../devices/TDevices';
import {TSlotSet} from '../slots/TSlotSet'
import {TFieldBus, TSlotSource} from '../fieldbus/TFieldBus'
import {TFieldBusModbusRTU} from '../fieldbus/TFieldBusModbusRTU';

export function initSlotSets(Hosts: THosts, Devices: TDevices) {
    createSlotSets(Hosts, Devices);
    sendSlotSetsToHosts(Hosts);
}

function createSlotSets(hosts: THosts, devices: TDevices) {
    hosts.HostsMap.forEach((Host:THost) => {
        devices.DevicesMap.forEach ((DeviceProperties: TAddressableDevice)=>{
            const FieldBus:TFieldBus = new TFieldBusModbusRTU();
            DeviceProperties.FieldBus = FieldBus;//теперь знаю каким протоколом обрабатывается устройство
            //TODO избавится от Tags в TFieldBus
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
}

//передам СлотСеты реальным хостам используя API /v1/slots/put
async function sendSlotSetsToHosts(Hosts: THosts) {
    await Hosts.sendSlotSetsToHosts();
}