import fs = require('fs');
import path = require('path');
import { ConfigPath } from './configpath';

export const ConfDirName: string = path.resolve(ConfigPath,'');//path.resolve(__dirname,'../.././configuration/');

export function getAbsDirPath(dir: string): string {
    const result: string = path.resolve(`${ConfDirName}`, dir);
    return result;
}

export function validateFolderExistence(dirName: string): void {
    if (fs.existsSync(dirName)) return;
    newFunction();

    function newFunction() {
        throw new Error(`Folder not exist: ${dirName}`);
    }
}

export function getFilesList(path: string): Array<string> {
    return fs.readdirSync(path,"utf8");
}

export interface IDirСontents {
    FileName: string; // file name
    Path: string;     // relative path to file and file name ./dir/subdir/file.name
    Content: any;     // file's content
}

export function getFilesProps(root: string, FolderContentList: Array<string>):Array<IDirСontents> {
    let result:Array<IDirСontents> = [];
    FolderContentList.forEach(item => {
        result.push({
            FileName: item,
            Path: `${root}/${item}`,
            Content: fs.readFileSync(`${root}/${item}`, "utf8")
        } as IDirСontents);
    })
    return result;
}

export function getNameFromFileName(filename: string): string {
    let i = filename.lastIndexOf('.json');
    let s = filename.slice(0, i);
    return s;
}