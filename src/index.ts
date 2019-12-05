import fs = require('fs');
import * as utils from './utils/utils';
import * as device from './devices/device'
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
function getDevicesTags(DevicesFilesProps:Array<utils.IDirСontents>): Array<device.IDevice> {
    const result: Array<device.IDevice> = [];
    DevicesFilesProps.forEach(item => {
        result.push(device.getDeviceFromFile(item.FileName, item.Content))
    })
    return result;
}

const DevsTags: Array<device.IDevice> = getDevicesTags(DevicesFilesProps);
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
/*
const DirsContent:Array<utils.IDirСontents> =  utils.getDirsContent(ConfDirName, DirList);
console.log(DirsContent);
const settings = JSON.parse(fs.readFileSync('./configuration/node1/config.json', 'utf8'));
console.log(settings);
*/