import WebSocket = require('ws');
import {IErrorMessage, ErrorMessage, validationJSON, randomStringAsBase64Url} from '../../utils/types'
import {TTask, TMessage} from './types'

export default class Socket {
    private ws: WebSocket
    public  commands: Set<TTask>;
    
    public ID: string = '';

    constructor (ws: WebSocket){
        this.ws = ws;
        this.ID = randomStringAsBase64Url(4);
        this.commands = new Set<TTask>();
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
            this.decodeCommand(request);
        } catch (e) {
            this.onTakeServerMessage(ErrorMessage(e.message || ''));
        }
    }

    private onClose(){
        console.log('Connection close');
    }

    private onTakeServerMessage(respond: any) {
        this.ws.send(JSON.stringify(respond));
    }

    private decodeCommand(msg: TMessage){
        const key = msg.Task.cmd;
        const commands = {
            'get'    : this.addCmdToList.bind(this),
            'default': () => {
                return ErrorMessage('Unknown command');
            }
        };
        (commands[key] || commands['default'])(msg)
    }

    private addCmdToList(msg: TMessage) {
        const respond = {
            confirm:msg.Task.MessageID
        }
        this.onTakeServerMessage(respond);
        this.commands.add(msg.Task);
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