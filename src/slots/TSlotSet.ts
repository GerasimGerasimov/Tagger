export class TDeviceAnswer {
    status: string;
    duration:number;
    time:any;
    data:Object;
}

interface ISlotCallBack {
    (Slot:TSlot): any;
}

export class TSlot {
    status: string = ''
    msg: any;
    slotSet: TSlotSet = undefined;
    time?: string;//время последнего валидного обновления данных 
    duration: number;//время выполнения запроса
    onFulfilled?: ISlotCallBack = undefined;//слот выполнился успешно
    onRejected?: ISlotCallBack = undefined;//слот завершился неудачно
}

export class TSlotSet {
    ID: string = ''; //ID слота
    cmd: Array<any> = []; //команда слейву
    interval?: number = 0; //частота активации слота в милисекундах
    NotRespond: boolean = false;//true - команда в out не требует ответа на неё
    TimeOut: number = 100;//время ожидания ответа устройства
    RegsRange:TRegsRange = undefined;
    commandType: TCommadType;
}

export const enum TCommadType {
    ReadMultiplayRegisters,
    WriteMultiplayRegisters
}

export class TRegsRange {
    first: number = 0;
    last: number = 0;
    count: number = 0;//кол-во регистров для чтения
}