import WSControl from './wscontroller'
import {IErrorMessage} from '../../utils/types'

export default class HostController {

    private  wss: WSControl;
    
    constructor (host: string){
        this.wss = new WSControl(host);
    }
    
    public async waitForConnect(){
        await this.wss.waitForConnect();
    }

    public async putSlotSetToHost(host: string, Slot: any):Promise<any | IErrorMessage> {
        try {
            const payload: string = JSON.stringify({add:Slot});
            return await this.wss.send(payload)
                .then (this.validationJSON);
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