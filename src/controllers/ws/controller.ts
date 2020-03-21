import WSControl from './wscontroller'
import {IErrorMessage, IServiceRespond, validationJSON, ErrorMessage} from '../../utils/types'

export default class HostController {

    private  wss: WSControl;
    private onIncomingMessage: Function = undefined;
    
    constructor (host: string, handler: Function){
        this.wss = new WSControl(host, this.checkIncomingMessage.bind(this));
        this.onIncomingMessage = handler;
    }
    
    public checkIncomingMessage(msg: any) {
        let respond: any = validationJSON(msg);
            respond = this.handledIncomingData(respond);
        if (this.onIncomingMessage) this.onIncomingMessage(respond);
    }

    public handledIncomingData(respond: any): IServiceRespond | IErrorMessage {
        try {
            this.handleStatusField(respond);
            this.handleErrorStatus(respond);
            return respond as IServiceRespond;
        } catch (e) {
            return ErrorMessage (e.message);
        }
    }

    private handleStatusField (respond: any): void {
        if (!respond.status) throw new Error ('Status field does not exist');
    }

    private handleErrorStatus(respond: any): void {
        if (respond.status === 'Error') throw new Error (respond.msg);
    }

    public async putSlotSetToHost(host: string, Slot: any):Promise<any | IErrorMessage> {
        try {
            await this.wss.send({add:Slot})
        } catch(e) {
            console.log(e);
            throw new Error (`Fetch Error: ${e.message}`);
        }
    }

    public async getSlotDataByID(host: string, ID: string):Promise<any | IErrorMessage> {
        try {
            const payload: string = JSON.stringify({get:ID});
            return await this.wss.send(payload)
                .then (this.validationJSON);
        } catch(e) {
            console.log(e);
            throw new Error (`Fetch Error: ${e.message}`);
        }
    }

    public async getRequiredSlotsData(host: string, required: Array<string>):Promise<any | IErrorMessage> {
        return new Promise(async (resolve, reject) => {
            try {
                const payload: string = JSON.stringify({get:required});
                const result = await this.wss.send(payload)
                               .then (this.validationJSON);
                return resolve (result);
            } catch(e) {
                console.log(e);
                reject (new Error (`Fetch Error: ${e.message}`));
            }
        });
    }    

    private validationJSON (data: any): any | IErrorMessage {
        try {
            return JSON.parse(data);
        } catch (e) {
            throw new Error ('Invalid JSON');
        }
    }
}