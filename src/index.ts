import fs = require('fs');
import * as utils from './utils/utils';
import * as device from './devices/ModelDevice'
import THosts from './devices/THosts';
import TTagsSource from './devices/TTagsSource';
import TDevices from './devices/TDevices';
//читаю содержимое папки configuration
const Hosts: THosts = new THosts();
const TagsSource: TTagsSource = new TTagsSource();
const Devices: TDevices = new TDevices(TagsSource);

console.log(Devices);