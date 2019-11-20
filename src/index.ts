import fs = require('fs');
//читаю содержимое папки configuration
const ConfDirName:string = './configuration';

function getDirList(path: string): Array<string> {
    return fs.readdirSync(path,"utf8");
}

let DirList =  getDirList(ConfDirName);
//получаю список директорий - нод,
console.log('getDevsFiles.DirList:',DirList);
//теперь надо пройтись по списку и прочитать ноды
let res = [];
let i = DirList.length;
while (i-- !=0) {
    let o = {};// res[DirList[i]] = {};
    o.name = DirList[i];
    o.path = ConfDirName+"/"+DirList[i]+'/';
    o.files = fs.readdirSync(o.path,"utf8");
    res.push(o);
}

const settings = JSON.parse(fs.readFileSync('./configuration/node1/config.json', 'utf8'));
console.log(settings);