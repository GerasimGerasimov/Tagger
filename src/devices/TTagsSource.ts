import * as Utils from '../utils/utils';
import * as device from './ModelDevice';

const TagsDir: string = Utils.getAbsDirPath('ini');

export default class TTagsSource {
    public Tags: Map<string, device.IModelDevice>
    constructor(){
        Utils.validateFolderExistence(TagsDir);
        let TagsFilesList: Array<string> =  Utils.getFilesList(TagsDir);
        let TagsFilesProps:Array<Utils.IDirСontents> =  Utils.getFilesProps(TagsDir, TagsFilesList);
        this.Tags = device.getDevicesTagsMap(TagsFilesProps);
    }
}