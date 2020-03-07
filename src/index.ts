import {THosts} from './client/THosts';
import {TDevices} from './devices/TDevices';
import TTagsSource from './devices/TTagsSource';
import {initSlotSets} from './initslotsets/InitSlotSets';
import Tagger from './Tagger/Tagger';
import {AppServer, IServer} from "./servers/http/server";

const Hosts: THosts = new THosts();
const TagsSource: TTagsSource = new TTagsSource();
const Devices: TDevices = new TDevices(TagsSource);
Tagger._initialize(Hosts, Devices);

initSlotSets(Hosts, Devices);

const Server: IServer = new AppServer(5004, Tagger.getgetDeviceData);
console.log('Tagger Service started');
Server.serve();