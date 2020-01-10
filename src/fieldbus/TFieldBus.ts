import * as device from '../devices/ModelDevice'

//результат выполнения TFieldBus.createSlot
export class TSlotSet {
    ID: string = ''; //ID слота
    cmd: Array<any> = []; //команда слейву
    interval?: number = 0; //частота активации слота в милисекундах
    NotRespond: boolean = false;//true - команда в out не требует ответа на неё
    TimeOut: number = 100;//время ожидания ответа устройства
}

class TTimeOut {
    read:number = 100;
    write:number = 100;
}

export class TSlotSource {
    interval: number = 1000;
    NotRespond: boolean =  false;
    range: any; //String = all //Object = {from: "p06402", to: "p08700"}
    section: string = "RAM";
    TimeOut: TTimeOut  = {
        read: 100,
        write: 100
    }
}

export abstract class TFieldBus {
    public FieldBusAddr: number = 1;
    private tags: device.IModelDevice;
    constructor(){}

    set Tags(tags: device.IModelDevice) {
        this.tags = tags;
    }

    get Tags(): device.IModelDevice {
        return this.tags
    }

    public getTagsBySection(section:string): device.IModelDevice {
        return this.tags[section.toLowerCase()];
    }

    createSlot(PositionName: string, Source: TSlotSource):  TSlotSet {
        let result: TSlotSet;
        return result;
    }
}