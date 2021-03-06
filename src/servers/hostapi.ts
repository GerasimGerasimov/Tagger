export interface HostAPIFunc {(request: Object): any;}

export interface IHostAPI {
    getDeviceData: HostAPIFunc;
    getDevicesInfo: HostAPIFunc;
    writeDeviceParameter: HostAPIFunc;
}