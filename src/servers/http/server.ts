import http = require('http');
import cors = require('cors');
import express = require("express");
import bodyParser = require('body-parser');
import { IHostAPI, HostAPIFunc } from '../hostapi';

const app = express();
const jsonParser = bodyParser.json()

export default class HttpServer{
    public https: any;

    private port: number;
    private getDeviceData: HostAPIFunc  = undefined;
    private getDevicesInfo: HostAPIFunc  = undefined;
    private writeDeviceParameter: HostAPIFunc  = undefined;

   constructor (port: number, HostAPIs: IHostAPI) {
    this.port = port;
    this.getDeviceData  = HostAPIs.getDeviceData;
    this.getDevicesInfo = HostAPIs.getDevicesInfo;
    this.writeDeviceParameter = HostAPIs.writeDeviceParameter;
    this.init()
}

    private init () {
        app.use(cors({ origin: true }));

        app.route('/v1/devices/')
            .put   (jsonParser, [this.getDeviceTagsAPI.bind(this)])
        
        app.route('/v1/values/')
            .put (jsonParser, [this.setDeviceParametersAPI.bind(this)]);
        
        app.route('/v1/info/')
            .get   (jsonParser, [this.getDevicesInfoAPI.bind(this)])

        this.https = http.createServer(app).listen(this.port);
    }

    private getDeviceTagsAPI (request: any, response: any) {
            try {
                const data = this.getDeviceData(request.body)
                response.json( {status:'OK',
                                time: new Date().toISOString(),
                                data})
            } catch (e) {
                response.status(400).json({'status':'Error',
                                            'msg': e.message || ''})
            }
    }

    private getDevicesInfoAPI (request: any, response: any) {
        try {
            const data = this.getDevicesInfo(request.body)
            response.json( {status:'OK',
                            time: new Date().toISOString(),
                            data})
        } catch (e) {
            response.status(400).json({'status':'Error',
                                        'msg': e.message || ''})
        }
    }

    private async setDeviceParametersAPI(request: any, response: any){
        try {
            const data = await this.writeDeviceParameter(request.body)
            response.json( {status:'OK',
                            time: new Date().toISOString(),
                            data})
        } catch (e) {
            response.status(400).json({'status':'Error',
                                        'msg': e.message || ''})
        }
    }
}