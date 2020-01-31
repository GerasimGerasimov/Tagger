import * as utils from '../utils/utils';
import * as device from './ModelDevice';
import TTagsSource from './TTagsSource';

const DevicesDir: string = `${utils.ConfDirName}/devices`;//ту хранятся U1, U2 и т.п.

export class TNodeDevices {
    addr: number;
    host: string;
    source: string;
    slots:Object = {}
}

export class TAddressableDevice {
    host: string = '';//имя хоста
    source: string = ''; //название ini-файла
    PositionName: string = ''; //обозначение устройства на схеме
    FieldBusAddr: number = 1;//адрес в сети или полевой шине
    Tags: device.IModelDevice = undefined;//доступные теги, требуется последующее заполнение
    SlotsDescription: Object = {};//описание слотов в JSON-формате, требуется последующая обработка
}

export class TSlotDataRequest {
    SectionName: string = '';
    SlotName: string ='';
    Request: any;
}

export class TSlotsDataRequest {
    AddressableDevice: TAddressableDevice = undefined;
    SlotDataRequest:Array<TSlotDataRequest> = [];
    get Host(): string {
        return this.AddressableDevice.host;
    }
    get PositionName(): string {
        return this.AddressableDevice.PositionName;
    }    
}

export class TDevices {
    public DevicesMap = new  Map<string, TAddressableDevice>();

    constructor(TagsSource: TTagsSource){
        utils.validateFolderExistence(DevicesDir);
        let DevicesFilesList: Array<string> =  utils.getFilesList(DevicesDir);
        let DevicesFilesProps:Array<utils.IDirСontents> =  utils.getFilesProps(DevicesDir, DevicesFilesList);
        this.parseNodeDevList(DevicesFilesProps);
        this.bindTagsSourceToDevTags(TagsSource);
    }

    private parseNodeDevList(devs: Array<utils.IDirСontents>): any {
        devs.forEach((item)=>{
            var o:TNodeDevices = JSON.parse(item.Content);
            const name = utils.getNameFromFileName(item.FileName);
            const result = this.DevicesMap.get(name);
            if (result === undefined) {
                let device: TAddressableDevice = this.createNewAddressableDevice(name, o)//создать объект привязанный к U1
                this.DevicesMap.set(name, device);
            } else {
                console.log(`Device: ${name} at addr: ${o.addr} already exists`)
            }
        })
    }

    private createNewAddressableDevice(name:string, item:TNodeDevices): TAddressableDevice {
        let result:  TAddressableDevice = new  TAddressableDevice();
        result.host = item.host;
        result.source = item.source;
        result.FieldBusAddr = item.addr;
        result.PositionName = name;
        result.SlotsDescription = item.slots;    
        return result;
    }

    //Связываю Tags в Ux с source
    private fillTags(source: string, TagsSource: TTagsSource):device.IModelDevice {
        let o = TagsSource.Tags.get(source);
        return o;
    }
    //DevsTags: Array<device.IModelDevice>
    //DevicesMap: Map<string, TAddressableDevice>
    private bindTagsSourceToDevTags(TagsSource: TTagsSource){
        for (let key of this.DevicesMap.keys()) {
            let dev: TAddressableDevice = this.DevicesMap.get(key);
            dev.Tags = this.fillTags(dev.source, TagsSource);
        }
    }

    public getAddressableDeviceByPositionName(req: any): TAddressableDevice {
        for (const key in req) {
            //будет только один объект
            if (this.DevicesMap.has(key))
                return this.DevicesMap.get(key)
                else   throw new Error (`${key} doesn't exist in DevicesMap`)
        }
    }

    public getSlotsDataRequest(req: any): TSlotsDataRequest {
        const result:TSlotsDataRequest = new TSlotsDataRequest ();
        try {
            for (const key in req) {//key - название устройства (типа U1)        
                if (this.DevicesMap.has(key))
                    result.AddressableDevice = this.DevicesMap.get(key)
                else 
                    throw new Error (`${key} doesn't exist in DevicesMap`)
                //теперь в req найти объекты 2-го уровня вложенности
                const NestedObjects: any = req[key];
                for (let key in NestedObjects) {
                    const SlotDataRequest: TSlotDataRequest = new TSlotDataRequest ()
                    SlotDataRequest.SectionName = key;
                    SlotDataRequest.SlotName = `${result.PositionName}:${SlotDataRequest.SectionName}`;
                    SlotDataRequest.Request = NestedObjects[key];
                    result.SlotDataRequest.push(SlotDataRequest);
                }
            }
        } catch (e) {
            throw new Error (`Wrong reguest ${req}: ${e}`)
        }     
        return result
    }
}