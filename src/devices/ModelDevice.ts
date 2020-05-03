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
    ID: string;//строка идентификации
    Description: string;//описание
    ram:   TParameters;
    flash: TParameters;
    cd:    TParameters;
    vars:  TVars;
    pages: Array<string>;
}

type NewType = Map<string, IModelDevice>;

export function getDevicesTagsMap(DevicesFilesProps:Array<utils.IDirСontents>): NewType {
  const result = new  Map<string, IModelDevice>();
  DevicesFilesProps.forEach(item => {
      result.set(item.FileName, getDeviceFromFile(item.Content));
  })
  return result;
}

export function getDeviceFromFile(content: any): IModelDevice {
  content = ini.loadLinesFromBuffer(content);
  //ID
  const IDList: Array<string> = ini.getSectionListFromBuffer('DEVICE', content);
  const ID:string = ini.getValueByKeyFromList('ID', IDList, '');
  const Description:string = ini.getValueByKeyFromList('Description', IDList, '');
  const pages: Array<string> = ini.getSectionListFromBuffer('PAGES', content);
  //получаю содержимое секции [vars]
  const varsList: Array<string> = ini.getSectionListFromBuffer('vars', content);
  //преобразую [vars] в объект
  //для быстрого доступа к шкалам и вычислению их значений
  const vars:TVars = new TVars(varsList);
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
    ID,
    Description,
    ram,
    flash,
    cd,
    vars,
    pages
  }
  return result;
}

export function getParametersForJSON(p: TParameters): any {
  return p.getParametersForJSON();
}