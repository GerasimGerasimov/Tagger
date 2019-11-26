import * as ini from '../inifile/inifile';
import { TVars } from './TVars'
//ini превращаю в теги типа
/*{ name: vteg_v1.15,
    RAM:{Iexc:{параметры}, , , , },
    FLASH:{, , , ,},
    CD:{, , , ,},
    vars:{, , , ,}

    под "параметры" я понимаю декодированную строку, типа:
    p03200=Usgz/Заданное напряжение статора/TFloat/x0040/r0020/B/1/4/0/
    буду класть параметры в SET поэтому названия должны быть уникальными
*/


interface IParameter {
    name: string;
}

interface IScale {
    name: string;
}

export interface IDevice {
    name: string;//название устройства (имя файла ini)
    ID: string;//строка идентификации
    RAM:   {Object<IParameter>()};
    FLASH: {Object<IParameter>()};
    CD:    {Object<IParameter>()};
    vars:  {Object<IScale>()};
}

export function getDeviceFromFile(content: any): IDevice {
  content = ini.loadLinesFromBuffer(content);
  console.log(content);
  const varsList: Array<string> = ini.getSectionListFromBuffer('vars', content);
  console.log(varsList);
  const vars:TVars = new TVars(varsList);
  console.log(vars.getScale('0,156'));
  console.log(vars.getScale('IsScale'));
  console.log(vars.getScale('IsScale*1,8'));
  console.log(vars.getScale('IrScale'));
  console.log(vars.getScale('IrScale%1,8'));
  console.log(vars.getScale('IrScale*1,8'));
  return;
}