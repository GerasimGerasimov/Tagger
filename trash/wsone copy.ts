import WebSocket = require('ws');
import {IErrorMessage, ErrorMessage, validationJSON} from '../../utils/types'

//interface getDeviceDataFunc {(request: Object): any;}
interface getDeviceDataFunc {(request: Object, callback: any): any;}

export default class Socket {
    private ws: WebSocket
    private proc: getDeviceDataFunc  = undefined;
    private commands: any;

    constructor (ws: WebSocket, proc: getDeviceDataFunc){
        this.ws = ws;
        this.proc = proc;
        this.commands = {
            'get'    : this.getDeviceTags.bind(this),
            'default': () => {
                return ErrorMessage('Unknown command');
            }
        }
        this.ws.on('message', this.onMessage.bind(this));
        this.ws.on('close', this.onClose.bind(this))
    }

    private async onMessage(message: any) {
        var result: any;
        try {
            const request = validationJSON(message);
            result = await this.decodeCommand(request);
        } catch (e) {
            result = ErrorMessage(e.message || '');
        }
        this.ws.send(JSON.stringify(result));
    }

    private onClose(){
        console.log('Connection close');
    }

    private async decodeCommand(cmd: any): Promise<any | IErrorMessage> {
        const key = this.getCmdName(cmd);
        return await (this.commands[key] || this.commands['default'])(cmd[key])
    }

    private getCmdName(cmd: any): string {
        for (let key in cmd) {
            return key;
          }
        throw new Error ('Invalid request format');
    }

    private async getDeviceTags (request: any): Promise<any | IErrorMessage> {
        try {
            const result = await this.proc(request)
            return {status:'OK',
                    time: new Date().toISOString(),
                    data:result}
        } catch (e) {
            return ErrorMessage(e.message || '');
        }
    }    
}