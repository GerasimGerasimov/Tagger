import * as utils from '../utils/utils';

const HostsDir: string = `${utils.ConfDirName}/nodes`;

//Карта Хостов
class THost {
    fieldbus: string = '';//адрес в сети или полевой шине
    URL: string = 'localhost';
    port: number = 5000;
}

export default class THosts {
    public HostsMap = new  Map<string, THost>();
    constructor(){
        utils.validateFolderExistence(HostsDir);
        let HostsDirList: Array<string> =  utils.getFilesList(HostsDir);
        let NodesFilesProps = utils.getFilesProps(HostsDir, HostsDirList);
        this.parseNodeList(NodesFilesProps);
    }

    private parseNodeList(props:Array<utils.IDirСontents>) {
        props.forEach(item => {
            var o = JSON.parse(item.Content)
            const Host:THost = new THost();
            Host.fieldbus = o.fieldbus;
            Host.URL = o.HOST.url;
            Host.port = o.HOST.port;
            this.HostsMap.set(o.name, Host);
        })
    }
}