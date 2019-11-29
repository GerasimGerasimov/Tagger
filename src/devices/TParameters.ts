//Контейнер для параметров из RAM/FLASH/CD
import { TVars } from './TVars'; // шкалы
import { TSignal } from './TSignal';
 
export class TParameters {
    private vars:TVars;
    private ValuesMap: Map<string, TSignal>;

    constructor (vars:TVars, ParametersList: Array<string>) {
        this.vars = vars;
        this.ValuesMap = new Map<string, TSignal>();
        this.parseListToMap(ParametersList); 
    }

    private parseListToMap(ParametersList: Array<string>) {
        ParametersList.forEach((item: string) => { 
            if (item[0] !== ';') {//если не комментарий
                console.log(item);
                let i = item.indexOf('=');
                let value = new TSignal(item, this.vars);
                let key: string = value.name;
                this.ValuesMap.set(key, value);
            }
        })
    }    

}