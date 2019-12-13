import * as ini from '../inifile/inifile';
import { TVars } from './TagTypes/TVars'
import { TParameters } from './TagTypes/TParameters'
import * as utils from '../utils/utils';
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

export interface IModelDevice {
    name: string;//название устройства (имя файла ini)
    ID: string;//строка идентификации
    ram:   TParameters;
    flash: TParameters;
    cd:    TParameters;
    vars:  TVars;
}

type NewType = Map<string, IModelDevice>;

export function getDevicesTagsMap(DevicesFilesProps:Array<utils.IDirСontents>): NewType {
  const result = new  Map<string, IModelDevice>();
  DevicesFilesProps.forEach(item => {
      result.set(item.FileName, getDeviceFromFile(item.FileName, item.Content));
  })
  return result;
}

export function getDevicesTags(DevicesFilesProps:Array<utils.IDirСontents>): Array<IModelDevice> {
  const result: Array<IModelDevice> = [];
  DevicesFilesProps.forEach(item => {
      result.push(getDeviceFromFile(item.FileName, item.Content))
  })
  return result;
}

export function getDeviceFromFile(name: string, content: any): IModelDevice {
  content = ini.loadLinesFromBuffer(content);
  console.log(content);
  //ID
  const IDList: Array<string> = ini.getSectionListFromBuffer('DEVICE', content);
  const ID:string = ini.getValueByKeyFromList('ID', IDList, '');
  //получаю содержимое секции [vars]
  const varsList: Array<string> = ini.getSectionListFromBuffer('vars', content);
  console.log(varsList);
  //преобразую [vars] в объект
  //для быстрого доступа к шкалам и вычислению их значений
  const vars:TVars = new TVars(varsList);
  /*
  console.log(vars.getScale('0,156'));
  console.log(vars.getScale('IsScale'));
  console.log(vars.getScale('IsScale*1,8'));
  console.log(vars.getScale('IrScale'));
  console.log(vars.getScale('IrScale%1,8'));
  console.log(vars.getScale('IrScale*1,8'));
  */
  //теперь гружу секцию [FLASH] - параметры в ней, как ы CD имеют
  //опциональную часть в которой содержится уставка, в RAM такого нет
  //поэтому секции с уставками можно рассматривать как наиболее полно описывающие
  //параметры вообще
  //получаю содержимое секции [FLASH]
  const FlashList: Array<string> = ini.getSectionListFromBuffer('FLASH', content);
  //распарсиваю ini-строки определяю тип объекта - это Модель-объекта   
  const flash:TParameters = new TParameters(vars, FlashList);
  //получаю содержимое секции [RAM]
  const RAMList: Array<string> = ini.getSectionListFromBuffer('RAM', content);
  //распарсиваю ini-строки определяю тип объекта - это Модель-объекта   
  const ram:TParameters = new TParameters(vars, RAMList);
  //получаю содержимое секции [CD]
  const CDList: Array<string> = ini.getSectionListFromBuffer('CD', content);
  //распарсиваю ini-строки определяю тип объекта - это Модель-объекта   
  const cd:TParameters = new TParameters(vars, CDList);
  //теперь надо переварить модели в контроллеры, а именно
  //есть слоты, есть параметры которые надо разместить в слотах
  //надо запустить порты, запустить линк-менеджеры, заполнить слоты,
  //организовать считывание данных
  const result: IModelDevice = {
    name,
    ID,
    ram,
    flash,
    cd,
    vars
  }
  return result;
}