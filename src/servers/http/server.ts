import http = require('http');
import express = require("express");
import bodyParser = require('body-parser');

const app = express();
const jsonParser = bodyParser.json()

interface getDeviceDataFunc {(request: Object): any;}

export default class HttpServer{
    public https: any;

    private port: number;
    private proc: getDeviceDataFunc  = undefined;

    constructor (port: number, proc: getDeviceDataFunc) {
        this.port = port;
        this.proc = proc;
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
            .put   (jsonParser, [this.getDeviceTags.bind(this)]);
        
        this.https = http.createServer(app).listen(this.port);
    }

    private async getDeviceTags (request: any, response: any) {
            try {
                const result = await this.proc(request.body)
                response.json( {'status':'OK',
                                'time': new Date().toISOString(),
                                'data':result})
            } catch (e) {
                response.status(400).json({'status':'Error',
                                            'msg': e.message || ''})
            }
    }
}