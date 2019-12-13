import fs = require('fs');
import * as utils from './utils/utils';
import * as device from './devices/ModelDevice'
import THosts from './devices/THosts';
import TTagsSource from './devices/TTagsSource';
//читаю содержимое папки configuration
const Hosts: THosts = new THosts();
const TagsSource: TTagsSource = new TTagsSource();
const DevicesDir: string = `${utils.ConfDirName}/devices`;//ту хранятся U1, U2 и т.п.

//получаю список директорий в директории configuration
//должны присутсвовать nodes и devices - иначе на выход
//проверка существования директорий
utils.validateFolderExistence(DevicesDir);
//загружаю списки файлов в директориях

let DevicesFilesList: Array<string> =  utils.getFilesList(DevicesDir);
const DevicesFilesProps:Array<utils.IDirСontents> =  utils.getFilesProps(DevicesDir, DevicesFilesList);

///////////////////////////////////////////////////////////
//Формирование карты устройств в сети с их тегами и привязками к Хостам
class TNodeDevices {
    addr: number;
    host: string;
    source: string;
    slots:Object = {}
}

class TAddressableDevice {
    host: string = '';//имя хоста
    source: string = ''; //название ini-файла
    PositionName: string = ''; //обозначение устройства на схеме
    FieldBusAddr: number = 1;//адрес в сети или полевой шине
    Tags: device.IModelDevice = undefined;//доступные теги, требуется последующее заполнение
    SlotsDescription: Object = {};//описание слотов в JSON-формате, требуется последующая обработка
}

const DevicesMap = new  Map<string, TAddressableDevice>();

function getDev(name:string, item:TNodeDevices): TAddressableDevice {
    let result:  TAddressableDevice = new  TAddressableDevice();
    result.host = item.host;
    result.source = item.source;
    result.FieldBusAddr = item.addr;
    result.PositionName = name;
    result.SlotsDescription = item.slots;    
    return result;
}

function parseNodeDevList(devs: Array<utils.IDirСontents>): any {
    devs.forEach((item)=>{
        var o:TNodeDevices = JSON.parse(item.Content);
        const name = utils.getNameFromFileName(item.FileName);
        const result = DevicesMap.get(name);
        if (result === undefined) {
            let device: TAddressableDevice = getDev(name, o)//создать объект привязанный к U1
            DevicesMap.set(name, device);
        } else {
            console.log(`Device: ${name} at addr: ${o.addr} already exists`)
        }
    })
}

parseNodeDevList(DevicesFilesProps);
//на данном этапе появилсь U1, U2 ... , но Tags ещё пустые
console.log(DevicesMap);

//Связываю Tags в Ux с source
function fillTags(source: string):device.IModelDevice {
    let o = TagsSource.Tags.get(source);
    return o;
}
//DevsTags: Array<device.IModelDevice>
//DevicesMap: Map<string, TAddressableDevice>
function bindSourceToDevTags(){
    for (let key of DevicesMap.keys()) {
        let dev: TAddressableDevice = DevicesMap.get(key);
        dev.Tags = fillTags(dev.source);
    }
}

bindSourceToDevTags();
console.log(DevicesMap);