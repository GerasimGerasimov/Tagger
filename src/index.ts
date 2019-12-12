import fs = require('fs');
import * as utils from './utils/utils';
import * as device from './devices/ModelDevice'
//читаю содержимое папки configuration
const ConfDirName:string = './configuration';
const NodesDir: string = `${ConfDirName}/nodes`;
const DevicesDir: string = `${ConfDirName}/devices`;
//получаю список директорий в директории configuration
//должны присутсвовать nodes и devices - иначе на выход
//проверка существования директорий
utils.validateFolderExistence(DevicesDir);
utils.validateFolderExistence(NodesDir);
//загружаю списки файлов в директориях
let NodesDirList: Array<string> =  utils.getFilesList(NodesDir);
let DevicesFilesList: Array<string> =  utils.getFilesList(DevicesDir);
//загружаю содержимое файлов, и их свойства
const NodesFilesProps:Array<utils.IDirСontents> =  utils.getFilesProps(NodesDir, NodesDirList);
const DevicesFilesProps:Array<utils.IDirСontents> =  utils.getFilesProps(DevicesDir, DevicesFilesList);
//начну с парсинга ini в
//на данном этапе у меня есть список ini-файлов в DevicesFilesProps
//их надо превратить в теги типа
/*{ name: vteg_v1.15,
    RAM:{Iexc:{параметры}, , , , },
    FLASH:{, , , ,},
    CD:{, , , ,},
    vars:{, , , ,}

    под "параметры" я понимаю декодированную строку, типа:
    p03200=Usgz/Заданное напряжение статора/TFloat/x0040/r0020/B/1/4/0/
    буду класть параметры в SET поэтому названия должны быть уникальными
*/

//получаю список тегов из всех ini из папки /configuration/devices/
const DevsTags: Array<device.IModelDevice> = device.getDevicesTags(DevicesFilesProps);
console.log(DevsTags);
//const dev: device.IDevice = device.getDeviceFromFile(DevicesFilesProps[0].Content);
//потом, зная ноду и утройство я буду обращаться
/*{
    Node: node1, - нода
    Devices:  { - перечень устройств
        U1: {
            RAM: [Iexc, Uexc], - отдать заданные параметры
            FLASH: [IexcStart] - отдать заданные параметры,
            CD:ALL,
            Vars:ALL
        },
        U2: {
            RAM: ALL, - отдать ВСЕ параметры
            FLASH: ALL - отдать ВСЕ параметры
        }        
    }
*/
//Теперь распарсить список нод NodesFilesProps
//найти все addr [U1, U2 ...]

class TPositionNameAndFieldBusAdress {
    name: string = '';//обозначение устройства на схеме
    addr: number = 1; //адрес в сети или полевой шине
}

class TNodeDevices {
    source: string;
    addr: Array<TPositionNameAndFieldBusAdress>;
    slots:Object = {}
}

class TAddressableDevice {
    source: string = ''; //название ini-файла
    PositionName: string = ''; //обозначение устройства на схеме
    FieldBusAddr: number = 1;//адрес в сети или полевой шине
    Tags: device.IModelDevice = undefined;//доступные теги, требуется последующее заполнение
    SlotsDescription: Object = {};//описание слотов в JSON-формате, требуется последующая обработка
}

function ObjectToAdressableDevice(o:Object): TPositionNameAndFieldBusAdress {
    const result: TPositionNameAndFieldBusAdress = new TPositionNameAndFieldBusAdress();
    for (let key in o) {
        result.name = key;
        result.addr = o[key]
    }
    return result; 
}
const DevicesMap = new  Map<string, TAddressableDevice>();

function getDev(PositionNameAndFieldBusAdress:TPositionNameAndFieldBusAdress, item: TNodeDevices): TAddressableDevice {
    let result:  TAddressableDevice = new  TAddressableDevice();
    result.source = item.source;
    result.FieldBusAddr = PositionNameAndFieldBusAdress.addr;
    result.PositionName = PositionNameAndFieldBusAdress.name;
    result.SlotsDescription = item.slots;    
    return result;
}

function parseNodeDevList(devs: Array<Object>): any {
    devs.forEach((item: TNodeDevices)=>{
        item.addr.forEach((e) => {
            let o:TPositionNameAndFieldBusAdress = ObjectToAdressableDevice(e);
            const result = DevicesMap.get(o.name);
            if (result === undefined) {
                let device: TAddressableDevice = getDev(o, item)//создать объект привязанный к U1
                DevicesMap.set(o.name, device);
            } else {
                console.log(`Device: ${o.name} at addr: ${o.addr} already exists`)
            }
        })
    })
}

function parseNodeList(props:Array<utils.IDirСontents>): any{
    var result: Array<any> = [];
    props.forEach(item => {
        var o = JSON.parse(item.Content)
        const FieldBus: string = o.fieldbus;
        const name: string = o.name;
        const HOST: string = o.HOST;
        const d = parseNodeDevList(o.Devices || []);
        result.push(o);
    })
    return result;
}

const Nodes: any = parseNodeList (NodesFilesProps); 
console.log(Nodes);