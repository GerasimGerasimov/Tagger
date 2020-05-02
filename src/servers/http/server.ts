import http = require('http');
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

   constructor (port: number, HostAPIs: IHostAPI) {
    this.port = port;
    this.getDeviceData  = HostAPIs.getDeviceData;
    this.getDevicesInfo = HostAPIs.getDevicesInfo;
    this.init()
}

    private init () {
        app.all('*', function(req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "X-Requested-With");
            res.header('Access-Control-Allow-Headers', 'Content-Type');
            res.setHeader('Access-Control-Allow-Headers', 'origin, content-type, accept');
            next();
        });

        app.route('/v1/devices/')
            .put   (jsonParser, [this.getDeviceTagsAPI.bind(this)]);
 
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
}