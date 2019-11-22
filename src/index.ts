import fs = require('fs');
import * as utils from './utils'
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
/*
const DirsContent:Array<utils.IDirСontents> =  utils.getDirsContent(ConfDirName, DirList);
console.log(DirsContent);
const settings = JSON.parse(fs.readFileSync('./configuration/node1/config.json', 'utf8'));
console.log(settings);
*/