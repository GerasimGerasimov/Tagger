import * as ini from '../inifile/inifile';
import { TVars } from './TVars'
import { TParameters } from './TParameters'
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
  //получаю содержимое секции [vars]
  const varsList: Array<string> = ini.getSectionListFromBuffer('vars', content);
  console.log(varsList);
  //преобразую [vars] в объект
  //для быстрого доступа к шкалам и вычислению их значений
  const vars:TVars = new TVars(varsList);
  console.log(vars.getScale('0,156'));
  console.log(vars.getScale('IsScale'));
  console.log(vars.getScale('IsScale*1,8'));
  console.log(vars.getScale('IrScale'));
  console.log(vars.getScale('IrScale%1,8'));
  console.log(vars.getScale('IrScale*1,8'));
  //теперь гружу секцию [FLASH] - параметры в ней, как ы CD имеют
  //опциональную часть в которой содержится уставка, в RAM такого нет
  //поэтому секции с уставками можно рассматривать как наиболее полно описывающие
  //параметры вообще
  //получаю содержимое секции [FLASH]
  const FlashList: Array<string> = ini.getSectionListFromBuffer('FLASH', content);   
  const flash:TParameters = new TParameters(vars, FlashList);
  console.log(flash);
  return;
}