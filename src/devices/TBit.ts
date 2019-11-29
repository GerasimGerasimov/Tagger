import { TVars } from './TVars'; // шкалы
import { TSignal } from './TSignal';

//   s   [0]    [1]       [2]     [3]  [4]  [5]    [6]      [7]   [8]
//  BIT=name/comments/objecttype/addr/mask/mbreg/options/bytesize/base/
export class TBit extends TSignal {
    private mask: number = 0;//маска расположения бита в регистре
    
    constructor(ini: string, vars:TVars) {
        super(ini, vars);
        //this.mask = Number(this.ini[4]);
        this.regStr = this.ini[5];
        this.option = this.ini[6];
        this.bytes  = 2;//Number(this.ini[6]); всегда читает 16 бит регистр
        this.base   = this.ini[this.ini.length - 1];//уставка - это последнее значение
        //обработка rRRRR.M
        const reg = this.regStr.split(/[r.]/).splice(1);
        this.regNum =  parseInt(reg[0],16);
        this.mask   =  parseInt(reg[1],16);           
    }
    
}