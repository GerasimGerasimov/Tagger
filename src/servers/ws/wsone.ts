import WebSocket = require('ws');
import {validationJSON} from '../../utils/types'
import {TTask, TMessage, TRespond} from './types'
import {ErrorMessage} from '../../utils/errors'
import {randomStringAsBase64Url} from '../../utils/cryputils'

export class TSocketParameters {
    ws: WebSocket;
    onCloseAction: Function;
    onReceivedData: Function;
}

export class Socket {
    private ws: WebSocket
    public  commands: Set<TTask>;
    public ID: string = '';
    private onCloseAction: Function;
    private onReceivedData: Function;

    constructor (arg: TSocketParameters){
        this.ws = arg.ws;
        this.ID = randomStringAsBase64Url(4);
        this.onCloseAction = arg.onCloseAction;
        this.onReceivedData = arg.onReceivedData;
        this.ws.on('message', this.onMessage.bind(this));
        this.ws.on('close', this.onClose.bind(this))
    }

    public async send (message: any) {
        await this.waitBufferRelease();
        this.ws.send(JSON.stringify(message));
    }

    private async onMessage(message: any) {
        try {
            const request = validationJSON(message);
            await this.processReceivedData(request);
        } catch (e) {
            this.send(ErrorMessage(e.message || ''));
        }
    }

    private onClose(){
        console.log('Connection close');
        this.onCloseAction(this.ID);
    }

    /** Пример get - запроса
    {
        "cmd": "get",
        "ClientID": "oKHFgg", - клиент должен подставить свой ID в запрос
                                и думать о реконнекте если потеряет связь
        "payload": {
           "U1":{
             "RAM":"ALL"
            }
        }
    } 
     */

    private async processReceivedData(msg: TMessage) {
        const nowDate = new Date().getTime();
        var payload: any = {}
        if (this.onReceivedData) {
            payload = await this.onReceivedData(msg);
        }
        const respond: TRespond  = {
            ClientID: this.ID,
            MessageID: msg.MessageID || nowDate.toString(),
            cmd: msg.cmd,
            payload
        };
        console.log(`send to: ${this.ID} cmd:${msg.cmd} msgID: ${respond.MessageID}`)
        this.send(respond);
    }  

    //чтени сокета в режиме запрос-ожидание ответа- ответ
    public async waitBufferRelease(): Promise<any> {
        return new Promise((resolve, reject) => {
            var timeOutTimer: any = undefined;
            var chekBufferTimer: any = undefined;
            if (this.ws.bufferedAmount === 0)
                return resolve('OK, buffer is empty'); //буфер чист
            //ошибка, если буфер не очистился за 1 сек 
            timeOutTimer = setTimeout( () => {
                clearTimeout(timeOutTimer);
                clearInterval(chekBufferTimer);
                reject(new Error ('Time out, buffer does not empty'))
            }, 1000);
            //постоянная проверка буфера на очистку
            chekBufferTimer = setInterval( () => {
                if (this.ws.bufferedAmount === 0) {
                    clearTimeout(timeOutTimer);
                    clearInterval(chekBufferTimer);
                    return resolve('OK, buffer is empty'); //буфер чист
                }
            }, 1);
        });
    }

}