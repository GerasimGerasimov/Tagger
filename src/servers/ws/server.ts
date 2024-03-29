import { ErrorMessage } from '../../utils/errors';
import WebSocket = require('ws');
import { HostAPIFunc, IHostAPI } from '../hostapi';
import { TMessage } from './types';
interface getDeviceDataFunc {({}): any;}
import {Socket, TSocketParameters} from './wsone';

export default class WSServer {
    private https: any;
    private wss: any;
    private sockets: Set<Socket>;

    private getDeviceData: HostAPIFunc  = undefined;
    private getDevicesInfo: HostAPIFunc  = undefined;
    private writeDeviceParameter: HostAPIFunc  = undefined;

    constructor (https: any,  HostAPIs: IHostAPI) {
        this.https = https;
        this.getDeviceData  = HostAPIs.getDeviceData;
        this.getDevicesInfo = HostAPIs.getDevicesInfo;
        this.writeDeviceParameter = HostAPIs.writeDeviceParameter;
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
            onReceivedData: this.decodeCommand.bind(this)
        }
        //передать в новый сокет серверную функцию, которую сокет будет
        //вызывать при получении данных.
        //Получил данные - вызвал серверную функцию
        //Она разбирает полученный пакет, готовит ответ (payload)
        //и возвращает управление сокету, который уже отправляет данные
        //снабжая дополнительной информацеий (своим ID)
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

    private isAutorizedClient(ID: string): never | any {
      for ( let socket of this.sockets) {
        if (socket.ID === ID) return;
      }
      throw new Error(`Client ${ID} isn't autorized`);
    }

    private async decodeCommand(msg: TMessage): Promise<any> {
      this.isAutorizedClient(msg.ClientID);
      const key = msg.cmd;
      const commands = {
          'getInfo'      : this.getInfo.bind(this),
          'getValues'    : this.getValues.bind(this),
          'setValue'    : this.setValue.bind(this),
          'default': () => {
              return ErrorMessage('Unknown command');
          }
      };
      return await (commands[key] || commands['default'])(msg)
  }

    private getInfo(request: any): any {
      const data = this.getDevicesInfo(request);
      return {status:'OK',
              time: new Date().toISOString(),
              data};
    }

    private getValues(request: any): any {
      const data = this.getDeviceData(request.payload);
      return {status:'OK',
              time: new Date().toISOString(),
              data
            };
    }

    private async setValue(request: any): Promise<any> {
      const data = await this.writeDeviceParameter(request.payload);
      return {status:'OK',
              time: new Date().toISOString(),
              data }
    }
}