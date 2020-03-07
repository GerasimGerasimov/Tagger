import {THost} from './THost'
import * as utils from '../utils/utils';
import path = require('path');

//const HostsDir: string = `${utils.ConfDirName}/nodes`;
const HostsDir: string = path.resolve(__dirname,`../../${utils.ConfDirName}/nodes`);
//Карта Хостов
export class THosts {
    public HostsMap = new  Map<string, THost>();
    constructor(){
        utils.validateFolderExistence(HostsDir);
        let HostsDirList: Array<string> =  utils.getFilesList(HostsDir);
        let NodesFilesProps = utils.getFilesProps(HostsDir, HostsDirList);
        this.parseNodeList(NodesFilesProps);
    }
    public async sendSlotSetsToHosts(){
        for (const Host of this.HostsMap.values()) {
            await Host.setSlotSetsToHost();
        }
    }

    private parseNodeList(props:Array<utils.IDirСontents>) {
        props.forEach(item => {
            var o = JSON.parse(item.Content)
            const Host:THost = new THost(o.HOST.url);
            Host.Name = o.name;
            Host.fieldbus = o.fieldbus;
            this.HostsMap.set(o.name, Host);
        })
    }

    public getHostByName(name: string) {
        return this.HostsMap.get(name);
    }
}