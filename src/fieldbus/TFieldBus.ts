import * as device from '../devices/ModelDevice'
import {TSlotSet, TSlot} from '../slots/TSlotSet'

class TTimeOut {
    read:number = 100;
    write:number = 100;
}

export class TSlotSource {
    interval: number = 1000;
    NotRespond: boolean =  false;
    range: any; //String = all //Object = {from: "Ixec", to: "Uexc"}
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

    public createReadSlot(PositionName: string, Source: TSlotSource):  TSlotSet {
        let result: TSlotSet;
        return result;
    }

    public createWriteSlot(PositionName: string, Source: TSlotSource, regsValues: Map<string, any>):  TSlotSet {
        let result: TSlotSet;
        return result;
    }

    public checkHeaderOfAnswer(slot:TSlot) {
    }

    public checkRequiredData(data: Array<any>, slot:TSlot){

    }
    public getRawData(data: Array<any>): Array<any> {
        return[]
    }

    public convertRawDataToMap(RawData: Array<any>, firstReg: number): Map<number, any> {
        return new Map(RawData);
    }
}