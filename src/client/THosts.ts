import {THost} from './THost'
import * as Utils from '../utils/utils';

const HostsDir: string = Utils.getAbsDirPath('nodes');

//Карта Хостов
export class THosts {
    public HostsMap = new  Map<string, THost>();
    constructor(){
        Utils.validateFolderExistence(HostsDir);
        let HostsDirList: Array<string> =  Utils.getFilesList(HostsDir);
        let NodesFilesProps = Utils.getFilesProps(HostsDir, HostsDirList);
        this.parseNodeList(NodesFilesProps);
    }
    public async sendSlotSetsToHosts(){
        for (const Host of this.HostsMap.values()) {
            await Host.setSlotSetsToHost();
        }
    }

    private parseNodeList(props:Array<Utils.IDirСontents>) {
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