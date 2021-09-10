import { ConfigPath } from './utils/configpath';
import {THosts} from './client/THosts';
import {TDevices} from './devices/TDevices';
import TTagsSource from './devices/TTagsSource';
import {initSlotSets} from './initslotsets/InitSlotSets';
import Tagger from './Tagger/Tagger';
import HttpServer from "./servers/http/server";
import WSServer from "./servers/ws/server";
import { IHostAPI } from './servers/hostapi';

console.log(ConfigPath);

const Hosts: THosts = new THosts();
const TagsSource: TTagsSource = new TTagsSource();
const Devices: TDevices = new TDevices(TagsSource);
Tagger._initialize(Hosts, Devices);

initSlotSets(Hosts, Devices);

const HostAPIs: IHostAPI  = {
    getDeviceData: Tagger.getDeviceData,
    getDevicesInfo: Tagger.getDevicesInfo,
    writeDeviceParameter: Tagger.writeDeviceParameter
  }

const Server: HttpServer = new HttpServer(5004, HostAPIs);
const WSS: WSServer = new WSServer(Server.https, HostAPIs);
console.log('Tagger Service started');