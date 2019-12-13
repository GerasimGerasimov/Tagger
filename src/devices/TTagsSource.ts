import * as utils from '../utils/utils';
import * as device from './ModelDevice'

const TagsDir: string = `${utils.ConfDirName}/ini`;//сдесь все ini c тегами

export default class TTagsSource {
    public Tags: Map<string, device.IModelDevice>
    constructor(){
        utils.validateFolderExistence(TagsDir);
        let TagsFilesList: Array<string> =  utils.getFilesList(TagsDir);
        let TagsFilesProps:Array<utils.IDirСontents> =  utils.getFilesProps(TagsDir, TagsFilesList);
        this.Tags = device.getDevicesTagsMap(TagsFilesProps);
    }
}