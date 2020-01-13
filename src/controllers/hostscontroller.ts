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
            return {
                status: 'Error',
                msg: `Fetch Error: ${e.message}`
            } as IErrorMessage;
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
            return {status: 'Error', msg: 'Invalid JSON'} as IErrorMessage;
        }
    }

}