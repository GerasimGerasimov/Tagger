import WebSocket = require('ws');
import {IErrorMessage, ErrorMessage, validationJSON} from '../../utils/types'

interface getDeviceDataFunc {(request: Object): any;}

export default class WSServer {
    private https: any;
    private wss: any;

    private proc: getDeviceDataFunc  = undefined;

    constructor (https: any, proc: getDeviceDataFunc) {
        this.https = https;
        this.proc = proc;;
        this.init()
    }

    private init () {           
        this.wss = new WebSocket.Server({server: this.https});
        this.wss.on('connection', this.connectionOnWss.bind(this));
    }

    private connectionOnWss( ws: WebSocket) {
        console.log('Connection');
        ws.on('message', this.onMessage.bind(this, ws));
        ws.on('close', this.onClose.bind(this, ws))
    }

    private async onMessage(ws: WebSocket, message: any) {
        var result: any;
        try {
            const request = validationJSON(message);
            result = await this.decodeCommand(request);
        } catch (e) {
            result = ErrorMessage(e.message || '');
        }
        ws.send(JSON.stringify(result));
    }

    private onClose(ws: WebSocket){
        console.log('Connection close');
    }

    private async decodeCommand(cmd: any): Promise<any | IErrorMessage> {
        const key = this.getCmdName(cmd);
        const commands = {
            'get'    : this.getDeviceTags.bind(this),
            'default': () => {
                return ErrorMessage('Unknown command');
            }
        }
        return await (commands[key] || commands['default'])(cmd[key])
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