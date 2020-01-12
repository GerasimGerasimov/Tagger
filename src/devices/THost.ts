import {TSlotSet} from '../slots/TSlotSet'
import {IErrorMessage} from '../utils/types'
const fetch = require('node-fetch');

export class THost {
    public Name: string;
    public fieldbus: string = '';//адрес в сети или полевой шине
    public URL: string = 'localhost';

    public SlotsMap = new  Map<string, TSlotSet>();

    public addSlotToMap(Slot: TSlotSet){
        this.SlotsMap.set(Slot.ID, Slot)
    }

    //передам СлотСеты реальному хосту используя API PUT /v1/slots/
    public async setSlotSetsToHost(){
        for (const Slot of this.SlotsMap.values()) {
            console.log(Slot);
            try {
                await this.putSlotSetToHost(Slot)
            } catch (e) {
                console.log(e);
            }
        }
    }

    private async putSlotSetToHost(Slot: TSlotSet):Promise<any | IErrorMessage> {
        try {
            const header: any = {
                method: 'PUT',
                mode: 'cors',
                cache: 'no-cache',
                headers: {
                    'Content-Type':'application/json; charset=utf-8',
                },
                body:JSON.stringify(Slot)
            }
            return await fetch(`${this.URL}/v1/slots/`, header)
                .then (this.handledHTTPResponse)
                .then (this.validationJSON);
        } catch(e) {
            console.log(e);
            return {
                status: 'Error',
                msg: `Fetch Error: ${e.message}`
            } as IErrorMessage;
        }
    }

    private handledHTTPResponse (response: any) {
        if (response.status === 404) throw new Error ('Url not found');
        return response.text();
    }

    private validationJSON (data: any): any | IErrorMessage {
        try {
            return JSON.parse(data);
        } catch (e) {
            return {status: 'Error', msg: 'Invalid JSON'} as IErrorMessage;
        }
    }
    
    

}