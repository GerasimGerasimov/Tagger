import express = require("express");
import bodyParser = require('body-parser');

const app = express();
const jsonParser = bodyParser.json()

export interface IServer {
    serve (): void;
}

interface getDeviceDataFunc {(request: Object): any;}

export class AppServer implements IServer{

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

    public serve (): void {
        app.route('/v1/devices/')
            .put   (jsonParser, [this.getDeviceTags.bind(this)]);

        app.listen(this.port);
    } 
}