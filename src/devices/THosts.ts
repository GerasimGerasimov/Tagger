import {THost} from './THost'
import * as utils from '../utils/utils';

const HostsDir: string = `${utils.ConfDirName}/nodes`;

//Карта Хостов
export class THosts {
    public HostsMap = new  Map<string, THost>();
    constructor(){
        utils.validateFolderExistence(HostsDir);
        let HostsDirList: Array<string> =  utils.getFilesList(HostsDir);
        let NodesFilesProps = utils.getFilesProps(HostsDir, HostsDirList);
        this.parseNodeList(NodesFilesProps);
    }
    public sendSlotSetsToHosts(){
        this.HostsMap.forEach((Host:THost)=>{
            Host.setSlotSetsToHost();
        })
    }

    private parseNodeList(props:Array<utils.IDirСontents>) {
        props.forEach(item => {
            var o = JSON.parse(item.Content)
            const Host:THost = new THost();
            Host.Name = o.name;
            Host.fieldbus = o.fieldbus;
            Host.URL = o.HOST.url;
            this.HostsMap.set(o.name, Host);
        })
    }
}