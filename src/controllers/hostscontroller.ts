const fetch = require('node-fetch');
import {IErrorMessage} from '../utils/types'

export default class HostController {

    public static async putSlotSetToHost(host: string, Slot: any):Promise<any | IErrorMessage> {
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

    private static handledHTTPResponse (response: any) {
        if (response.status === 404) throw new Error ('Url not found');
        return response.text();
    }

    private static validationJSON (data: any): any | IErrorMessage {
        try {
            return JSON.parse(data);
        } catch (e) {
            throw new Error ('Invalid JSON');
        }
    }

    public static async getSlotDataByID(host: string, ID: string):Promise<any | IErrorMessage> {
        try {
            const header: any = {
                method: 'GET',
                mode: 'cors',
                cache: 'no-cache',
                headers: {
                    'Content-Type':'application/json; charset=utf-8',
                }
            }
            return await fetch(`${host}/v1/slots/${ID}`, header)
                .then (this.handledHTTPResponse)
                .then (this.validationJSON);
        } catch(e) {
            console.log(e);
            throw new Error (`Fetch Error: ${e.message}`);
        }
    }

}