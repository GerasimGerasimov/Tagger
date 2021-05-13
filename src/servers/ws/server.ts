import WebSocket = require('ws');
interface getDeviceDataFunc {({}): any;}
import {Socket, TSocketParameters} from './wsone';

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
    }

    private init () {           
        this.wss = new WebSocket.Server({server: this.https});
        this.wss.on('connection', this.connectionOnWss.bind(this));
    }

    private connectionOnWss( ws: WebSocket) {
        let arg: TSocketParameters = {
            ws,
            onCloseAction: this.closeSocket.bind(this),
            onGetData: this.getData.bind(this)
        }
        let socket: Socket = new Socket(arg);
        this.sockets.add(socket);
        console.log(`Connection: ${socket.ID}`);
        //отправляю сообщение с идентификатором подключения
        socket.send({cmd:'id',
                     payload: socket.ID})
    }

    private closeSocket(ID: string){
      console.log(ID);
        try {
          for ( let socket of this.sockets) {
            if (socket.ID === ID) {
              this.sockets.delete(socket);
              console.log(`Connection ${ID} has closed`);
              break;
            }
          }
        } catch (e) {
            console.log(e);
        } 
    }

    private getData(request: any): any {
        const payload = this.proc(request);
        return payload;
    }

}