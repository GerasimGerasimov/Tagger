const fetch = require('node-fetch');
import {IErrorMessage} from '../../utils/errors'

export default class HostController {

    constructor (host: string){
    }

    public async putSlotSetToHost(host: string, Slot: any):Promise<any | IErrorMessage> {
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
            return await fetch(`${host}/v1/slots/`, header)
                .then (this.handledHTTPResponse)
                .then (this.validationJSON);
        } catch(e) {
            console.log(e);
            throw new Error (`Fetch Error: ${e.message}`);
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
            throw new Error ('Invalid JSON');
        }
    }

    public async getSlotDataByID(host: string, ID: string):Promise<any | IErrorMessage> {
        try {
            const header: any = {
                method: 'GET',
                mode: 'cors',
                cache: 'no-cache',
                headers: {
                    'Content-Type':'application/json; charset=utf-8',
                }
            }
            const url:string = `${host}/v1/slot/${ID}`;
            return await fetch(url, header)
                .then (this.handledHTTPResponse)
                .then (this.validationJSON);
        } catch(e) {
            console.log(e);
            throw new Error (`Fetch Error: ${e.message}`);
        }
    }

    public async getRequiredSlotsData(host: string, required: Array<string>):Promise<any | IErrorMessage> {
        try {
            const header: any = {
                method: 'PUT',
                mode: 'cors',
                cache: 'no-cache',
                headers: {
                    'Content-Type':'application/json; charset=utf-8',
                },
                body:JSON.stringify({slots:required})
            }
            const url:string = `${host}/v2/slots/`;
            return await fetch(url, header)
                .then (this.handledHTTPResponse)
                .then (this.validationJSON);
        } catch(e) {
            console.log(e);
            throw new Error (`Fetch Error: ${e.message}`);
        }
    }    

}