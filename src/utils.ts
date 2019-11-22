import fs = require('fs');

export function validateFolderExistence(dirName: string): void {
    if (!fs.existsSync(dirName)) throw new Error(`Folder not exist: ${dirName}`)
}

export function getFilesList(path: string): Array<string> {
    return fs.readdirSync(path,"utf8");
}

export interface IDirСontents {
    FileName: string;
    Path: string;
    Content: any;
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