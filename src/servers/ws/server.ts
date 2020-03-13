
import WebSocket = require('ws');
import {IErrorMessage, ErrorMessage, validationJSON} from '../../utils/types'
interface getDeviceDataFunc {({}): any;}
import Socket from './wsone';
import {TTask, TMessage} from './types'

export default class WSServer {
    private https: any;
    private wss: any;
    private sockets: Set<Socket>;
    private count: number = 0;

    private proc: getDeviceDataFunc  = undefined;

    constructor (https: any, proc: getDeviceDataFunc) {
        this.https = https;
        this.proc = proc;
        this.sockets = new Set<Socket>();
        this.init();
        this.cycle();
    }

    private init () {           
        this.wss = new WebSocket.Server({server: this.https});
        this.wss.on('connection', this.connectionOnWss.bind(this));
    }

    private connectionOnWss( ws: WebSocket) {
        console.log('Connection');
        let socket: Socket = new Socket(ws);
        this.sockets.add(socket);
        socket.send({id: socket.ID})
    }

    private async cycle() {
        while (true) {
            try {
                for (let socket of this.sockets.values()) {
                    for (let task of socket.commands.values()) {
                        console.log(this.count++, task);
                        const respond = await this.decodeCommand(task);
                        socket.send(respond);
                    }
                }
            } catch (e) {
                console.log(`Error: ${e}`);
            }
            await this.delay(1);
        }
    }

    private async delay(ms: number): Promise<any> {
        return new Promise((resolve, reject) => {
          setTimeout(resolve, ms);
        });
    }
    private async decodeCommand(task: TTask): Promise<any>{
        const key = task.cmd;
        const commands = {
            'get'    : this.getData.bind(this),
            'default': () => {
                return ErrorMessage('Unknown command');
            }
        };
        return (commands[key] || commands['default'])(task)
    }

    private async getData(task:TTask): Promise<any>{
        const result = await this.proc(task.payload);
        return {get:result};
    }
}