
import WebSocket = require('ws');
import {IErrorMessage, ErrorMessage, validationJSON} from '../../utils/types'
interface getDeviceDataFunc {(request: Object): any;}
import Socket from './wsone';

export default class WSServer {
    private https: any;
    private wss: any;
    private sockets: Set<Socket>;

    private proc: getDeviceDataFunc  = undefined;

    constructor (https: any, proc: getDeviceDataFunc) {
        this.https = https;
        this.proc = proc;
        this.sockets = new Set<Socket>();
        this.init()
    }

    private init () {           
        this.wss = new WebSocket.Server({server: this.https});
        this.wss.on('connection', this.connectionOnWss.bind(this));
    }

    private connectionOnWss( ws: WebSocket) {
        console.log('Connection');
        let socket: Socket = new Socket(ws, this.proc);
        this.sockets.add(socket);
    }
}