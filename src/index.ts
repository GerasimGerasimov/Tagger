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
        DeviceProperties.FieldBus = FieldBus;//теперь знаю какием протоколом обрабатывается устройство
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
(async ()=> {await Hosts.sendSlotSetsToHosts();})();


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
        'RAM':['Iexc', 'Uexc'],
        'FLASH':'ALL',
    }
}

//В AddressableDevice находится ссылка на host и
// tags в которых есть RAM, FLASH и т.п.
const SlotsDataRequest :TSlotsDataRequest  = Devices.getSlotsDataRequest(U1_request);
const host:THost = Hosts.getHostByName(SlotsDataRequest.Host);

//теперь есть Host и имена слотов, можно обращаться к Хосту за данными
//по именам слотов
async function getSlotsData() {
    for (const SlotDataRequest of SlotsDataRequest.SlotDataRequest){
        const slot:TSlot = host.SlotsMap.get(SlotDataRequest.SlotName);
        await host.getSlotData(slot)//обновляю данные хоста
        const FieldBus: TFieldBus = SlotsDataRequest.AddressableDevice.FieldBus;
        FieldBus.checkInputData(slot.msg);
        const RawData: Array<any> = FieldBus.getRawData(slot.msg);
        console.log(RawData);
        const Tag: TParameters = SlotsDataRequest.AddressableDevice.Tags[SlotDataRequest.SectionName.toLowerCase()]

        console.log(Tag)
    }
}

setInterval(()=>{getSlotsData();}, 5000);

console.log('THE END');

        //В идеале, данные хоста теперь обновлены
        //Slot.status = 'OK'
        //Slot.msg = '';
        //Slot.lastUpdateTime = new Date().toISOString();
        //Slot.slotRAWData = result; - это ответ сырых данных! их ещё надо:
        //1) обработать в соответствии с протоколом (отловить ошибки CRC, несоотв-я команды, неправильный адрес и т.п)
        //2) вытащить сырые данные (очищенные от протокола)
        //3) распределить данные на значения тегов загруженной секции
        //   если Slot.status = 'Error'; то значения тегов будут undefined
        //теперь надо из SlotDataRequest.Request сформировать ответ
        //1) вытаскиваю ссылку на теги секции которую запросил
        //   SlotsDataRequest.AddressableDevice.Tags[SlotDataRequest.SectionName(cd/flash/ram)]
        //2) Формирую массив запрошенных тегов
        //если Request = ALL, то в массив добавляются имена всех тегов запрошенной спекции
        //если Request = ['Iexc', 'Uexc'] то собственно массив запроса готов 
        //3) Из SlotsDataRequest.AddressableDevice.Tags[SlotDataRequest.SectionName(cd/flash/ram)]
        //   вытаскиваю значения rawData + msu для каждого тега из запроса
        //4) в итоге получаю:
        /*
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