import { TVars } from './TVars'; // шкалы
import { TSignal } from './TSignal';
import { StrToFloat} from '../../utils/miscel'

//  s   [0]    [1]       [2]     [3]  [4]      [5]       [6]     [7]
//WORD=name/comments/objecttype/addr/mbreg/measure unit/scale/bytesize/
//advanced
//  s   [0]    [1]       [2]     [3]  [4]      [5]       [6]     [7]      [8]         [9]   [10]
//WORD=name/comments/objecttype/addr/mbreg/measure unit/scale/bytesize/IndepValueName/IC/BaseConst/

export class TU16 extends TSignal {
    
    constructor(ini: string, vars:TVars) {
        super(ini, vars);
        this.regStr = this.ini[4];
        if (this.regStr === '')
            this.notAddressable = true
        else
            this.regNum  = parseInt(this.regStr.slice(1,5),16);
        this.msu = this.ini[5];
        this.bytes  = 2;//всегда читает 16 бит регистр
        this.scaleStr= this.ini[6];
        //8 и 9 - опции и надо ориентироваться по кол-ву строк
        if (this.ini.length === 11) {
            this.depend  = this.ini[8];
            if (this.depend === '@' && (this.ini[9] == '')) {
                this.isMaster = true;
            } else {
                this.IC      = StrToFloat(this.ini[9]);
            }
        }
        this.base = parseInt(this.ini[this.ini.length - 1].slice(1,5), 16);//уставка - это последнее значение
        //получить значение шкалы
        this.scale = vars.getScale(this.scaleStr);
    }

    
    public setDataToParameter(data: Map<number, any>){
        let rawData = data.get(this.regNum);
        if (rawData === undefined) {
            this.value = null;
            return;
        }
        this.rawData = rawData;
        let value: Number = this.rawData * this.scale;
        this.value = `${value} ${this.msu}`;
    }
}