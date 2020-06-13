import {IErrorMessage} from './errors'

export interface IParsedAnswer {
    addr: Number,
    cmd: Number,
    msg: Array<number>
}

export interface IServiceRespond extends IErrorMessage {
    duration?: number,
    time?: Date 
}

export interface ICmdToServer {
    cmd:Array<number>,
    timeOut: Number,
    NotRespond: boolean
}

export function validationJSON (data: any): any | IErrorMessage {
    try {
        return JSON.parse(data);
    } catch (e) {
        return {status: 'Error', msg: 'Invalid JSON'} as IErrorMessage;
    }
}
