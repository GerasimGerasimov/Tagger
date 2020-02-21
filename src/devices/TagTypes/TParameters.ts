//Контейнер для параметров из RAM/FLASH/CD
import { TVars } from './TVars'; // шкалы
import { TSignal } from './TSignal';
import { TBit } from './TBit';
import { TU16 } from './TU16';
import { TU8 } from './TU8';
import { TS16 } from './TS16';
 
export class TParameters {
    private vars:TVars;
    private ValuesMap: Map<string, TSignal>;

    constructor (vars:TVars, ParametersList: Array<string>) {
        this.vars = vars;
        this.ValuesMap = new Map<string, TSignal>();
        this.parseListToMap(ParametersList); 
    }

    get valuesMap(): Map<string, TSignal> {
        return this.ValuesMap;
    }

    public setDataToParameters(data: Array<any>, startRegNumber: number) {
        this.ValuesMap.forEach((signal: TSignal) => {
            signal.setDataToParameter(data);
        });
    }

    private getObjTypeFromIni(ini: string): string {
        const i = ini.indexOf('=');
        const value: Array<string> = ini.slice(i+1).split(/[/]/);// получил массив
              value.splice(value.length-1,1);
        return value[2];
    }

    private factory (ini: string): TSignal {
        const ObjType = this.getObjTypeFromIni(ini);
        const ObjTypes = {
            'TBit'  : () => {return new TBit(ini, this.vars)},
            'TWORD' : () => {return new TU16(ini, this.vars)},
            'TByte' : () => {return new TU8(ini, this.vars)},
            'TInteger' : () => {return new TS16(ini, this.vars)},
            /*TODO если параметр неизвестен, то всё равно его прочитать
            как TUnknown из него вытянуть адрес регистра - чтобы не пропускать
            номера регистров */
            'default': () => {
                console.log(`${ObjType} not found`)
                return undefined;
            }
        }
        return (ObjTypes[ObjType] || ObjTypes['default'])()
    }

    private parseListToMap(ParametersList: Array<string>) {
        ParametersList.forEach((item: string) => { 
            if (item[0] !== ';') {//если не комментарий
                let signal = this.factory(item);// получаю объект параметра
                if (signal !== undefined) {//и если он создался
                    let key: string = signal.name;//до добавляю в карту
                    this.ValuesMap.set(key, signal);
                }
            }
        })
    }    

}