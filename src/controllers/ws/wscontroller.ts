import WebSocket = require('ws');

interface handler {({}): any;}

export default class WSControl {

    private host: string;
    private ws:WebSocket;
    private hostState: boolean = false;
    private onIncomingMessage: handler;
    private onOpenConnection: handler;

    constructor ({ host,  onIncomingMessageHandler,  onOpenConnectionHandler }: { host: string; 
                                        onIncomingMessageHandler: handler;
                                        onOpenConnectionHandler: handler;
                                    }){
        this.host = host;
        this.onIncomingMessage =  onIncomingMessageHandler;
        this.onOpenConnection  =  onOpenConnectionHandler;
        this.initSocket();
    }

    public async send(payload: any){
        await this.waitForConnect();
        await this.waitBufferRelease();
        this.ws.send(JSON.stringify(payload));
    }

    // Инициализация сокета и восстановление связи
    private initSocket() {
        this.ws = new WebSocket(this.host);
        this.ws.onerror = this.onError.bind(this);
        this.ws.onopen = this.onOpen.bind(this);
        this.ws.onclose = this.onClose.bind(this);
        this.ws.onmessage = this.onMessage.bind(this);
    }

    private onOpen(event: any) {
        console.log(`Opened connection to ${this.host}`);
        if (this.onOpenConnection) {
            this.onOpenConnection('');
        }
        this.hostState = true;
    }    

    private onError(event: any) {
        console.log(`Error of connection to ${this.host} ${event}`);
    }

    private onClose(event: any) {
        console.log(`Closed connection to ${this.host}`);
        this.hostState = false;
        const timer = setTimeout(() => {
            console.log(`Try connect to ${this.host}`);
            clearTimeout(timer);
            this.initSocket();
        }, 3000);        
    }

    private onMessage(msg: any) {
        this.onIncomingMessage(msg.data);
    }

    private async waitForConnect(): Promise<string> {
        return new Promise(async (resolve, reject) => {
            if (this.hostState) return resolve('socket has connected');
            console.log('waitForConnect');
            const Timer = setInterval( ()=>{
                if (this.hostState) { 
                    clearInterval(Timer);
                    return resolve('socket has connected');
                }
            }, 100);
        })
    }

    //чтени сокета в режиме запрос-ожидание ответа- ответ
    private async waitBufferRelease(): Promise<any> {
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